import { beforeEach, expect, test, vi } from "vitest";
import { rentalClient, tenantId, landlordId } from "./helpers/rental-client";
import { IdentityError, MAX_IDENTITY_BYTES, reviewInputSchema, statusDescription, validateIdentityFiles } from "@/lib/identity/contract";
import { readOwnIdentity, submitIdentity, submitReservedIdentity } from "@/lib/identity/submission";
const request = '60000000-0000-4000-8000-000000000001';
const png = () => new File([new Uint8Array([137,80,78,71,13,10,26,10,0])], 'fictional.png', { type: 'image/png' });
function fixture(role = 'tenant', status: string | null = 'pending') {
  const f = rentalClient([{ data: { role, verification_status: status } }], role);
  const uid = role === 'landlord' ? landlordId : tenantId;
  const upload = vi.fn().mockResolvedValue({ error: null });
  const bucket = vi.fn(() => ({ upload }));
  const rpc = vi.fn().mockResolvedValueOnce({ data: { request_id: request, object_name: `${uid}/cnic-${request}.png`, state: 'uploading' }, error: null }).mockResolvedValue({ data: 'pending', error: null });
  Object.assign(f.client, { rpc, storage: { from: bucket } });
  return { ...f, rpc, upload, bucket };
}
beforeEach(() => vi.clearAllMocks());
test('release gate denies upload without making any request', async () => {
  const f=fixture(); await expect(submitIdentity(f.client,[png()])).rejects.toMatchObject({code:'GATED'});
  expect(f.getUser).not.toHaveBeenCalled(); expect(f.upload).not.toHaveBeenCalled(); expect(f.rpc).not.toHaveBeenCalled();
});
test('anonymous cannot reserve or upload', async () => {
  const f=fixture(); f.getUser.mockResolvedValue({data:{user:null},error:null});
  await expect(submitReservedIdentity(f.client,[png()])).rejects.toMatchObject({code:'AUTH'}); expect(f.rpc).not.toHaveBeenCalled();
});
test.each(['admin','unknown'])('stored %s role denies even with otherwise valid request',async role=>{
  const f=fixture(role); await expect(submitReservedIdentity(f.client,[png()])).rejects.toMatchObject({code:'ROLE'}); expect(f.upload).not.toHaveBeenCalled();
});
test.each(['verified','rejected','unexpected'])('settled/unknown %s status cannot resubmit',async status=>{
  const f=fixture('tenant',status);await expect(submitReservedIdentity(f.client,[png()])).rejects.toMatchObject({code:'STATUS'});expect(f.rpc).not.toHaveBeenCalled();
});
test.each(['tenant','landlord'])('%s submits own reserved path only and uses real stages',async role=>{
  const f=fixture(role);const stages:string[]=[];expect(await submitReservedIdentity(f.client,[png()],p=>stages.push(p))).toEqual({status:'pending'});
  expect(stages).toEqual(['validating','reserving','uploading','confirming','submitted']);
  expect(f.bucket).toHaveBeenCalledWith('cnic-documents');expect(f.upload.mock.calls[0][2]).toEqual({contentType:'image/png',upsert:false});
  expect(f.rpc.mock.calls[0][1]).toMatchObject({file_mime:'image/png',file_bytes:9,file_sha256:expect.stringMatching(/^[0-9a-f]{64}$/)});
  expect(f.rpc.mock.calls[1]).toEqual(['makaanx_finalize_identity_v1',{request_id:request}]);
});
test('cross-owner or malformed reservation fails before storage',async()=>{
  const f=fixture();f.rpc.mockReset().mockResolvedValue({data:{request_id:request,object_name:`${landlordId}/cnic-${request}.png`,state:'uploading'},error:null});
  await expect(submitReservedIdentity(f.client,[png()])).rejects.toMatchObject({code:'UNAVAILABLE'});expect(f.upload).not.toHaveBeenCalled();
});
test('reservation failure never uploads and never leaks SDK text',async()=>{
  const f=fixture();f.rpc.mockReset().mockResolvedValue({error:{message:'PRIVATE_PATH TOKEN'}});
  await expect(submitReservedIdentity(f.client,[png()])).rejects.toThrow('Submission is not confirmed');expect(f.upload).not.toHaveBeenCalled();
});
test.each([false,true])('uncertain upload (%s thrown) reconciles same reservation without overwrite or deletion',async throws=>{
  const f=fixture(); if(throws)f.upload.mockRejectedValue(new Error('PRIVATE_PATH'));else f.upload.mockResolvedValue({error:{message:'409 PRIVATE_PATH'}});
  await expect(submitReservedIdentity(f.client,[png()])).resolves.toEqual({status:'pending'});expect(f.rpc).toHaveBeenCalledTimes(2);
});
test('finalize error never reports submitted; same-file retry reuses tracked path',async()=>{
  const f=fixture();f.rpc.mockReset().mockImplementation((name:string)=>Promise.resolve(name==='makaanx_begin_identity_v1'?{data:{request_id:request,object_name:`${tenantId}/cnic-${request}.png`,state:'uploading'},error:null}:{data:null,error:{message:'PRIVATE_PATH'}}));
  const stages:string[]=[];await expect(submitReservedIdentity(f.client,[png()],p=>stages.push(p))).rejects.toMatchObject({code:'RETRY'});expect(stages).not.toContain('submitted');
  const again=fixture();await submitReservedIdentity(again.client,[png()]);expect(again.upload.mock.calls[0][0]).toEqual(f.upload.mock.calls[0][0]);
});
test('profile reads allowlist no path, claims or private fields',async()=>{
  const f=fixture();expect(await readOwnIdentity(f.client)).toEqual({userId:tenantId,role:'tenant',verification_status:'pending'});
  expect(f.calls[0].operations[0].args[0]).toBe('role,verification_status');
});
test('unexpected profile SDK error is sanitized',async()=>{
  const f=fixture(); f.getUser.mockRejectedValue(new Error('PRIVATE_TOKEN'));
  await expect(readOwnIdentity(f.client)).rejects.toThrow('Identity information is unavailable');
});
test('PNG and JPEG magic must match MIME',async()=>{
  await expect(validateIdentityFiles([png()])).resolves.toHaveProperty('type','image/png');
  const jpeg=new File([new Uint8Array([255,216,255,224,0,0,0,0])],'fictional.jpg',{type:'image/jpeg'});
  await expect(validateIdentityFiles([jpeg])).resolves.toBe(jpeg);
  await expect(validateIdentityFiles([new File(['not an image'],'fake.png',{type:'image/png'})])).rejects.toMatchObject({code:'FILE'});
});
test.each([[],[png(),png()],[new File(['abcdefgh'],'fictional.svg',{type:'image/svg+xml'})],[new File([],'empty.png',{type:'image/png'})]].map(files=>({files})))('invalid file count/type/empty denied',async ({files})=>{
  await expect(validateIdentityFiles(files)).rejects.toMatchObject({code:'FILE'});
});
test('oversize file denied before reading content',async()=>{
  const oversized={size:MAX_IDENTITY_BYTES+1,type:'image/png',slice:vi.fn()} as unknown as File;
  await expect(validateIdentityFiles([oversized])).rejects.toMatchObject({code:'FILE'});expect(oversized.slice).not.toHaveBeenCalled();
});
test('status language does not equate pending with submitted or approved with official authenticity',()=>{
  expect(statusDescription('pending')).toContain('does not confirm');expect(statusDescription('verified')).toContain('not official NADRA');expect(statusDescription('rejected')).toContain('rejected');expect(statusDescription(null)).toContain('does not imply approval');
});
test('reconciled review input requires bounded reason for rejection and exact version',()=>{
  const base={request_id:request,expected_version:2,decision:'rejected',reason:'Insufficient image clarity',notes:''};
  expect(reviewInputSchema.safeParse(base).success).toBe(true);
  for(const invalid of [{...base,reason:'short'},{...base,expected_version:0},{...base,decision:'approve'},{...base,notes:'x'.repeat(1001)},{...base,target_user:tenantId}])expect(reviewInputSchema.safeParse(invalid).success).toBe(false);
  expect(reviewInputSchema.safeParse({...base,decision:'verified',reason:''}).success).toBe(true);
});
test('error objects cannot carry raw upstream details',()=>{expect(new IdentityError('RETRY').message).not.toMatch(/cnic-|TOKEN|PRIVATE/);});
test('lost finalize response recovers already-pending reservation without reupload',async()=>{
 const f=fixture();f.rpc.mockReset().mockResolvedValueOnce({data:{request_id:request,object_name:`${tenantId}/cnic-${request}.png`,state:'pending'},error:null}).mockResolvedValue({data:'pending',error:null});
 await expect(submitReservedIdentity(f.client,[png()])).resolves.toEqual({status:'pending'});expect(f.upload).not.toHaveBeenCalled();expect(f.rpc).toHaveBeenCalledTimes(2);
});
