import { InboxView } from '@/components/messages/inbox';
import type { SearchParams } from '@/lib/rentals/schema';
export const dynamic='force-dynamic';
export default function Page({searchParams}:{searchParams:Promise<SearchParams>}){return <InboxView role="landlord" searchParams={searchParams}/>;}
