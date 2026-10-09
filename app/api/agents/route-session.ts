import { NextRequest, NextResponse } from "next/server";
import { AGENT_SESSION_COOKIE, isSameOrigin } from "../../../../lib/agents/admin-auth";
export const runtime = "nodejs";
export async function POST(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  const expected = process.env.JABARI_ADMIN_API_KEY;
  if (!expected) return NextResponse.json({error:"JABARI_ADMIN_API_KEY is not configured in the deployment environment."},{status:503});
  let body: {key?:unknown};
  try { body = await request.json(); } catch { return NextResponse.json({error:"Invalid request."},{status:400}); }
  if (typeof body.key !== "string" || body.key !== expected) return NextResponse.json({error:"Access key is incorrect."},{status:401});
  const response = NextResponse.json({ok:true});
  response.cookies.set(AGENT_SESSION_COOKIE, expected, {httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"strict",path:"/",maxAge:60*60*8});
  return response;
}
export async function DELETE(request: NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  const response = NextResponse.json({ok:true});
  response.cookies.set(AGENT_SESSION_COOKIE,"",{httpOnly:true,secure:process.env.NODE_ENV === "production",sameSite:"strict",path:"/",maxAge:0});
  return response;
}
