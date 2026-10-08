import type { AgentDefinition } from "../agent-types";

export const follow_up_agent: AgentDefinition = {
  id: "follow-up-agent",
  name: "Follow-up Agent",
  mission: "Re-engage active opportunities according to approved follow-up rules.",
  status: "idle",
  capabilities: ["follow-up", "sales"]
};
