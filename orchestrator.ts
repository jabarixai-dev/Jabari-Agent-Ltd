import type {AgentTask} from "../agents/runtime";
export class Orchestrator{
  async dispatch(task:AgentTask){return {accepted:true,taskId:task.id};}
}