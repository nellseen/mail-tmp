import { NextResponse } from 'next/server';
import { mailService, MailApiError } from '@/lib/mail-service';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const data = await mailService.getDomains(page);
    return NextResponse.json({
      domains: data['hydra:member'] || [],
      totalItems: data['hydra:totalItems'] || 0,
    });
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to retrieve available domains' }, { status: 500 });
  }
}
