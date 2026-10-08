import type { AgentDefinition } from "../agent-types";

export const sales_agent: AgentDefinition = {
  id: "sales-agent",
  name: "Sales Agent",
  mission: "Execute approved sales actions and move qualified opportunities forward.",
  status: "idle",
  capabilities: ["outreach", "sales"]
};
