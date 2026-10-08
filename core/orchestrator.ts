import { AgentRuntime } from '../agents/runtime';
import type { AgentContext, AgentResult, AgentTask } from '../agents/types';

export class Orchestrator {
  constructor(private readonly runtime: AgentRuntime) {}

  async dispatch(task: AgentTask, context: Omit<AgentContext,'task'>): Promise<AgentResult> {
    return this.runtime.execute(task.agentId, {...context,task});
  }
}
