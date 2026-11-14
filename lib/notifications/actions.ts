'use server';
import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { markNotificationRead } from './service';
import { ChatError } from '@/lib/messaging/schema';
import type { ChatResult } from '@/lib/messaging/actions';
export async function markNotificationReadAction(id:string):Promise<ChatResult>{
 try{const result=await markNotificationRead(await createClient(),id);for(const area of ['dashboard','landlord','admin'])revalidatePath(`/${area}/notifications`);return {ok:true,...result};}
 catch(error){const e=error instanceof ChatError?error:new ChatError('UNAVAILABLE');return {ok:false,code:e.code,message:e.message};}
}
