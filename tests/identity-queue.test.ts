import { expect,test } from 'vitest';
import { rentalClient,roleReply,hasOperation,tenantId,projectionRow,profileCountsReply } from './helpers/rental-client';
import { parseIdentityQueue,readIdentityQueue,identityQueueHref } from '@/lib/identity/queue';
const filters=parseIdentityQueue({}).filters;
test.each(['tenant','landlord'])('queue reader denies %s independently of UI',async role=>{
 const f=rentalClient([roleReply(role)],role);await expect(readIdentityQueue(f.client,filters)).rejects.toThrow('Administrator access required');expect(f.calls).toHaveLength(1);
});
test('queue denies anonymous before reading profiles',async()=>{const f=rentalClient([],'tenant',false);await expect(readIdentityQueue(f.client,filters)).rejects.toThrow();expect(f.calls).toHaveLength(0);});
test('queue applies role/status/submission/name filters and stable pagination with exact totals',async()=>{
 const f=rentalClient([roleReply('admin'),{data:[{...projectionRow(),cnic_path:'PRIVATE_SENTINEL'}]},profileCountsReply(99)]);
 const selected=parseIdentityQueue({q:'x%_',role:'tenant',status:'pending',submission:'submitted',page:'2'}).filters;
 const result=await readIdentityQueue(f.client,selected);expect(result.count).toBe(99);expect(JSON.stringify(result)).not.toContain('PRIVATE');
 expect(f.calls[1].table).toBe('rpc:makaanx_admin_profiles');
 expect(hasOperation(f.calls[1],'rpc',{p_search:'x%_',p_role:'tenant',p_status:'pending',p_submission:'submitted',p_eligible:true,p_limit:12,p_offset:12})).toBe(true);
 expect(f.calls[2].table).toBe('rpc:makaanx_admin_profile_counts');
 expect(identityQueueHref(selected,3)).toContain('page=3');expect(identityQueueHref(selected,3)).toContain('submission=submitted');
});
test('incomplete and all status use correct reference predicates',async()=>{
 const f=rentalClient([roleReply('admin'),{data:[]},profileCountsReply(0)]);await readIdentityQueue(f.client,parseIdentityQueue({submission:'incomplete',status:'all'}).filters);
 expect(hasOperation(f.calls[1],'rpc',{p_search:'',p_role:'',p_status:'',p_submission:'incomplete',p_eligible:true,p_limit:12,p_offset:0})).toBe(true);
});
test.each([{page:'0'},{page:'1.2'},{page:'10001'},{role:'admin'},{status:'approved'},{submission:'anything'},{q:['a','b']}])('invalid filters rejected',params=>expect(parseIdentityQueue(params).error).toBeTruthy());
test.each([{data:null,error:{code:'XX000',message:'PRIVATE'}},{data:null},{data:[{...projectionRow(),role:'admin'}]}])('errors/null counts/malformed rows are unavailable',async reply=>{
 const f=rentalClient([roleReply('admin'),reply,profileCountsReply()]);await expect(readIdentityQueue(f.client,filters)).rejects.toThrow('IDENTITY_QUEUE_UNAVAILABLE');
});
