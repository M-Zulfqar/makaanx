import type { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { actor,capabilities } from '@/lib/messaging/service';
import { ChatError,uuid } from '@/lib/messaging/schema';
const row=z.object({id:uuid,event_type:z.literal('new_message'),conversation_id:uuid,created_at:z.iso.datetime({offset:true}),read_at:z.iso.datetime({offset:true}).nullable()});
export async function readNotifications(client:SupabaseClient,page:number){
 if(!Number.isInteger(page)||page<1||page>10000)throw new ChatError('INVALID');
 const user=await actor(client);if(!await capabilities(client))return {ready:false as const,rows:[],count:null,unread:null,role:user.role};
 const [result,unread]=await Promise.all([
  client.from('notifications_v1').select('id,event_type,conversation_id,created_at,read_at',{count:'exact'}).eq('recipient_id',user.id).order('created_at',{ascending:false}).order('id',{ascending:false}).range((page-1)*20,page*20-1),
  client.from('notifications_v1').select('id',{count:'exact',head:true}).eq('recipient_id',user.id).is('read_at',null),
 ]);
 const parsed=z.array(row).safeParse(result.data);if(result.error||!parsed.success||result.count===null||!Number.isSafeInteger(result.count)||result.count<0)throw new ChatError('UNAVAILABLE');
 return {ready:true as const,rows:parsed.data,count:result.count,unread:!unread.error&&unread.count!==null&&Number.isSafeInteger(unread.count)&&unread.count>=0?unread.count:null,role:user.role};
}
export async function markNotificationRead(client:SupabaseClient,id:string){
 if(!uuid.safeParse(id).success)throw new ChatError('INVALID');await actor(client);
 if(!await capabilities(client))throw new ChatError('NOT_READY');
 const result=await client.rpc('makaanx_mark_notification_read_v1',{notification:id});
 if(result.error||result.data!==true)throw new ChatError('UNAVAILABLE');return {id};
}
