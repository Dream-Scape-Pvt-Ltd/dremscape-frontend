import { NextResponse } from 'next/server';
import {backend,apiError,BackendError,readInput,requiredText,emailInput,noStore} from '@/lib/backend';
export async function POST(request: Request) {
  try {
    const input=await readInput(request);
    const payload:Record<string,unknown>={full_name:requiredText(input,'full_name',150),email:emailInput(input),message:requiredText(input,'message',5000),inquiry_type:input.trip?'JOURNEY':'GENERAL',lead_source:'website'};
    for(const key of ['trip','departure','phone','preferred_dates']) if(input[key]) payload[key]=requiredText(input,key,key==='preferred_dates'?255:50);
    if(input.group_size){const size=Number(input.group_size);if(!Number.isInteger(size)||size<1||size>100) throw new BackendError('Please enter a group size between 1 and 100.',400);payload.group_size=size;}
    const data=await backend<{inquiry_number:string}>('inquiries/',{method:'POST',body:JSON.stringify(payload)});
    if(!data.inquiry_number) throw new BackendError('We could not confirm your inquiry reference. Please contact the team before submitting again.');
    return NextResponse.json({success:true,reference:data.inquiry_number},{status:201,headers:noStore});
  } catch(error){return apiError(error);}
}
