export const MAX_MOVE_PHOTOS = 12;
export const ROOMS = ["Living room", "Bedroom", "Kitchen", "Office", "Storage", "Other"] as const;
export type MeasurementSource = "unknown" | "photo-estimate" | "customer-entered" | "measured";
export type ItemDimensions = { widthCm: number; depthCm: number; heightCm: number };
export type PlannedItem = {
  id: string; name: string; room: string; quantity: number; photoIndex: number | null;
  dimensions: ItemDimensions | null; measurementSource: MeasurementSource;
  fragile: boolean; disassembly: boolean; notes: string;
};
export type PhotoReference = { photoIndex: number; description: string; lengthCm: number };
export type InventoryPlan = { items: PlannedItem[]; references: PhotoReference[]; handling: "full-service" | "transport-only"; reviewed: boolean };
export type MoveTask = { id: string; title: string; owner: "customer" | "team" | "crew"; status: "pending" | "done" | "blocked"; notes: string };
export const FULL_SERVICE_EXTRAS = ["Packing", "Packing materials", "Unpacking", "Assembly"];
const str=(v:unknown,max:number)=>typeof v==="string" && v.trim().length>0 && v.length<=max;
export function validDimensions(v: unknown): v is ItemDimensions {
 if(!v || typeof v!=="object")return false;
 const d=v as ItemDimensions;
 return [d.widthCm,d.depthCm,d.heightCm].every(n=>typeof n==="number" && Number.isFinite(n) && n>0 && n<=2000);
}
export function validPlan(value: unknown, photoCount: number): value is InventoryPlan {
 if(!value || typeof value!=="object")return false;const p=value as InventoryPlan;
 return ["full-service","transport-only"].includes(p.handling) && p.reviewed===true &&
 Array.isArray(p.references) && p.references.length<=MAX_MOVE_PHOTOS && p.references.every(r=>r && Number.isInteger(r.photoIndex) && r.photoIndex>=0 && r.photoIndex<photoCount && str(r.description,200) && Number.isFinite(r.lengthCm) && r.lengthCm>0 && r.lengthCm<=2000) &&
 Array.isArray(p.items) && p.items.length>0 && p.items.length<=80 && new Set(p.items.map(i=>i?.id)).size===p.items.length && p.items.every(i=>i && str(i.id,80) && str(i.name,120) && ROOMS.includes(i.room as typeof ROOMS[number]) && Number.isInteger(i.quantity) && i.quantity>0 && i.quantity<=100 && (i.photoIndex===null || (Number.isInteger(i.photoIndex) && i.photoIndex>=0 && i.photoIndex<photoCount)) && ["unknown","photo-estimate","customer-entered","measured"].includes(i.measurementSource) && (i.dimensions===null ? i.measurementSource==="unknown" : validDimensions(i.dimensions) && i.measurementSource!=="unknown") && (i.measurementSource!=="photo-estimate" || p.references.some(r=>r.photoIndex===i.photoIndex)) && typeof i.fragile==="boolean" && typeof i.disassembly==="boolean" && typeof i.notes==="string" && i.notes.length<=500);
}
/** Strip model/customer extras before saving the booking. */
export function cleanPlan(p: InventoryPlan): InventoryPlan {
 return {handling:p.handling,reviewed:p.reviewed,references:p.references.map(r=>({photoIndex:r.photoIndex,description:r.description.trim(),lengthCm:r.lengthCm})),items:p.items.map(i=>({id:i.id,name:i.name.trim(),room:i.room,quantity:i.quantity,photoIndex:i.photoIndex,dimensions:i.dimensions?{widthCm:i.dimensions.widthCm,depthCm:i.dimensions.depthCm,heightCm:i.dimensions.heightCm}:null,measurementSource:i.measurementSource,fragile:i.fragile,disassembly:i.disassembly,notes:i.notes.trim()}))};
}
export function inventoryText(items: PlannedItem[]) { return items.map(i=>`${i.quantity} × ${i.name} (${i.room})`).join(", "); }
export function planSummary(items: PlannedItem[]) {
 const measured=items.filter(i=>validDimensions(i.dimensions));
 const volumeM3=measured.reduce((sum,i)=>sum+i.dimensions!.widthCm*i.dimensions!.depthCm*i.dimensions!.heightCm*i.quantity/1000000,0);
 const missing=items.filter(i=>!validDimensions(i.dimensions)).length;
 const unconfirmed=items.filter(i=>i.measurementSource!=="measured").length;
 const paddedVolume=volumeM3*1.25;
 return {volumeM3:Math.round(volumeM3*100)/100,missing,unconfirmed,fragile:items.filter(i=>i.fragile).length,disassembly:items.filter(i=>i.disassembly).length,
  suggestedTruck:missing>0?"Auto":paddedVolume<=8?"Van":paddedVolume<=22?"Medium truck":"10-tonne truck"};
}
export function createMoveTasks(plan?: InventoryPlan, extras: string[] = []): MoveTask[] {
 const tasks:Omit<MoveTask,"status"|"notes">[]=[
 {id:"inventory",title:"Confirm items, measurements and building access",owner:"customer"},
 {id:"quote",title:"Review inventory and confirm the quote",owner:"team"},
 {id:"crew",title:"Arrange the vehicle, crew and arrival window",owner:"team"},
 ];
 if(extras.includes("Packing"))tasks.push({id:"packing",title:"Arrange materials and pack the listed items",owner:"crew"});
 tasks.push({id:"pickup",title:"Record condition, protect items and load the vehicle",owner:"crew"},{id:"delivery",title:"Deliver, unload and check every item",owner:"crew"});
 if(extras.includes("Unpacking"))tasks.push({id:"unpacking",title:"Unpack and place items in their destination rooms",owner:"crew"});
 if(extras.includes("Assembly"))tasks.push({id:"assembly",title:"Reassemble agreed furniture",owner:"crew"});
 if(extras.includes("Cleaning"))tasks.push({id:"cleaning",title:"Complete the agreed cleaning service",owner:"crew"});
 tasks.push({id:"signoff",title:"Review delivery condition and sign off the move",owner:"customer"});
 return tasks.map(t=>({...t,status:t.id==="inventory" && plan?.reviewed && plan.items.every(i=>i.measurementSource==="measured")?"done":"pending",notes:""}));
}
export type VisionItem = { name:string;room:string;quantity:number;photoIndex:number;dimensions:ItemDimensions|null;referenceUsed:boolean;fragile:boolean;disassembly:boolean;notes:string };
export function normaliseVision(value: unknown, photoCount:number,references:PhotoReference[]): PlannedItem[] {
 if(!value || typeof value!=="object" || !Array.isArray((value as {items:unknown}).items))throw new Error("The photo response was incomplete. Try a clearer photo or add items manually.");
 const raw=(value as {items:VisionItem[]}).items;
 if(raw.length>80)throw new Error("Too many items were detected. Analyse one room at a time.");
 return raw.map((i)=>{
  if(!i || !str(i.name,120) || !Number.isInteger(i.quantity) || i.quantity<1 || i.quantity>100 || !Number.isInteger(i.photoIndex) || i.photoIndex<0 || i.photoIndex>=photoCount || typeof i.fragile!=="boolean" || typeof i.disassembly!=="boolean")throw new Error("Some items could not be read. Try another photo or add them manually.");
  const hasReference=references.some(r=>r.photoIndex===i.photoIndex);
  const dimensions=hasReference && i.referenceUsed===true && validDimensions(i.dimensions)?i.dimensions:null;
  return {id:crypto.randomUUID(),name:i.name.trim(),room:ROOMS.includes(i.room as typeof ROOMS[number])?i.room:"Other",quantity:i.quantity,photoIndex:i.photoIndex,dimensions,measurementSource:dimensions?"photo-estimate":"unknown",fragile:i.fragile,disassembly:i.disassembly,notes:typeof i.notes==="string"?i.notes.slice(0,500):""};
 });
}
