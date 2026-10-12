import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { AGENT_SESSION_COOKIE } from "../../../lib/agents/admin-auth";

export const runtime = "nodejs";
export const maxDuration = 30;

function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is not configured");
  return neon(url);
}

function textValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function authorized(request: NextRequest) {
  const adminKey = process.env.JABARI_ADMIN_API_KEY;
  const cookieKey = request.cookies.get(AGENT_SESSION_COOKIE)?.value;
  const workerSecret = process.env.JABARI_WORKER_SECRET;
  return Boolean(
    (adminKey && cookieKey === adminKey) ||
    (workerSecret && request.headers.get("authorization") === `Bearer ${workerSecret}`)
  );
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workerId = `worker-${crypto.randomUUID()}`;

  try {
    const sql = db();
    const claimed = await sql`
      UPDATE public.agent_tasks AS task
      SET status = 'running', lease_owner = ${workerId},
          lease_until = NOW() + INTERVAL '2 minutes', heartbeat_at = NOW(),
          started_at = COALESCE(started_at, NOW()), error = NULL
      WHERE task.id = (
        SELECT queued.id
        FROM public.agent_tasks AS queued
        JOIN public.agents AS agent ON agent.id = queued.agent_id
        WHERE queued.status = 'pending'
          AND agent.status NOT IN ('paused', 'disabled')
        ORDER BY queued.created_at ASC
        FOR UPDATE OF queued SKIP LOCKED LIMIT 1
      )
      RETURNING task.id, task.agent_id, task.mission_id, task.type, task.input
    `;

    if (!claimed.length) return NextResponse.json({
      ok: true, processed: false, message: "No eligible pending tasks."
    });

    const task = claimed[0] as Record<string, unknown>;
    const taskId = String(task.id);
    const agentId = String(task.agent_id);
    const taskType = textValue(task.type, "manual").toLowerCase();
    const input = task.input && typeof task.input === "object"
      ? task.input as Record<string, unknown> : {};
    const title = textValue(input.title, taskType || "Task");
    const description = textValue(input.description);

    const agents = await sql`
      SELECT name, mission, instructions, capabilities
      FROM public.agents WHERE id = ${agentId} LIMIT 1
    `;
    const agent = (agents[0] ?? {}) as Record<string, unknown>;

    await sql`
      INSERT INTO public.agent_runs (agent_id, task_id, status, summary, started_at)
      VALUES (${agentId}, ${taskId}, 'running', ${"Started: " + title}, NOW())
    `;

    // Existing tasks may be titled "manual"; their descriptions contain the
    // real request. Detect research from type + title + description.
    const researchText = `${taskType} ${title} ${description}`;
    const isResearch = /research|hunt|search|prospect|discover|market|find\s+\d+|small businesses|businesses that could benefit/i.test(researchText);

    if (isResearch) {
      const query = [description, title, taskType].filter(Boolean).join(" ").slice(0, 220);
      const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || request.nextUrl.origin;
      const adminKey = process.env.JABARI_ADMIN_API_KEY;

      if (!adminKey) {
        const reason = "JABARI_ADMIN_API_KEY is not configured for protected research.";
        await sql`
          UPDATE public.agent_tasks SET status='failed', error=${reason},
            completed_at=NOW(), lease_until=NULL
          WHERE id=${taskId} AND lease_owner=${workerId}
        `;
        await sql`
          UPDATE public.agent_runs SET status='failed', summary=${reason}, finished_at=NOW()
          WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'
        `;
        return NextResponse.json({ ok:false, processed:true, taskId, status:"failed", error:reason }, { status:500 });
      }

      const response = await fetch(
        `${baseUrl.replace(/\/$/, "")}/api/research?q=${encodeURIComponent(query)}`,
        {
          headers: { cookie: `${AGENT_SESSION_COOKIE}=${adminKey}`, accept: "application/json" },
          cache: "no-store",
          signal: AbortSignal.timeout(12000)
        }
      );
      const research = await response.json().catch(() => ({})) as Record<string, unknown>;

      if (!response.ok) {
        const reason = textValue(research.error, `Research API returned HTTP ${response.status}`);
        await sql`
          UPDATE public.agent_tasks SET status='failed', error=${reason.slice(0,1000)},
            result=${JSON.stringify({query})}::jsonb, completed_at=NOW(), lease_until=NULL
          WHERE id=${taskId} AND lease_owner=${workerId}
        `;
        await sql`
          UPDATE public.agent_runs SET status='failed', summary=${reason.slice(0,1000)}, finished_at=NOW()
          WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'
        `;
        return NextResponse.json({ ok:false, processed:true, taskId, status:"failed", error:reason }, { status:502 });
      }

      const results = Array.isArray(research.results) ? research.results : [];
      const result = {
        kind:"research", title, query, agentName:textValue(agent.name,agentId),
        mission:textValue(agent.mission), instructions:textValue(agent.instructions),
        research, requiresHumanReview:true,
        note:"Research results are collected for review. The worker does not contact prospects or make commitments."
      };
      await sql`
        UPDATE public.agent_tasks SET status='completed',
          result=${JSON.stringify(result)}::jsonb, error=NULL, completed_at=NOW(), lease_until=NULL
        WHERE id=${taskId} AND lease_owner=${workerId}
      `;
      await sql`
        UPDATE public.agent_runs SET status='completed',
          summary=${"Research completed: " + title}, finished_at=NOW()
        WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'
      `;
      await sql`
        INSERT INTO public.activity_events (actor_type, actor_id, event_type, entity_type, entity_id, payload)
        VALUES ('agent', ${agentId}, 'task_completed', 'agent_task', ${taskId},
          ${JSON.stringify({title, type:taskType, resultCount:results.length})}::jsonb)
      `;
      return NextResponse.json({ok:true, processed:true, taskId, status:"completed", result});
    }

    const result = {
      kind:"needs_review", title, description, agentName:textValue(agent.name,agentId),
      mission:textValue(agent.mission), instructions:textValue(agent.instructions),
      capabilities:Array.isArray(agent.capabilities) ? agent.capabilities : [],
      nextStep:"This task type has no safe executor connected yet. Add a specific executor before enabling automatic actions.",
      requiresHumanReview:true
    };
    await sql`
      UPDATE public.agent_tasks SET status='waiting', result=${JSON.stringify(result)}::jsonb,
        error=NULL, completed_at=NOW(), lease_until=NULL
      WHERE id=${taskId} AND lease_owner=${workerId}
    `;
    await sql`
      UPDATE public.agent_runs SET status='waiting', summary=${"Parked for review: " + title},
        finished_at=NOW()
      WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'
    `;
    return NextResponse.json({ok:true, processed:true, taskId, status:"waiting", result});
  } catch (error) {
    console.error("Autonomous worker failed", error);
    return NextResponse.json(
      {error:"Worker could not process a task. Check server logs and database schema."},
      {status:500}
    );
  }
}
