import {NextResponse} from 'next/server';
import {apiError, assertSameOrigin, backend, BackendError, noStore} from '@/lib/backend';

export async function POST(request: Request, {params}: {params: Promise<{slug:string}>}) {
  try {
    assertSameOrigin(request);
    const {slug} = await params;
    if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new BackendError('Invalid blog post.', 400);
    const data = await backend<{view_count:number}>(`content/guides/${slug}/view/`, {method:'POST'});
    return NextResponse.json(data, {headers:noStore});
  } catch (error) {
    return apiError(error);
  }
}
