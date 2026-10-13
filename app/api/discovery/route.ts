import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { isAgentAdmin, isSameOrigin } from "../../../lib/agents/admin-auth";
export const runtime = "nodejs";
function db(){const u=process.env.DATABASE_URL;if(!u)throw new Error("DATABASE_URL is not configured");return neon(u);}
const allowed=(v:unknown,opts:string[],fallback="")=>typeof v==="string"&&opts.includes(v)?v:fallback;
const str=(v:unknown,max=1000)=>typeof v==="string"?v.trim().slice(0,max):"";
const numOrNull=(v:unknown)=>{if(v===null||v===undefined||v==="")return null;const n=Number(v);return Number.isFinite(n)&&n>=0?n:null;};
export async function GET(req:NextRequest){
 if(!isAgentAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const s=db();const [records,matches]=await Promise.all([
 s`SELECT * FROM public.discovery_records ORDER BY created_at DESC LIMIT 300`,
 s`SELECT m.*, b.title AS buyer_title, b.location AS buyer_location, b.price_min AS buyer_min, b.price_max AS buyer_max, s.title AS seller_title, s.location AS seller_location, s.price_min AS seller_min, s.price_max AS seller_max, s.source_url AS seller_source FROM public.discovery_matches m JOIN public.discovery_records b ON b.id=m.buyer_id JOIN public.discovery_records s ON s.id=m.seller_id ORDER BY m.score DESC,m.created_at DESC LIMIT 200`
 ]);return NextResponse.json({records,matches});}
 catch(e){console.error("Discovery load failed",e);return NextResponse.json({error:"Could not load discovery data. Apply migration 007_buyer_seller_discovery.sql and check DATABASE_URL."},{status:500});}
}
export async function POST(req:NextRequest){
 if(!isSameOrigin(req))return NextResponse.json({error:"Invalid request origin."},{status:403});
 if(!isAgentAdmin(req))return NextResponse.json({error:"Unauthorized"},{status:401});
 try{const body=await req.json() as Record<string,unknown>;const action=str(body.action,40);const s=db();
  if(action==="add"){
   const intent=allowed(body.intent,["buyer","seller"]),asset=allowed(body.assetType,["car","land","house","property"]),title=str(body.title,220),source=str(body.sourceUrl,1200);
   if(!intent||!asset||!title||!source)return NextResponse.json({error:"Intent, asset type, title and source URL are required."},{status:400});
   let url:URL;try{url=new URL(source);if(!["http:","https:"].includes(url.protocol))throw new Error();}catch{return NextResponse.json({error:"Source URL must be a valid HTTP or HTTPS URL."},{status:400});}
   const pmin=numOrNull(body.priceMin),pmax=numOrNull(body.priceMax);if(pmin!==null&&pmax!==null&&pmax<pmin)return NextResponse.json({error:"Maximum price/budget must be at least the minimum."},{status:400});
   const id=`discovery-${crypto.randomUUID()}`;
   const rows=await s`INSERT INTO public.discovery_records(id,intent,asset_type,title,contact_name,business_name,phone,email,location,state,make_model,property_type,price_min,price_max,currency,source_url,source_excerpt,verification_status,notes,discovered_at,last_checked_at) VALUES(${id},${intent},${asset},${title},${str(body.contactName,160)||null},${str(body.businessName,180)||null},${str(body.phone,80)||null},${str(body.email,250)||null},${str(body.location,180)},${str(body.state,100)},${str(body.makeModel,180)||null},${str(body.propertyType,100)||null},${pmin},${pmax},'NGN',${url.toString()},${str(body.sourceExcerpt,3000)},${allowed(body.verificationStatus,["unverified","evidence_found","manually_verified"],"unverified")},${str(body.notes,2000)},NOW(),NOW()) ON CONFLICT(id) DO NOTHING RETURNING *`;
   await s`INSERT INTO public.activity_events(id,event_type,description,actor_type,actor_id,entity_type,entity_id,payload) VALUES(${`event-${crypto.randomUUID()}`},'discovery_record_created',${`Discovery record added: ${title}`},'admin','control-center','discovery_record',${id},${JSON.stringify({intent,assetType:asset,sourceUrl:url.toString()})}::jsonb)`;
   return NextResponse.json({record:rows[0]},{status:201});
  }
  if(action==="match"){
   const records=await s`SELECT * FROM public.discovery_records WHERE status='active' AND verification_status <> 'rejected' AND verification_status <> 'stale' ORDER BY created_at DESC LIMIT 300`;
   const buyers=records.filter((r:any)=>r.intent==='buyer'),sellers=records.filter((r:any)=>r.intent==='seller');let created=0;
   for(const b of buyers)for(const v of sellers){if(b.asset_type!==v.asset_type)continue;let score=40;const rationale:string[]=[`Same asset category: ${b.asset_type}`];
    if(b.state&&v.state&&String(b.state).toLowerCase()===String(v.state).toLowerCase()){score+=20;rationale.push("Same state");}
    if(b.location&&v.location&&String(b.location).toLowerCase()===String(v.location).toLowerCase()){score+=10;rationale.push("Same location");}
    const bmax=b.price_max===null?null:Number(b.price_max),bmin=b.price_min===null?null:Number(b.price_min),smax=v.price_max===null?null:Number(v.price_max),smin=v.price_min===null?null:Number(v.price_min);
    if(bmax!==null&&smin!==null&&bmax<smin)continue;if(bmin!==null&&smax!==null&&bmin>smax)continue;
    if(bmax!==null||smin!==null||bmin!==null||smax!==null){score+=20;rationale.push("Buyer budget overlaps seller price range or one side has no published price");}
    const bm=String(b.make_model||b.property_type||"").toLowerCase(),sm=String(v.make_model||v.property_type||"").toLowerCase();if(bm&&sm&&bm===sm){score+=10;rationale.push("Specific asset type/model matches");}
    score=Math.min(100,score);const id=`match-${crypto.randomUUID()}`;
    const out=await s`INSERT INTO public.discovery_matches(id,buyer_id,seller_id,score,rationale,status) VALUES(${id},${b.id},${v.id},${score},${JSON.stringify(rationale)}::jsonb,'suggested') ON CONFLICT(buyer_id,seller_id) DO UPDATE SET score=EXCLUDED.score,rationale=EXCLUDED.rationale,updated_at=NOW() RETURNING (xmax=0) AS inserted`;
    if(out[0]?.inserted)created++;
   }
   await s`INSERT INTO public.activity_events(id,event_type,description,actor_type,actor_id,entity_type,payload) VALUES(${`event-${crypto.randomUUID()}`},'discovery_matching_run',${`Buyer/seller matching run: ${created} new matches`},'admin','control-center','discovery_match',${JSON.stringify({buyers:buyers.length,sellers:sellers.length,newMatches:created})}::jsonb)`;
   return NextResponse.json({ok:true,newMatches:created,buyers:buyers.length,sellers:sellers.length});
  }
  if(action==="match-status"){
   const id=str(body.id,160),status=allowed(body.status,["reviewed","introduced","declined","deal_created"]);if(!id||!status)return NextResponse.json({error:"Match and valid status are required."},{status:400});
   const rows=await s`UPDATE public.discovery_matches SET status=${status},updated_at=NOW() WHERE id=${id} RETURNING id,status`;if(!rows.length)return NextResponse.json({error:"Match not found."},{status:404});return NextResponse.json({match:rows[0]});
  }
  return NextResponse.json({error:"Unknown discovery action."},{status:400});
 }catch(e){console.error("Discovery save failed",e);return NextResponse.json({error:"Could not save discovery data. Confirm migration 007 has been applied."},{status:500});}
}
