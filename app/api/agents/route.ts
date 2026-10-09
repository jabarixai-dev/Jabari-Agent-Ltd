import { NextRequest, NextResponse } from "next/server";
import { createAgent, listAgents } from "../../../lib/agents/agent-store";
import { isAgentAdmin, isSameOrigin } from "../../../lib/agents/admin-auth";
export const runtime = "nodejs";
export async function GET(request:NextRequest) {
  if (!isAgentAdmin(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try { return NextResponse.json({agents:await listAgents()}); }
  catch(error) { console.error("Agent list failed",error); return NextResponse.json({error:"Could not load agents. Check migration 005 and DATABASE_URL."},{status:500}); }
}
export async function POST(request:NextRequest) {
  if (!isSameOrigin(request)) return NextResponse.json({error:"Invalid request origin."},{status:403});
  if (!isAgentAdmin(request)) return NextResponse.json({error:"Unauthorized"},{status:401});
  try {
    const body=await request.json();
    const name=typeof body?.name==="string"?body.name.trim():"";
    const mission=typeof body?.mission==="string"?body.mission.trim():"";
    const instructions=typeof body?.instructions==="string"?body.instructions.trim():"";
    const capabilities=Array.isArray(body?.capabilities)?[...new Set(body.capabilities.filter((v:unknown):v is string=>typeof v==="string").map((v:string)=>v.trim()).filter(Boolean))].slice(0,30):[];
    if(!name||name.length>100)return NextResponse.json({error:"Name is required (maximum 100 characters)."},{status:400});
    if(!mission||mission.length>500)return NextResponse.json({error:"Mission is required (maximum 500 characters)."},{status:400});
    if(instructions.length>8000)return NextResponse.json({error:"Instructions must be 8,000 characters or fewer."},{status:400});
    const raw=typeof body?.id==="string"&&body.id.trim()?body.id.trim():name;
    const id=raw.normalize("NFKD").replace(/[^a-zA-Z0-9_-]+/g,"-").replace(/^-+|-+$/g,"").toLowerCase().slice(0,80);
    if(!id)return NextResponse.json({error:"Could not create a valid ID."},{status:400});
    const agent=await createAgent({id,name,mission,instructions,capabilities});
    return NextResponse.json({agent}, {status:201});
  } catch(error) {
    const message=error instanceof Error?error.message:"";
    if(/duplicate key|unique constraint/i.test(message))return NextResponse.json({error:"That agent ID already exists. Choose another ID."},{status:409});
    console.error("Agent creation failed",error); return NextResponse.json({error:"Could not create agent. Confirm migration 005 and DATABASE_URL."},{status:500});
  }
}
