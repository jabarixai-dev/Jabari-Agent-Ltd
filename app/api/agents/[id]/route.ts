import { NextRequest, NextResponse } from "next/server";
import { updateAgent, type AgentStatus } from "../../../../lib/agents/agent-store";
import { isAgentAdmin, isSameOrigin } from "../../../../lib/agents/admin-auth";
export const runtime = "nodejs";
export async function PATCH(request:NextRequest,context:{params:Promise<{id:string}>}) {
  if(!isSameOrigin(request))return NextResponse.json({error:"Invalid request origin."},{status:403});
  if(!isAgentAdmin(request))return NextResponse.json({error:"Unauthorized"},{status:401});
  try {
    const {id}=await context.params; const body=await request.json();
    const input:{name?:string;mission?:string;instructions?:string;capabilities?:string[];status?:AgentStatus}={};
    if(typeof body?.name==="string"){input.name=body.name.trim();if(!input.name||input.name.length>100)return NextResponse.json({error:"Name must be 1–100 characters."},{status:400});}
    if(typeof body?.mission==="string"){input.mission=body.mission.trim();if(!input.mission||input.mission.length>500)return NextResponse.json({error:"Mission must be 1–500 characters."},{status:400});}
    if(typeof body?.instructions==="string"){input.instructions=body.instructions.trim();if(input.instructions.length>8000)return NextResponse.json({error:"Instructions must be 8,000 characters or fewer."},{status:400});}
    if(Array.isArray(body?.capabilities))input.capabilities=[...new Set(body.capabilities.filter((v:unknown):v is string=>typeof v==="string").map((v:string)=>v.trim()).filter(Boolean))].slice(0,30);
    if(["idle","paused","disabled"].includes(body?.status))input.status=body.status as AgentStatus;
    const agent=await updateAgent(id,input);
    if(!agent)return NextResponse.json({error:"Agent not found."},{status:404});
    return NextResponse.json({agent});
  } catch(error){console.error("Agent update failed",error);return NextResponse.json({error:"Could not update agent. Check migration 005 and DATABASE_URL."},{status:500});}
}
