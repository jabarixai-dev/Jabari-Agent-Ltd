import type { Agent, AgentContext, AgentResult } from './types';

export class AgentRuntime {
  constructor(private readonly agents: Map<string, Agent>) {}

  async execute(agentId: string, context: AgentContext): Promise<AgentResult> {
    const agent = this.agents.get(agentId);
    if (!agent) throw new Error(`Agent not registered: ${agentId}`);
    if (context.automationMode === 'paused') return {status:'waiting',summary:'Execution paused by operator.'};
    return agent.run(context);
  }
}
