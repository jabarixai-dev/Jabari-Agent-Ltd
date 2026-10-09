import { NextRequest } from "next/server";
export const AGENT_SESSION_COOKIE = "jabari_agent_admin";
export function isAgentAdmin(request: NextRequest): boolean {
  const expected = process.env.JABARI_ADMIN_API_KEY;
  const supplied = request.cookies.get(AGENT_SESSION_COOKIE)?.value;
  return Boolean(expected && supplied && supplied === expected);
}
export function isSameOrigin(request: NextRequest): boolean {
  const origin = request.headers.get("origin");
  if (!origin) return true; // Non-browser clients may omit Origin; cookie auth remains required.
  try { return new URL(origin).host === request.headers.get("host"); } catch { return false; }
}
