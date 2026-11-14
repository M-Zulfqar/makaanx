import { expect,test } from 'vitest';
import { rentalClient,roleReply,hasOperation,tenantId } from './helpers/rental-client';
import { parseIdentityQueue,readIdentityQueue,identityQueueHref } from '@/lib/identity/queue';
const filters=parseIdentityQueue({}).filters;
test.each(['tenant','landlord'])('queue reader denies %s independently of UI',async role=>{
 const f=rentalClient([roleReply(role)],role);await expect(readIdentityQueue(f.client,filters)).rejects.toThrow('Administrator access required');expect(f.calls).toHaveLength(1);
});
test('queue denies anonymous before reading profiles',async()=>{const f=rentalClient([],'tenant',false);await expect(readIdentityQueue(f.client,filters)).rejects.toThrow();expect(f.calls).toHaveLength(0);});
test('queue applies role/status/submission/name filters and stable pagination with exact totals',async()=>{
 const f=rentalClient([roleReply('admin'),{data:[{id:tenantId,full_name:'Fictional applicant',role:'tenant',verification_status:'pending',cnic_path:'PRIVATE_SENTINEL'}],count:99}]);
 const selected=parseIdentityQueue({q:'x%_',role:'tenant',status:'pending',submission:'submitted',page:'2'}).filters;
 const result=await readIdentityQueue(f.client,selected);expect(result.count).toBe(99);expect(JSON.stringify(result)).not.toContain('PRIVATE');
 const call=f.calls[1];for(const [op,...args] of [['in','role',['tenant','landlord']],['eq','role','tenant'],['eq','verification_status','pending'],['not','cnic_path','is',null],['ilike','full_name','%x\\%\\_%'],['range',12,23],['order','id']])expect(hasOperation(call,op as string,...args)).toBe(true);
 expect(hasOperation(call,'select','id,full_name,role,verification_status',{count:'exact'})).toBe(true);
 expect(identityQueueHref(selected,3)).toContain('page=3');expect(identityQueueHref(selected,3)).toContain('submission=submitted');
});
test('incomplete and all status use correct reference predicates',async()=>{
 const f=rentalClient([roleReply('admin'),{data:[],count:0}]);await readIdentityQueue(f.client,parseIdentityQueue({submission:'incomplete',status:'all'}).filters);
 expect(hasOperation(f.calls[1],'is','cnic_path',null)).toBe(true);expect(f.calls[1].operations.some(o=>o.name==='eq'&&o.args[0]==='verification_status')).toBe(false);
});
test.each([{page:'0'},{page:'1.2'},{page:'10001'},{role:'admin'},{status:'approved'},{submission:'anything'},{q:['a','b']}])('invalid filters rejected',params=>expect(parseIdentityQueue(params).error).toBeTruthy());
test.each([{data:null,error:{code:'XX000',message:'PRIVATE'}},{data:[],count:null},{data:[{id:tenantId,role:'admin',full_name:'Wrong role',verification_status:'pending'}],count:1}])('errors/null counts/malformed rows are unavailable',async reply=>{
 const f=rentalClient([roleReply('admin'),reply]);await expect(readIdentityQueue(f.client,filters)).rejects.toThrow('IDENTITY_QUEUE_UNAVAILABLE');
});
