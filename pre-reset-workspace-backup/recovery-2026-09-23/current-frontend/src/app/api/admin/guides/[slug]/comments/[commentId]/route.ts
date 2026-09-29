import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {apiError, backend, BackendError, noStore} from '@/lib/backend';

type Context = {params: Promise<{slug: string; commentId: string}>};

export async function DELETE(_request: Request, {params}: Context) {
  try {
    const {slug, commentId} = await params;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) || !/^[0-9a-f-]{36}$/i.test(commentId)) throw new BackendError('Invalid blog comment.', 400);
    const {headers} = await staffAccess();
    await backend(`content/guides/${slug}/comments/${commentId}/`, {method: 'DELETE', headers});
    return NextResponse.json({success: true}, {headers: noStore});
  } catch (error) {
    return apiError(error);
  }
}
