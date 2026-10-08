import type {AgentDefinition} from "./agent-types";
export type AgentTask={id:string;mission:string;payload:Record<string,unknown>};
export type AgentResult={status:"completed"|"failed"|"waiting";summary:string;createdTasks?:AgentTask[]};
export interface Agent{definition:AgentDefinition;run(task:AgentTask):Promise<AgentResult>;}
