'use client';
export default function Error({reset}:{reset:()=>void}){return <div className="space-y-3 p-6"><p role="alert">Messages are unavailable.</p><button onClick={reset} className="underline">Retry</button></div>;}
