import { z } from 'zod';
export const uuid = z.uuid();
export const bodySchema = z.string().trim().min(1).max(3000).refine(v => new TextEncoder().encode(v).length <= 12000);
export const sendSchema = z.object({ conversationId: uuid, requestId: uuid, body: bodySchema }).strict();
// Preserve PostgreSQL microseconds verbatim; parsing into JS Date loses precision.
const timestamp = z.string().max(40).regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d{1,6})?(Z|[+-]\d{2}:\d{2})$/).refine(v => Number.isFinite(Date.parse(v)));
export const cursorSchema = z.object({ at: timestamp, id: uuid }).strict();
export type Cursor = z.infer<typeof cursorSchema>;
export function parseCursor(value: string | string[] | undefined): Cursor | null {
  if (value === undefined) return null;
  try { if (typeof value !== 'string' || value.length > 200) throw Error(); return cursorSchema.parse(JSON.parse(value)); }
  catch { throw new ChatError('INVALID'); }
}
export const encodeCursor = (c: Cursor) => JSON.stringify(cursorSchema.parse(c));
export class ChatError extends Error {
  constructor(public code: 'AUTH'|'FORBIDDEN'|'INVALID'|'UNAVAILABLE'|'THROTTLED'|'NOT_READY') {
    super({ AUTH:'Sign in to continue.',FORBIDDEN:'This conversation is not available to this account.',INVALID:'Check the message, reference or page cursor.',UNAVAILABLE:'Unable to confirm this operation. Retry the same request; no success is confirmed.',THROTTLED:'Too many requests. Wait a minute before retrying.',NOT_READY:'Messaging writes and read-state updates are unavailable pending database validation.' }[code]);
  }
}
export const messageSchema = z.object({ id:uuid,conversation_id:uuid,sender_id:uuid,body:z.string().max(3000),created_at:timestamp });
export const conversationSchema = z.object({id:uuid,tenant_id:uuid,landlord_id:uuid,property_id:uuid,last_message_at:timestamp.nullable()});
