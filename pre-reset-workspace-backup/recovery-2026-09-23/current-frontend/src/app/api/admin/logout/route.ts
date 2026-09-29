import {NextResponse} from 'next/server';
import {noStore} from '@/lib/backend';

export async function POST(request: Request) {
  const isSecure = request.headers.get('x-forwarded-proto') === 'https' || new URL(request.url).protocol === 'https:';
  const response = NextResponse.json(
    {success: true, message: 'Signed out of Expedition Control.'},
    {headers: noStore}
  );

  response.cookies.set('dreamscape_session', '', {
    httpOnly: true,
    sameSite: 'lax',
    secure: isSecure,
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
