import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAgentAdmin, isSameOrigin } from "../../../lib/agents/admin-auth";
export const runtime = "nodejs";
function db(){const u=process.env.DATABASE_URL;if(!u)throw new Error("DATABASE_URL is not configured");return neon(u);}
export async function GET(req:NextRequest){
 if(!isAgentAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const s=db();const [prospects,opportunities,conversations,deals,revenue,activity]=await Promise.all([
 s`SELECT * FROM public.prospects ORDER BY created_at DESC LIMIT 200`,
 s`SELECT * FROM public.opportunities ORDER BY created_at DESC LIMIT 200`,
 s`SELECT * FROM public.conversations ORDER BY created_at DESC LIMIT 200`,
 s`SELECT * FROM public.deals ORDER BY created_at DESC LIMIT 200`,
 s`SELECT * FROM public.revenue_entries ORDER BY received_at DESC LIMIT 200`,
 s`SELECT id,event_type,description,actor_type,actor_id,entity_type,entity_id,metadata,payload,created_at FROM public.activity_events ORDER BY created_at DESC LIMIT 100`]);
 const received=revenue.filter((x:any)=>["received","manual"].includes(x.kind)).reduce((n:number,x:any)=>n+Number(x.amount||0),0);
 const opportunityValue=opportunities.reduce((n:number,x:any)=>n+Number(x.value??x.estimated_value??0),0);
 return NextResponse.json({prospects,opportunities,conversations,deals,revenue,activity,totals:{prospects:prospects.length,opportunities:opportunities.length,conversations:conversations.length,deals:deals.length,receivedRevenue:received,opportunityValue}});
 }catch(e){console.error("Pipeline load failed",e);return NextResponse.json({error:"Could not load pipeline. Apply migration 006 and check DATABASE_URL."},{status:500});}
}
export async function POST(req:NextRequest){
 if(!isSameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
 if(!isAgentAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{
 const raw=await req.json();const d=raw&&typeof raw==="object"?raw as Record<string,unknown>:{};
 const str=(k:string,max=2000)=>typeof d[k]==="string"?(d[k] as string).trim().slice(0,max):"";
 const num=(k:string)=>{const n=Number(d[k]);return Number.isFinite(n)&&n>=0?n:0};
 const s=db();let rows:any[]=[];let event="",desc="",entity="";
 if(d.kind==="prospect"){
 const name=str("name",160);if(!name)return NextResponse.json({error:"Prospect name is required."},{status:400});
 rows=await s`INSERT INTO public.prospects(id,name,company,email,website,source,status,industry,location,metadata) VALUES(${`prospect-${crypto.randomUUID()}`},${name},${str("company",160)||name},${str("email",250)||null},${str("website",500)||null},${str("source",500)||"manual"},'new',${str("industry",160)||null},${str("location",160)||null},${JSON.stringify({evidence:str("evidence"),notes:str("notes")})}::jsonb) RETURNING *`;event="prospect_created";desc=`Prospect added: ${name}`;entity="prospect";
 }else if(d.kind==="opportunity"){
 const title=str("title",180);if(!title)return NextResponse.json({error:"Opportunity title is required."},{status:400});
 rows=await s`INSERT INTO public.opportunities(id,prospect_id,name,title,value,estimated_value,currency,stage,probability,problem,offer,metadata) VALUES(${`opportunity-${crypto.randomUUID()}`},${str("prospectId",120)||null},${title},${title},${num("value")},${num("value")},${str("currency",3).toUpperCase()||"NGN"},${str("stage",40)||"discovered"},${Math.min(100,num("probability"))},${str("problem")||null},${str("offer")||null},'{}'::jsonb) RETURNING *`;event="opportunity_created";desc=`Opportunity added: ${title}`;entity="opportunity";
 }else if(d.kind==="conversation"){
 const subject=str("subject",180),body=str("body",4000);if(!subject&&!body)return NextResponse.json({error:"Enter a subject or note."},{status:400});
 rows=await s`INSERT INTO public.conversations(id,prospect_id,channel,direction,subject,body,status,occurred_at) VALUES(${`conversation-${crypto.randomUUID()}`},${str("prospectId",120)||null},${str("channel",40)||"note"},${str("direction",20)||"internal"},${subject||"Conversation note"},${body},'logged',NOW()) RETURNING *`;event="conversation_logged";desc=`Conversation logged: ${subject||body.slice(0,80)}`;entity="conversation";
 }else if(d.kind==="deal"){
 const title=str("title",180);if(!title)return NextResponse.json({error:"Deal title is required."},{status:400});
 rows=await s`INSERT INTO public.deals(id,prospect_id,opportunity_id,title,amount,currency,status,notes) VALUES(${`deal-${crypto.randomUUID()}`},${str("prospectId",120)||null},${str("opportunityId",120)||null},${title},${num("amount")},${str("currency",3).toUpperCase()||"NGN"},${str("status",40)||"open"},${str("notes")||null}) RETURNING *`;event="deal_created";desc=`Deal recorded: ${title}`;entity="deal";
 }else if(d.kind==="revenue"){
 const amount=num("amount");if(amount<=0)return NextResponse.json({error:"Revenue must be greater than zero."},{status:400});
 const currency=str("currency",3).toUpperCase()||"NGN";const note=str("note",1000)||"Revenue entry";
 rows=await s`INSERT INTO public.revenue_entries(id,deal_id,amount,currency,kind,received_at,note) VALUES(${`revenue-${crypto.randomUUID()}`},${str("dealId",120)||null},${amount},${currency},${str("kindOfRevenue",20)||"received"},NOW(),${note}) RETURNING *`;event="revenue_recorded";desc=`Revenue recorded: ${amount} ${currency}`;entity="revenue";
 }else return NextResponse.json({error:"Unknown record type."},{status:400});
 const record=rows[0];await s`INSERT INTO public.activity_events(id,event_type,description,actor_type,actor_id,entity_type,entity_id,metadata,payload,created_at) VALUES(${`event-${crypto.randomUUID()}`},${event},${desc},'admin','control-center',${entity},${String(record.id)},'{}'::jsonb,${JSON.stringify({kind:d.kind,entityId:record.id})}::jsonb,NOW())`;
 return NextResponse.json({record},{status:201});
 }catch(e){console.error("Pipeline save failed",e);return NextResponse.json({error:"Could not save record. Check migration 006 and required fields."},{status:500});}
}
