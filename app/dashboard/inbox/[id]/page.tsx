import { ThreadView } from '@/components/messages/inbox';
import type { SearchParams } from '@/lib/rentals/schema';
export const dynamic='force-dynamic';
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<SearchParams>}){return <ThreadView role="tenant" id={(await params).id} searchParams={searchParams}/>;}
