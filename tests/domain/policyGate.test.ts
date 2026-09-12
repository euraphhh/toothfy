import { describe, it, expect, vi } from "vitest";
import { policyGate, AiAgentAction } from "../../src/domain/policyGate";

vi.mock("../../src/db", () => ({
  withTenantContext: vi.fn(async (tenantId, callback) => {
    // Mock the transaction object
    const tx = {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue([{}])
      })
    };
    return callback(tx);
  }),
  db: {}
}));

describe("policyGate", () => {
  it("should auto-approve schedule_appointment", async () => {
    const action: AiAgentAction = { type: "schedule_appointment", payload: {} };
    const result = await policyGate("tenant-1", action);
    expect(result).toBe("executed");
  });

  it("should auto-approve propose_payment_plan if within limits", async () => {
    const action: AiAgentAction = { 
      type: "propose_payment_plan", 
      payload: { installments: 3, discount_percent: 0 } 
    };
    const result = await policyGate("tenant-1", action);
    expect(result).toBe("executed");
  });

  it("should require approval for propose_payment_plan if discount too high", async () => {
    const action: AiAgentAction = { 
      type: "propose_payment_plan", 
      payload: { installments: 3, discount_percent: 5 } 
    };
    const result = await policyGate("tenant-1", action);
    expect(result).toBe("pending_approval");
  });

  it("should require approval for propose_payment_plan if installments too high", async () => {
    const action: AiAgentAction = { 
      type: "propose_payment_plan", 
      payload: { installments: 6, discount_percent: 0 } 
    };
    const result = await policyGate("tenant-1", action);
    expect(result).toBe("pending_approval");
  });
});
