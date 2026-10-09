import { neon } from "@neondatabase/serverless";

export type AgentStatus = "idle" | "running" | "paused" | "disabled";
export type StoredAgent = {
  id: string; name: string; mission: string; status: AgentStatus;
  automation_mode: string; capabilities: string[]; config: Record<string, unknown>;
  instructions: string; is_system: boolean; created_at: string; updated_at: string;
};
function database() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}
export async function listAgents(): Promise<StoredAgent[]> {
  const sql = database();
  return await sql`SELECT id,name,mission,status,automation_mode,capabilities,config,instructions,is_system,created_at,updated_at FROM agents ORDER BY created_at ASC,name ASC` as unknown as StoredAgent[];
}
export async function createAgent(input: {id:string;name:string;mission:string;instructions:string;capabilities:string[]}) {
  const sql = database();
  const rows = await sql`
    INSERT INTO agents (id,name,mission,status,automation_mode,capabilities,config,instructions,is_system)
    VALUES (${input.id},${input.name},${input.mission},'idle','approval_required',${JSON.stringify(input.capabilities)}::jsonb,'{}'::jsonb,${input.instructions},FALSE)
    RETURNING id,name,mission,status,automation_mode,capabilities,config,instructions,is_system,created_at,updated_at`;
  return rows[0] as unknown as StoredAgent;
}
export async function updateAgent(id:string,input:{name?:string;mission?:string;instructions?:string;capabilities?:string[];status?:AgentStatus}) {
  const sql = database();
  const rows = await sql`
    UPDATE agents SET name=COALESCE(${input.name ?? null},name),
    mission=COALESCE(${input.mission ?? null},mission),
    instructions=COALESCE(${input.instructions ?? null},instructions),
    capabilities=COALESCE(${input.capabilities ? JSON.stringify(input.capabilities) : null}::jsonb,capabilities),
    status=COALESCE(${input.status ?? null},status),updated_at=NOW()
    WHERE id=${id}
    RETURNING id,name,mission,status,automation_mode,capabilities,config,instructions,is_system,created_at,updated_at`;
  return rows[0] as unknown as StoredAgent | undefined;
}
