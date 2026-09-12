import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED = new Set(["dashboard_view","warning_popup_shown","submit_attempt","submit_verified","submit_unverified","signup_success","login_success","community_view","community_profile_click","profile_view","history_view","onboarding_view","challenge_started","complete_view","complete_share_click","mypage_save","logout_click"]);

export async function POST(request: Request) {
  const supabase=await createClient(); const {data:{user}}=await supabase.auth.getUser(); if(!user)return NextResponse.json({ok:false},{status:401});
  const body=await request.json().catch(()=>({})); const name=typeof body.name==="string"?body.name:""; if(!ALLOWED.has(name))return NextResponse.json({ok:false},{status:400});
  const admin=createAdminClient();
  await admin.from("analytics_events").insert({user_id:user.id,event_name:name,path:typeof body.path==="string"?body.path:null});
  return NextResponse.json({ok:true});
}
