export type AgentStatus="idle"|"running"|"paused"|"disabled";
export type TaskStatus="pending"|"claimed"|"running"|"waiting"|"completed"|"failed"|"cancelled";
export type AgentDefinition={id:string;name:string;mission:string;status:AgentStatus;capabilities:string[]};
