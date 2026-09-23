import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {backend, apiError, noStore, readInput, requiredText} from '@/lib/backend';
import {projectTags, projectTag} from '@/lib/admin';

export async function GET() {
  try {
    const {headers} = await staffAccess();
    const data = await backend('inquiries/tags/', {headers});
    return NextResponse.json({data: projectTags(data)}, {headers: noStore});
  } catch (error) { return apiError(error); }
}

export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const name = requiredText(input, 'name', 50);
    const color = typeof input.color === 'string' && /^#[0-9a-fA-F]{6}$/.test(input.color) ? input.color : undefined;

    const {headers} = await staffAccess();
    const data = await backend('inquiries/tags/', {
      method: 'POST',
      headers,
      body: JSON.stringify(color ? {name, color} : {name}),
    });
    return NextResponse.json({data: projectTag(data)}, {status: 201, headers: noStore});
  } catch (error) { return apiError(error); }
}
