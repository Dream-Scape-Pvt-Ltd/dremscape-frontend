import {NextResponse} from 'next/server';
import {staffAccess} from '@/lib/staff';
import {noStore} from '@/lib/backend';

export async function GET() {
  try {
    const {user} = await staffAccess();
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          full_name: user.full_name,
          role: user.role,
        },
      },
      {headers: noStore}
    );
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        error: error instanceof Error ? error.message : 'Unauthenticated',
      },
      {status: 401, headers: noStore}
    );
  }
}
