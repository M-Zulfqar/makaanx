'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { sendMessage,startConversation,markConversationRead } from './service';
import { ChatError } from './schema';
export type ChatResult={ok:true;id:string}|{ok:false;code:string;message:string};
async function run(op:(c:Awaited<ReturnType<typeof createClient>>)=>Promise<{id:string}>):Promise<ChatResult>{
  try{const result=await op(await createClient());for(const base of ['/dashboard','/landlord']){revalidatePath(`${base}/inbox`);revalidatePath(`${base}/inbox/[id]`,'page');revalidatePath(`${base}/notifications`);}return {ok:true,...result};}
  catch(error){const e=error instanceof ChatError?error:new ChatError('UNAVAILABLE');return {ok:false,code:e.code,message:e.message};}
}
export async function sendMessageAction(input:unknown){return run(c=>sendMessage(c,input));}
export async function startConversationAction(propertyId:string){return run(c=>startConversation(c,propertyId));}
export async function markConversationReadAction(chat:string,message:string){return run(c=>markConversationRead(c,chat,message));}
