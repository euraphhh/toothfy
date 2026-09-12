import { db, withTenantContext } from "@/db";
import { aiAgentActions } from "@/db/schema";
import { v4 as uuidv4 } from "uuid";

export type AiAgentAction = 
  | { type: 'schedule_appointment'; payload: any }
  | { type: 'reschedule_appointment'; payload: any }
  | { type: 'propose_payment_plan'; payload: { installments: number; discount_percent?: number; [key: string]: any } };

export async function policyGate(tenantId: string, action: AiAgentAction): Promise<'executed' | 'pending_approval'> {
  const mockPolicy = {
    maxAutoApprovalInstallments: 3,
    maxAutoApprovalDiscount: 0,
  };

  let status: 'executed' | 'pending_approval' = 'executed';
  let requiredApproval = false;

  if (action.type === 'propose_payment_plan') {
    const withinAutoApprovalLimits =
      action.payload.installments <= mockPolicy.maxAutoApprovalInstallments &&
      (action.payload.discount_percent ?? 0) <= mockPolicy.maxAutoApprovalDiscount;
    
    status = withinAutoApprovalLimits ? 'executed' : 'pending_approval';
    requiredApproval = !withinAutoApprovalLimits;
  }

  // Registra a ação no banco de dados para trilha de auditoria e pendências
  await withTenantContext(tenantId, async (tx) => {
    await tx.insert(aiAgentActions).values({
      id: uuidv4(),
      tenantId,
      actionType: action.type,
      payload: action.payload,
      status: status,
      requiredApproval: requiredApproval
    });
  });

  return status;
}
