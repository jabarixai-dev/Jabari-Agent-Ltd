import { NextResponse } from 'next/server';
export async function GET(){return NextResponse.json({ok:true,service:'jabari-revenue-os',time:new Date().toISOString()});}
