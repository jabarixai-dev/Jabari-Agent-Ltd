import type { AgentDefinition } from "../agent-types";

export const social_hunter: AgentDefinition = {
  id: "social-hunter",
  name: "Social Hunter",
  mission: "Find businesses with weak or inconsistent social presence.",
  status: "idle",
  capabilities: ["social-research", "prospect-discovery"]
};
