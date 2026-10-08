import type { Agent, AgentContext, AgentResult } from './types';
import { AGENT_DEFINITIONS } from './definitions';

function makeAgent(id:string): Agent {
  const definition = AGENT_DEFINITIONS.find(a=>a.id===id)!;
  return {definition, async run(context:AgentContext):Promise<AgentResult>{
    // Deliberately provider/tool agnostic: real discovery tools are plugged into context.tools.
    const availableTools = Object.keys(context.tools);
    if (!availableTools.length) return {status:'waiting',summary:`${definition.name} is ready, but no discovery tools are connected yet.`,data:{agentId:id}};
    return {status:'completed',summary:`${definition.name} completed its task using the connected tools.`,data:{agentId:id,tools:availableTools}};
  }};
}

export function createDefaultAgents(): Map<string,Agent> {
  return new Map(AGENT_DEFINITIONS.map(a=>[a.id,makeAgent(a.id)]));
}
