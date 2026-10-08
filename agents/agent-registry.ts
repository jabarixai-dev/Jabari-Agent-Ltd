import type { AgentDefinition } from "./agent-types";
import { website_hunter } from "./hunters/website-hunter";
import { review_hunter } from "./hunters/review-hunter";
import { social_hunter } from "./hunters/social-hunter";
import { market_hunter } from "./hunters/market-hunter";
import { lead_researcher } from "./research/lead-researcher";
import { sales_agent } from "./sales/sales-agent";
import { follow_up_agent } from "./sales/follow-up-agent";

export const AGENT_REGISTRY: AgentDefinition[] = [
  website_hunter, review_hunter, social_hunter, market_hunter,
  lead_researcher, sales_agent, follow_up_agent
];

export function getAgentDefinitions(): AgentDefinition[] {
  return AGENT_REGISTRY;
}
