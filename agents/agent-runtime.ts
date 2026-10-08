import type {AgentDefinition} from "./types";
export type AgentTask={id:string;mission:string;payload:Record<string,unknown>};
export type AgentResult={status:"completed"|"failed"|"waiting";summary:string;createdTasks?:AgentTask[]};
export interface Agent{definition:AgentDefinition;run(task:AgentTask):Promise<AgentResult>;}