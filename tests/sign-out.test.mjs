import { test } from 'vitest';
import assert from 'node:assert/strict';
import { signOutAndRedirect } from '../lib/auth/sign-out.ts';

test('logout waits for local session removal before navigating', async () => {
  let finish;
  const pending = new Promise(resolve => { finish = resolve; });
  const events = [];
  const result = signOutAndRedirect({ auth: { signOut: options => {
    assert.deepEqual(options, { scope: 'local' });
    events.push('signOut');
    return pending;
  } } }, () => events.push('navigate'));
  assert.deepEqual(events, ['signOut']);
  finish({ error: null });
  await result;
  assert.deepEqual(events, ['signOut', 'navigate']);
});

test('logout failure does not navigate or report success', async () => {
  const failure = new Error('session removal failed');
  await assert.rejects(signOutAndRedirect({ auth: { signOut: async () => ({ error: failure }) } },
    () => assert.fail('must remain on page')), failure);
});

test('network exceptions leave navigation untouched', async () => {
  await assert.rejects(signOutAndRedirect({ auth: { signOut: async () => { throw new Error('offline'); } } },
    () => assert.fail('must remain on page')), /offline/);
});
