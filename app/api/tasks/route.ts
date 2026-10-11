import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAgentAdmin, isSameOrigin } from "../../../lib/agents/admin-auth";

export const runtime = "nodejs";

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

export async function GET(request: NextRequest) {
  if (!isAgentAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const sql = db();
    const rows = await sql`
      SELECT t.id, t.agent_id, a.name AS agent_name, t.mission_id,
             m.name AS mission_name, t.type, t.input, t.status, t.created_at
      FROM public.agent_tasks t
      LEFT JOIN public.agents a ON a.id = t.agent_id
      LEFT JOIN public.missions m ON m.id = t.mission_id
      ORDER BY t.created_at DESC
      LIMIT 100
    `;
    const tasks = rows.map((row: Record<string, unknown>) => {
      const input = row.input && typeof row.input === "object"
        ? row.input as Record<string, unknown>
        : {};
      return {
        ...row,
        title: typeof input.title === "string" ? input.title : String(row.type ?? "Task"),
        description: typeof input.description === "string" ? input.description : "",
      };
    });
    return NextResponse.json({ tasks });
  } catch (error) {
    console.error("Task list failed", error);
    return NextResponse.json({ error: "Could not load tasks." }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Invalid request origin." }, { status: 403 });
  }
  if (!isAgentAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body: unknown = await request.json();
    const data = typeof body === "object" && body !== null ? body as Record<string, unknown> : {};
    const agentId = typeof data.agentId === "string" ? data.agentId.trim() : "";
    const missionId = typeof data.missionId === "string" ? data.missionId.trim() : "";
    const title = typeof data.title === "string" ? data.title.trim() : "";
    const description = typeof data.description === "string" ? data.description.trim() : "";
    const type = typeof data.type === "string" && data.type.trim() ? data.type.trim() : "manual";

    if (!agentId || !missionId || !title) {
      return NextResponse.json({ error: "Choose an agent and mission, and enter a task title." }, { status: 400 });
    }
    if (title.length > 160 || description.length > 2000 || type.length > 80) {
      return NextResponse.json({ error: "Task title, description, or type is too long." }, { status: 400 });
    }

    const sql = db();
    const agents = await sql`SELECT id, name, status FROM public.agents WHERE id = ${agentId} LIMIT 1`;
    if (!agents.length) {
      return NextResponse.json({ error: "The selected agent does not exist." }, { status: 404 });
    }
    if (agents[0].status === "paused" || agents[0].status === "disabled") {
      return NextResponse.json({ error: "Resume or enable this agent before assigning a task." }, { status: 409 });
    }

    const missions = await sql`SELECT id FROM public.missions WHERE id = ${missionId}::uuid LIMIT 1`;
    if (!missions.length) {
      return NextResponse.json({ error: "The selected mission does not exist." }, { status: 404 });
    }

    const input = JSON.stringify({ title, description, requestedBy: "command-center" });
    const rows = await sql`
      INSERT INTO public.agent_tasks (agent_id, mission_id, type, input, status)
      VALUES (${agentId}, ${missionId}::uuid, ${type}, ${input}::jsonb, 'pending')
      RETURNING id, agent_id, mission_id, type, input, status, created_at
    `;
    const row = rows[0] as Record<string, unknown>;
    return NextResponse.json({
      task: {
        ...row,
        title,
        description,
      },
      message: "Task saved as pending. An execution worker is not connected yet, so the agent has not run this task.",
    }, { status: 201 });
  } catch (error) {
    console.error("Task creation failed", error);
    return NextResponse.json({ error: "Could not create task." }, { status: 500 });
  }
}
