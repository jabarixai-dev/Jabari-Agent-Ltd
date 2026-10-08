import type { AgentDefinition } from './types';

export const AGENT_DEFINITIONS: AgentDefinition[] = [
  {id:'website-hunter',name:'Website Hunter',mission:'Find businesses with weak, outdated or conversion-poor websites.',capabilities:['prospect_discovery','website_analysis','opportunity_scoring'],defaultStatus:'ready'},
  {id:'review-hunter',name:'Review Hunter',mission:'Find businesses where customer reviews reveal fixable experience problems.',capabilities:['prospect_discovery','review_analysis','opportunity_scoring'],defaultStatus:'ready'},
  {id:'social-hunter',name:'Social Hunter',mission:'Find businesses with clear content and social growth opportunities.',capabilities:['prospect_discovery','social_analysis','opportunity_scoring'],defaultStatus:'ready'},
  {id:'market-hunter',name:'Market Hunter',mission:'Detect emerging markets, niches and commercial opportunities.',capabilities:['market_research','trend_detection','opportunity_scoring'],defaultStatus:'ready'},
  {id:'lead-researcher',name:'Lead Researcher',mission:'Turn promising prospects into researched, qualified opportunities.',capabilities:['research','enrichment','qualification'],defaultStatus:'ready'},
  {id:'sales-agent',name:'Sales Agent',mission:'Execute approved outreach and move qualified opportunities forward.',capabilities:['outreach','conversation','qualification'],defaultStatus:'ready'},
  {id:'follow-up-agent',name:'Follow-up Agent',mission:'Re-engage active opportunities according to approved rules.',capabilities:['follow_up','conversation','pipeline_management'],defaultStatus:'ready'},
];
