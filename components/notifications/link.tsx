import Link from 'next/link';
import { Bell } from 'lucide-react';
export function NotificationsLink({href}:{href:string}){return <Link href={href} aria-label="Notifications" className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md hover:bg-muted"><Bell className="h-5 w-5"/></Link>;}
