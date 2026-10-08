import type { AgentDefinition } from "../agent-types";

export const review_hunter: AgentDefinition = {
  id: "review-hunter",
  name: "Review Hunter",
  mission: "Find businesses showing customer-experience opportunities through public reviews.",
  status: "idle",
  capabilities: ["review-research", "prospect-discovery"]
};
