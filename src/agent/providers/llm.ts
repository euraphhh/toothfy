import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "dummy",
});

export async function processConversation(messages: any[], tools: any[]) {
  // Ignora chamadas reais se a key não estiver configurada no ambiente local
  if (process.env.ANTHROPIC_API_KEY === undefined) {
    console.warn("[LLM Provider] No API key, mocking response");
    return {
      stop_reason: "end_turn",
      content: [{ type: "text", text: "Estou em modo de desenvolvimento (API Key ausente)." }]
    };
  }

  const response = await anthropic.messages.create({
    model: "claude-3-5-sonnet-20241022",
    max_tokens: 1024,
    system: "Você é um assistente virtual da clínica odontológica Toothfy. Você é extremamente educado, conciso e atende os pacientes via WhatsApp. Sua principal função é ler disponibilidades e agendar consultas.",
    messages: messages,
    tools: tools,
  });

  return response;
}
