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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);

    const data = await mailService.getMessages(token, page);

    return NextResponse.json({
      messages: data['hydra:member'] || [],
      totalItems: data['hydra:totalItems'] || 0,
      page,
    });
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to retrieve messages' }, { status: 500 });
  }
}
