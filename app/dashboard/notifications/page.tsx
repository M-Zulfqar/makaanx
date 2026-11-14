import { NotificationsPage } from '@/components/notifications/page';
import type { SearchParams } from '@/lib/rentals/schema';
export const dynamic='force-dynamic';
export default function Page({searchParams}:{searchParams:Promise<SearchParams>}){return <NotificationsPage area="dashboard" searchParams={searchParams}/>;}
