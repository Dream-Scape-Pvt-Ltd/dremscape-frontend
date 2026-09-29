import {cookies} from 'next/headers';
import {NextResponse} from 'next/server';
import {apiError, backend, BackendError, noStore, readInput, requiredText} from '@/lib/backend';
import type {BlogComment} from '@/lib/guides';

export async function POST(request: Request, {params}: {params: Promise<{slug:string}>}) {
  try {
    const input = await readInput(request);
    const {slug} = await params;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BackendError('Invalid blog post.', 400);
    const token = (await cookies()).get('dreamscape_session')?.value;
    if (!token) throw new BackendError('Please sign in before posting a comment.', 401);
    const comment = await backend<BlogComment>(`content/guides/${slug}/comments/`, {method:'POST', headers:{Authorization:`Bearer ${token}`}, body:JSON.stringify({body:requiredText(input,'body',2000)})});
    return NextResponse.json({comment}, {status:201, headers:noStore});
  } catch (error) {
    return apiError(error);
  }
}
