import {NextResponse} from "next/server";
import {requireSessionUser} from "@/lib/auth/session";
import {assertAdminApi,AdminForbiddenError} from "@/lib/auth/assert-admin-api";
import {body,InputError,reference,text} from "@/lib/marketplace/http";
import {getMove} from "@/lib/moving/store";
import {changeMove} from "@/lib/marketplace/moves";
import {resolveWorkerForUser} from "@/lib/moving/worker-store";
import {workerExtras} from "@/lib/marketplace/store";
export async function PATCH(request:Request){
 try{
  const b=await body(request);const user=await requireSessionUser();if(!user)throw new InputError("Sign in required.",401);
  if(!reference(b.reference) || !text(b.taskId,80) || !["pending","done","blocked"].includes(b.status) || !text(b.notes,500,0))throw new InputError("Check the move task.");
  const move=await getMove(b.reference);if(!move)throw new InputError("Move not found.",404);
  const task=move.planTasks?.find(t=>t.id===b.taskId);if(!task)throw new InputError("Task not found.",404);
  let admin=false;try{await assertAdminApi();admin=true;}catch(e){if(!(e instanceof AdminForbiddenError))throw e;}
  const owned=move.userId===user.userId;
  const worker=(!admin && !owned)?await resolveWorkerForUser(user):null;
  const assigned=worker && [move.moverId,move.vehicleId].includes(worker.id) && (await workerExtras(worker.id)).verification.status==="verified";
  if(!admin && !(owned && task.owner==="customer") && !(assigned && task.owner==="crew"))throw new InputError("Only the person responsible for this task can update it.",403);
  if(move.status==="cancelled")throw new InputError("This move is closed. Contact support for changes.",409);
  const updated=await changeMove(move,{planTasks:move.planTasks!.map(t=>t.id===task.id?{id:t.id,title:t.title,owner:t.owner,status:b.status,notes:b.notes.trim()}:t)});
  return NextResponse.json({move:updated},{headers:{"Cache-Control":"no-store"}});
 }catch(e){return NextResponse.json({error:e instanceof InputError?e.message:"Could not update this task."},{status:e instanceof InputError?e.status:503});}
}
