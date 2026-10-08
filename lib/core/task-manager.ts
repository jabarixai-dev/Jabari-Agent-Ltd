import type {TaskStatus} from "../agents/types";
export type Task={id:string;missionId:string;agentId:string;status:TaskStatus;payload:Record<string,unknown>};
