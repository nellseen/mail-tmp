import { NextResponse } from 'next/server';
import { mailService, MailApiError } from '@/lib/mail-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Authorization bearer token required' }, { status: 401 });
    }

    const account = await mailService.getMe(token);
    return NextResponse.json(account);
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to fetch account info' }, { status: 500 });
  }
}
