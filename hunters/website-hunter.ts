import type { AgentDefinition } from "../agent-types";

export const website_hunter: AgentDefinition = {
  id: "website-hunter",
  name: "Website Hunter",
  mission: "Find businesses with weak, outdated or conversion-poor websites.",
  status: "idle",
  capabilities: ["web-research", "prospect-discovery"]
};
