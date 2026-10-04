import {NextResponse} from 'next/server';
import {backend,noStore,publicReadCache} from '@/lib/backend';

type Category={name:string;slug:string;description:string;is_active:boolean};
export async function GET(){try{const data=await backend<{results:Category[]}|Category[]>('destinations/activity-categories/?page_size=100',publicReadCache('categories'));const rows=Array.isArray(data)?data:data.results;return NextResponse.json({categories:rows.filter(item=>item.is_active)},{headers:noStore});}catch{return NextResponse.json({categories:[]},{headers:noStore});}}
