import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Bucket={count:number;resetAt:number};const buckets=new Map<string,Bucket>();
const allowedServices=new Set(["sang-ten","thu-hoi","dang-ky","khac"]);const allowedVehicles=new Set(["oto","xe-may","khac"]);
const clean=(value:unknown,max:number)=>typeof value==="string"?value.trim().normalize("NFC").slice(0,max):"";
function rateLimited(key:string){const now=Date.now();const current=buckets.get(key);if(!current||current.resetAt<now){buckets.set(key,{count:1,resetAt:now+15*60_000});return false}current.count+=1;return current.count>5}
async function notifyLead(lead:{id:string;name:string;phone:string;service:string;vehicle_type:string;processing_location:string;message:string}){const apiKey=process.env.RESEND_API_KEY;const from=process.env.LEAD_NOTIFICATION_FROM;const to=process.env.LEAD_NOTIFICATION_TO||"saigommotor68@gmail.com";if(!apiKey||!from)return false;const response=await fetch("https://api.resend.com/emails",{method:"POST",headers:{Authorization:`Bearer ${apiKey}`,"Content-Type":"application/json"},body:JSON.stringify({from,to:[to],subject:`Yêu cầu mới từ ${lead.name} - ${lead.phone}`,text:`Mã lead: ${lead.id}\nKhách: ${lead.name}\nĐiện thoại: ${lead.phone}\nDịch vụ: ${lead.service}\nLoại xe: ${lead.vehicle_type}\nNơi làm thủ tục: ${lead.processing_location}\nTình trạng: ${lead.message||"Không ghi chú"}`})});return response.ok}

export async function POST(request:NextRequest){
  const ip=(request.headers.get("x-forwarded-for")||request.headers.get("x-real-ip")||"unknown").split(",")[0].trim();if(rateLimited(ip))return NextResponse.json({error:"Anh/chị đã gửi nhiều yêu cầu trong thời gian ngắn. Vui lòng gọi 0704 104 104 nếu cần hỗ trợ ngay."},{status:429});
  let raw:Record<string,unknown>;try{raw=await request.json()}catch{return NextResponse.json({error:"Dữ liệu gửi lên không hợp lệ."},{status:400})}
  if(clean(raw.website,100))return NextResponse.json({error:"Yêu cầu không hợp lệ."},{status:400});
  const started=Number(raw.formStartedAt);if(!Number.isFinite(started)||Date.now()-started<1500)return NextResponse.json({error:"Anh/chị vui lòng kiểm tra lại thông tin trước khi gửi."},{status:400});
  const name=clean(raw.name,80),phone=clean(raw.phone,30).replace(/[\s.()-]/g,""),service=clean(raw.service,30),vehicleType=clean(raw.vehicleType,30),processingLocation=clean(raw.processingLocation,120),message=clean(raw.message,1000);
  if(name.length<2||!/^(0[35789])[0-9]{8}$/.test(phone)||!allowedServices.has(service)||!allowedVehicles.has(vehicleType)||processingLocation.length<2||raw.consent!==true)return NextResponse.json({error:"Anh/chị vui lòng điền đủ thông tin, kiểm tra số điện thoại và xác nhận đồng ý trước khi gửi."},{status:400});
  try{const supabase=getSupabaseAdmin();const recentSince=new Date(Date.now()-5*60_000).toISOString();const{data:existing}=await supabase.from("leads").select("id").eq("phone",phone).gte("created_at",recentSince).limit(1).maybeSingle();if(existing)return NextResponse.json({error:"SGM đã nhận yêu cầu gần đây của anh/chị. Chúng tôi sẽ liên hệ sớm."},{status:429});
    const row={name,phone,service,vehicle_type:vehicleType,processing_location:processingLocation,message,source_path:clean(raw.sourcePath,250)||"/",referrer:clean(raw.referrer,500),utm_source:clean(raw.utmSource,100),utm_medium:clean(raw.utmMedium,100),utm_campaign:clean(raw.utmCampaign,160),utm_content:clean(raw.utmContent,160),utm_term:clean(raw.utmTerm,160),gclid:clean(raw.gclid,250),consent_at:new Date().toISOString(),ip_hash:null,status:"new"};
    const{data,error}=await supabase.from("leads").insert(row).select("id,name,phone,service,vehicle_type,processing_location,message").single();if(error)throw error;await supabase.from("lead_events").insert({lead_id:data.id,event_name:"lead_created",metadata:{source_path:row.source_path,utm_source:row.utm_source,utm_campaign:row.utm_campaign,gclid:row.gclid}});
    let emailed=false;try{emailed=await notifyLead(data)}catch(error){console.error("Lead email failed",error)}await supabase.from("leads").update({email_status:emailed?"sent":"pending",email_last_attempt_at:new Date().toISOString()}).eq("id",data.id);
    return NextResponse.json({ok:true,leadId:data.id},{status:201});
  }catch(error){console.error("Lead creation failed",error);return NextResponse.json({error:"SGM chưa nhận được thông tin. Anh/chị vui lòng gọi 0704 104 104 để được hỗ trợ."},{status:500})}
}
