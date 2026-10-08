import type {AgentDefinition} from "./types";
const defs:AgentDefinition[]=[
{id:"website-hunter",name:"Website Hunter",mission:"Find businesses with weak, outdated or conversion-poor websites.",status:"idle",capabilities:["web-research","prospect-discovery"]},
{id:"review-hunter",name:"Review Hunter",mission:"Find businesses showing customer-experience opportunities through public reviews.",status:"idle",capabilities:["review-research","prospect-discovery"]},
{id:"social-hunter",name:"Social Hunter",mission:"Find businesses with weak or inconsistent social presence.",status:"idle",capabilities:["social-research","prospect-discovery"]},
{id:"market-hunter",name:"Market Hunter",mission:"Discover emerging markets, niches and commercial opportunities.",status:"idle",capabilities:["market-research","trend-discovery"]},
{id:"lead-researcher",name:"Lead Researcher",mission:"Enrich promising prospects and turn discoveries into qualified opportunities.",status:"idle",capabilities:["research","qualification"]},
{id:"sales-agent",name:"Sales Agent",mission:"Execute approved sales actions and move qualified opportunities forward.",status:"idle",capabilities:["outreach","sales"]},
{id:"follow-up-agent",name:"Follow-up Agent",mission:"Re-engage active opportunities according to approved follow-up rules.",status:"idle",capabilities:["follow-up","sales"]}];
export function getAgentDefinitions(){return defs;}