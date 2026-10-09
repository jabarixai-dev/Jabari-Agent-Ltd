import { NextRequest, NextResponse } from "next/server";
import {
  updateAgent,
  type AgentStatus,
} from "../../../../lib/agents/agent-store";
import {
  isAgentAdmin,
  isSameOrigin,
} from "../../../../lib/agents/admin-auth";

export const runtime = "nodejs";

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  if (!isSameOrigin(request)) {
    return NextResponse.json(
      { error: "Invalid request origin." },
      { status: 403 }
    );
  }

  if (!isAgentAdmin(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id } = await context.params;
    const body: unknown = await request.json();

    const data =
      typeof body === "object" && body !== null
        ? (body as Record<string, unknown>)
        : {};

    const input: {
      name?: string;
      mission?: string;
      instructions?: string;
      capabilities?: string[];
      status?: AgentStatus;
    } = {};

    if (typeof data.name === "string") {
      const name = data.name.trim();

      if (!name || name.length > 100) {
        return NextResponse.json(
          { error: "Name must be 1–100 characters." },
          { status: 400 }
        );
      }

      input.name = name;
    }

    if (typeof data.mission === "string") {
      const mission = data.mission.trim();

      if (!mission || mission.length > 500) {
        return NextResponse.json(
          { error: "Mission must be 1–500 characters." },
          { status: 400 }
        );
      }

      input.mission = mission;
    }

    if (typeof data.instructions === "string") {
      const instructions = data.instructions.trim();

      if (instructions.length > 8000) {
        return NextResponse.json(
          { error: "Instructions must be 8,000 characters or fewer." },
          { status: 400 }
        );
      }

      input.instructions = instructions;
    }

    if (Array.isArray(data.capabilities)) {
      const rawCapabilities: unknown[] = data.capabilities;

      const capabilities: string[] = [
        ...new Set(
          rawCapabilities
            .filter((value): value is string => typeof value === "string")
            .map((value) => value.trim())
            .filter(Boolean)
        ),
      ].slice(0, 30);

      input.capabilities = capabilities;
    }

    if (
      data.status === "idle" ||
      data.status === "paused" ||
      data.status === "disabled"
    ) {
      input.status = data.status;
    }

    const agent = await updateAgent(id, input);

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ agent });
  } catch (error) {
    console.error("Agent update failed", error);

    return NextResponse.json(
      { error: "Could not update agent. Check migration 005 and DATABASE_URL." },
      { status: 500 }
    );
  }
}
