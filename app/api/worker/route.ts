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

/** Build one focused search per task. The research endpoint charges one app search per call. */
function buildResearchQuery(args: {
  agentId: string;
  agentName: string;
  mission: string;
  title: string;
  description: string;
}) {
  const { agentId, agentName, mission, title, description } = args;
  const titleAndDescription = `${title} ${description}`.toLowerCase();

  // Specialized agents get a query matching their configured job, rather than
  // sending the entire task instructions to Google as one noisy query.
  if (agentId === "website-hunter" || /outdated|weak website|website quality/i.test(titleAndDescription)) {
    return 'Nigeria small businesses company website "contact" services';
  }
  if (agentId === "review-hunter" || /public reviews|customer experience|bad reviews/i.test(titleAndDescription)) {
    return 'Nigeria businesses customer reviews complaints service business';
  }
  if (agentId === "social-hunter" || /social presence|instagram|social media/i.test(titleAndDescription)) {
    return 'Nigeria small businesses Instagram Facebook business contact';
  }
  if (agentId === "market-hunter" || /market|niche|emerging opportunity/i.test(titleAndDescription)) {
    return 'Nigeria small business customer acquisition lead management market';
  }

  // Lead-research tasks should search for the target audience, not the full
  // multi-step instruction list. Keep the result explicitly as candidates.
  const audience = /school|academy|college/i.test(titleAndDescription)
    ? "Nigeria private schools academies official website contact"
    : /real estate|property/i.test(titleAndDescription)
      ? "Nigeria real estate agencies property businesses official website contact"
      : /agency|marketing/i.test(titleAndDescription)
        ? "Nigeria marketing agencies service businesses official website contact"
        : "Nigeria small businesses service companies official website contact";

  // Include agent context only when it contributes useful search terms.
  const context = `${agentName} ${mission}`.toLowerCase();
  const focus = /crm|lead|prospect|follow.?up|customer acquisition/.test(context)
    ? "lead generation customer follow-up"
    : "business services";
  return `${audience} ${focus}`.slice(0, 220);
}

