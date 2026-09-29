import {redirect} from 'next/navigation';
export default async function Page({searchParams}:{searchParams:Promise<{q?:string}>}){redirect(`/treks?q=${encodeURIComponent((await searchParams).q||'')}`);}
