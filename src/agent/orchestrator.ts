import { processConversation } from "./providers/llm";
import { sendWhatsAppMessage } from "./providers/whatsapp";
import { policyGate } from "@/domain/policyGate";

export async function handleWhatsAppMessage(phoneNumber: string, message: any) {
  console.log(`[Orchestrator] Processing message from ${phoneNumber}:`, message);
  
  const text = message?.text?.body;
  if (!text) return; // Para o MVP inicial, pulamos o tratamento de áudio (Whisper) e anexos
  
  // 1. Recuperar histórico do banco (mockado para o MVP)
  const history = [{ role: "user", content: text }];

  // 2. Declarar as Tools disponíveis para o LLM (baseadas no Zod schema já criado)
  const tools = [
    {
      name: "get_availability",
      description: "Retorna a disponibilidade de horários na agenda da clínica",
      input_schema: {
        type: "object",
        properties: {
          professional_id: { type: "string", description: "ID opcional do profissional" },
          date_range: { 
             type: "object",
             properties: { from: { type: "string" }, to: { type: "string" } },
             required: ["from", "to"]
          }
        },
        required: ["date_range"]
      }
    },
    {
       name: "schedule_appointment",
       description: "Agenda uma consulta com o profissional.",
       input_schema: {
         type: "object",
         properties: {
           idempotency_key: { type: "string" },
           patient_id: { type: "string" },
           professional_id: { type: "string" },
           starts_at: { type: "string" }
         },
         required: ["idempotency_key", "patient_id", "professional_id", "starts_at"]
       }
    }
  ];

  try {
    // 3. Chamada ao provedor LLM (Anthropic)
    const response = await processConversation(history as any, tools);
    
    // 4. Lidar com o retorno (Tool Call ou Resposta em Texto)
    if (response.stop_reason === "tool_use") {
       const toolCall = response.content.find((c: any) => c.type === "tool_use") as any;
       
       if (toolCall && toolCall.name === "schedule_appointment") {
         // Chamada blindada passando pelo Policy Gate (Domain Layer)
         const action = { type: 'schedule_appointment', payload: toolCall.input } as any;
         
         // Mock de tenantId para MVP, no real buscaríamos o vínculo do número com a clínica
         const tenantId = "00000000-0000-0000-0000-000000000000";
         const status = await policyGate(tenantId, action);
         
         if (status === 'executed') {
           await sendWhatsAppMessage(phoneNumber, "Ótimo! Sua consulta foi agendada com sucesso.");
         } else {
           await sendWhatsAppMessage(phoneNumber, "Recebemos sua solicitação de agendamento! A equipe vai avaliar e já retorna.");
         }
       } else if (toolCall && toolCall.name === "get_availability") {
         // Tool de leitura não passa no Policy Gate
         await sendWhatsAppMessage(phoneNumber, "Buscando os horários disponíveis...");
         // Chamaria a lógica de DB real aqui e injetaria de volta no LLM...
       }
    } else {
       // Retorno puro em texto (Conversacional)
       const txt = response.content.find((c: any) => c.type === "text") as any;
       if (txt && txt.text) {
         await sendWhatsAppMessage(phoneNumber, txt.text);
       }
    }

  } catch (err) {
    console.error("[Orchestrator] Error processing:", err);
  }
}