export async function POST(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const workerId = `worker-${crypto.randomUUID()}`;

  let taskId = "";
  let agentId = "";
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
      RETURNING task.id, task.agent_id, task.mission_id, task.type, task.title, task.description, task.input
    `;

    if (!claimed.length) {
      return NextResponse.json({ ok: true, processed: false, message: "No eligible pending tasks." });
    }

    const task = claimed[0] as Record<string, unknown>;
    taskId = String(task.id);
    agentId = String(task.agent_id);
    const taskType = textValue(task.type, "manual").toLowerCase();
    const input = task.input && typeof task.input === "object"
      ? task.input as Record<string, unknown> : {};
    const title = textValue(input.title, textValue(task.title, taskType || "Task"));
    const description = textValue(input.description, textValue(task.description));

    const agents = await sql`
      SELECT name, mission, instructions, capabilities
      FROM public.agents WHERE id = ${agentId} LIMIT 1
    `;
    const agent = (agents[0] ?? {}) as Record<string, unknown>;
    const agentName = textValue(agent.name, agentId);
    const mission = textValue(agent.mission);
    const instructions = textValue(agent.instructions);

    await sql`
      INSERT INTO public.agent_runs (id, agent_id, task_id, status, summary, started_at)
      VALUES (${`run-${crypto.randomUUID()}`}, ${agentId}, ${taskId}, 'running', ${"Started: " + title}, NOW())
    `;

    const researchText = `${taskType} ${title} ${description} ${mission}`;
    const isResearch = /research|hunt|search|prospect|discover|market|find\s+\d+|small businesses|businesses that could benefit|website|reviews|social presence/i.test(researchText);

    if (isResearch) {
      const query = buildResearchQuery({ agentId, agentName, mission, title, description });
      const baseUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || request.nextUrl.origin;
      const adminKey = process.env.JABARI_ADMIN_API_KEY;

      if (!adminKey) {
        const reason = "JABARI_ADMIN_API_KEY is not configured for protected research.";
        await sql`UPDATE public.agent_tasks SET status='failed', error=${reason}, completed_at=NOW(), lease_until=NULL WHERE id=${taskId} AND lease_owner=${workerId}`;
        await sql`UPDATE public.agent_runs SET status='failed', summary=${reason}, finished_at=NOW() WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'`;
        return NextResponse.json({ ok: false, processed: true, taskId, status: "failed", error: reason }, { status: 500 });
      }

      const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/research?q=${encodeURIComponent(query)}`, {
        headers: { cookie: `${AGENT_SESSION_COOKIE}=${adminKey}`, accept: "application/json" },
        cache: "no-store",
        signal: AbortSignal.timeout(12000),
      });
      const research = await response.json().catch(() => ({})) as Record<string, unknown>;

      if (!response.ok) {
        const reason = textValue(research.error, `Research API returned HTTP ${response.status}`);
        await sql`UPDATE public.agent_tasks SET status='failed', error=${reason.slice(0, 1000)}, result=${JSON.stringify({ query })}::jsonb, completed_at=NOW(), lease_until=NULL WHERE id=${taskId} AND lease_owner=${workerId}`;
        await sql`UPDATE public.agent_runs SET status='failed', summary=${reason.slice(0, 1000)}, finished_at=NOW() WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'`;
        return NextResponse.json({ ok: false, processed: true, taskId, status: "failed", error: reason }, { status: 502 });
      }

      const results = Array.isArray(research.results) ? research.results : [];
      const result = {
        kind: "research",
        title,
        query,
        agentName,
        mission,
        instructions,
        research,
        candidateCount: results.length,
        requiresHumanReview: true,
        qualityNotice: "These are raw search-result candidates, not verified or qualified prospects. Open each source and confirm the business, contact details, and evidence before outreach.",
        note: "One search is used per task to respect the configured daily and monthly search caps. The worker does not contact prospects or make commitments.",
      };

      await sql`UPDATE public.agent_tasks SET status='completed', result=${JSON.stringify(result)}::jsonb, error=NULL, completed_at=NOW(), lease_until=NULL WHERE id=${taskId} AND lease_owner=${workerId}`;
      await sql`UPDATE public.agent_runs SET status='completed', summary=${"Research completed: " + title}, finished_at=NOW() WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'`;
      await sql`
        INSERT INTO public.activity_events (id, event_type, description, actor_type, actor_id, entity_type, entity_id, payload)
        VALUES (${`event-${crypto.randomUUID()}`}, 'task_completed', ${"Research task completed: " + title}, 'agent', ${agentId}, 'agent_task', ${taskId}, ${JSON.stringify({ title, type: taskType, resultCount: results.length, query })}::jsonb)
      `;
      return NextResponse.json({ ok: true, processed: true, taskId, status: "completed", result });
    }

    const result = {
      kind: "needs_review", title, description, agentName, mission, instructions,
      capabilities: Array.isArray(agent.capabilities) ? agent.capabilities : [],
      nextStep: "This task type has no safe executor connected yet. Add a specific executor before enabling automatic actions.",
      requiresHumanReview: true,
    };
    await sql`UPDATE public.agent_tasks SET status='waiting', result=${JSON.stringify(result)}::jsonb, error=NULL, completed_at=NOW(), lease_until=NULL WHERE id=${taskId} AND lease_owner=${workerId}`;
    await sql`UPDATE public.agent_runs SET status='waiting', summary=${"Parked for review: " + title}, finished_at=NOW() WHERE task_id=${taskId} AND agent_id=${agentId} AND status='running'`;
    return NextResponse.json({ ok: true, processed: true, taskId, status: "waiting", result });
  } catch (error) {
    console.error("Autonomous worker failed", { taskId, agentId, error });
    return NextResponse.json({ error: "Worker could not process a task. Check server logs and database schema." }, { status: 500 });
  }
}
