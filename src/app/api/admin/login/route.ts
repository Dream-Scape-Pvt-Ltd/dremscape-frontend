import {NextResponse} from 'next/server';
import {backend, apiError, BackendError, readInput, requiredText, emailInput, noStore} from '@/lib/backend';

export async function POST(request: Request) {
  try {
    const input = await readInput(request);
    const email = emailInput(input);
    const password = requiredText(input, 'password', 1024);

    const payload = {email, password};
    const res = await backend<{
      access?: string;
      refresh?: string;
      user?: {
        id: string;
        email: string;
        full_name?: string;
        first_name?: string;
        last_name?: string;
        role: string;
      };
    }>('auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!res.access || !res.user) {
      throw new BackendError('Authentication response invalid. Please try again.');
    }

    const role = res.user.role;
    if (!['ADMIN', 'SALES_AGENT'].includes(role)) {
      throw new BackendError(
        'Access denied. This workspace requires administrative staff credentials.',
        403
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        user: {
          id: res.user.id,
          email: res.user.email,
          full_name: res.user.full_name || `${res.user.first_name || ''} ${res.user.last_name || ''}`.trim() || 'Staff Member',
          role: res.user.role,
        },
      },
      {headers: noStore}
    );

    const isSecure = request.headers.get('x-forwarded-proto') === 'https' || new URL(request.url).protocol === 'https:';

    // Set HTTP-only session cookie for the Django access token
    response.cookies.set('dreamscape_session', res.access, {
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      path: '/',
    });

    return response;
  } catch (error) {
    return apiError(error);
  }
}
