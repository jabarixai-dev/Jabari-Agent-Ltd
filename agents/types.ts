export type AgentStatus = 'ready' | 'active' | 'paused' | 'error';
export type TaskStatus = 'pending' | 'claimed' | 'running' | 'waiting' | 'completed' | 'failed' | 'cancelled';
export type AutomationMode = 'autonomous' | 'manual' | 'approval_required' | 'paused';

export interface AgentDefinition { id:string; name:string; mission:string; capabilities:string[]; defaultStatus:AgentStatus; }
export interface AgentTask { id:string; agentId:string; missionId?:string; type:string; input:Record<string,unknown>; status:TaskStatus; createdAt:string; }
export interface AgentResult { status:'completed'|'waiting'|'failed'; summary:string; data?:Record<string,unknown>; nextTasks?:Array<Omit<AgentTask,'id'|'createdAt'|'status'>>; }
export interface AgentContext { task:AgentTask; automationMode:AutomationMode; tools:Record<string,unknown>; }
export interface Agent { definition:AgentDefinition; run(context:AgentContext):Promise<AgentResult>; }
