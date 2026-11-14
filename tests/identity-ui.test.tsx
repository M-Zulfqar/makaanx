// @vitest-environment jsdom
import React from 'react';
import { act,cleanup,render,screen,fireEvent } from '@testing-library/react';
import { afterEach,beforeEach,expect,test,vi } from 'vitest';
const mocks=vi.hoisted(()=>({read:vi.fn(),submit:vi.fn(),create:vi.fn()}));
vi.mock('@/lib/supabase/browser',()=>({createClient:mocks.create}));
vi.mock('@/lib/identity/submission',()=>({readOwnIdentity:mocks.read,submitIdentity:mocks.submit}));
import { IdentitySubmissionForm } from '@/components/identity/submission-form';
import { IdentityReviewForm } from '@/components/admin/identity-review-form';
import { IdentityError } from '@/lib/identity/contract';
beforeEach(()=>{vi.clearAllMocks();mocks.create.mockReset().mockReturnValue({});mocks.read.mockResolvedValue({role:'tenant',verification_status:'pending',userId:'fictional'});});
afterEach(cleanup);
test('eligible UI exposes status and gated submit with no hidden requests',async()=>{
 await act(async()=>{render(<IdentitySubmissionForm/>);});
 expect(screen.getByRole('button',{name:'Submit for human review'}).hasAttribute('disabled')).toBe(true);
 expect(screen.getByText(/No document can be uploaded/)).toBeTruthy();expect(mocks.submit).not.toHaveBeenCalled();
});
test.each(['verified','rejected'])('settled %s profile has no upload form',async status=>{
 mocks.read.mockResolvedValue({role:'tenant',verification_status:status});await act(async()=>{render(<IdentitySubmissionForm/>);});
 expect(screen.queryByLabelText(/One CNIC image/)).toBeNull();expect(screen.getByRole('status').textContent).toContain(status==='verified'?'not official NADRA':'rejected');
});
test.each(['AUTH','ROLE','UNAVAILABLE'] as const)('failed %s status load cannot submit',async code=>{
 mocks.read.mockRejectedValue(new IdentityError(code));await act(async()=>{render(<IdentitySubmissionForm/>);});
 expect(screen.queryByRole('button',{name:'Submit for human review'})).toBeNull();expect(screen.getByRole('status').textContent).toBe(new IdentityError(code).message);
});
test('file rejection is local and hides filename/private data',async()=>{
 await act(async()=>{render(<IdentitySubmissionForm/>);});
 const file=new File(['not a jpeg'],'PRIVATE_DOCUMENT.svg',{type:'image/svg+xml'});
 await act(async()=>fireEvent.change(screen.getByLabelText(/One CNIC image/),{target:{files:[file]}}));
 expect(screen.getByRole('status').textContent).toContain('Choose exactly one');expect(document.body.textContent).not.toContain('PRIVATE_DOCUMENT');expect(mocks.submit).not.toHaveBeenCalled();
});
test('review component has no callable privileged controls or false success',()=>{
 render(<IdentityReviewForm/>);expect(screen.queryByRole('button')).toBeNull();expect(screen.getByText(/No review has been recorded/)).toBeTruthy();
});
test('client initialization failure renders a private generic error instead of crashing',async()=>{
 mocks.create.mockImplementation(()=>{throw new Error('PRIVATE_CONFIGURATION');});await act(async()=>{render(<IdentitySubmissionForm/>);});
 expect(screen.getByRole('status').textContent).toBe('Identity information is unavailable.');expect(document.body.textContent).not.toContain('PRIVATE_CONFIGURATION');expect(mocks.submit).not.toHaveBeenCalled();
});
