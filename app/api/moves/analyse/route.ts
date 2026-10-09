import {NextResponse} from "next/server";
import {requireSessionUser} from "@/lib/auth/session";
import {body,InputError,text} from "@/lib/marketplace/http";
import {validPhotos} from "@/lib/marketplace/model";
import {marketplaceDb} from "@/lib/marketplace/store";
import {getAiProvider} from "@/lib/ai/openai";
import {analyseMovePhotos} from "@/lib/moving/vision";
import {MAX_MOVE_PHOTOS,type PhotoReference} from "@/lib/moving/planner";
export const maxDuration=90;
export async function POST(request:Request){
 try{
  const b=await body(request);const user=await requireSessionUser();if(!user)throw new InputError("Sign in to create your inventory from photos. You can also add items yourself.",401);
  if(!validPhotos(b.photos,MAX_MOVE_PHOTOS) || !b.photos.length || !Array.isArray(b.references) || b.references.length>MAX_MOVE_PHOTOS || !b.references.every((r:PhotoReference)=>r && Number.isInteger(r.photoIndex) && r.photoIndex>=0 && r.photoIndex<b.photos.length && text(r.description,200) && Number.isFinite(r.lengthCm) && r.lengthCm>0 && r.lengthCm<=2000))throw new InputError("Check your photos and any reference measurements.");
  if(!getAiProvider())throw new InputError("Photo planning is not available yet. Add items manually or ask our team to help.",503);
  const sql=await marketplaceDb();const id=`${user.userId}:${new Date().toISOString().slice(0,10)}`;
  const rows=await sql`INSERT INTO emz_marketplace(kind,id,owner_id,data) VALUES('ai-usage',${id},${user.userId},'{"count":1}'::jsonb) ON CONFLICT(kind,id) DO UPDATE SET data=jsonb_build_object('count',COALESCE((emz_marketplace.data->>'count')::int,0)+1),updated_at=now() WHERE COALESCE((emz_marketplace.data->>'count')::int,0)<20 RETURNING id`;
  if(!rows.length)throw new InputError("You have reached today's photo planning limit. Add items manually or contact our team.",429);
  const items=await analyseMovePhotos(b.photos,b.references.map((r:PhotoReference)=>({photoIndex:r.photoIndex,description:r.description,lengthCm:r.lengthCm})));
  return NextResponse.json({items},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof InputError?e.message:"Photo planning is temporarily unavailable. Your photos are still here; add items manually or try again."},{status:e instanceof InputError?e.status:503});}
}
