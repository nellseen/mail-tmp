import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mailService, MailApiError } from '@/lib/mail-service';

export const dynamic = 'force-dynamic';

const CreateAccountSchema = z.object({
  address: z.string().email({ message: 'Valid email address format required' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = CreateAccountSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input data' },
        { status: 400 }
      );
    }

    const { address, password } = parsed.data;

    // 1. Create account on Mail.tm
    const account = await mailService.createAccount(address, password);

    // 2. Fetch token immediately for seamless initialization
    const tokenData = await mailService.getToken(address, password);

    return NextResponse.json(
      {
        account,
        token: tokenData.token,
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message, details: err.data }, { status: err.status });
    }
    return NextResponse.json(
      { error: (err as Error)?.message || 'Failed to create mailbox account' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Authorization token required' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const accountId = searchParams.get('id');

    if (!accountId) {
      return NextResponse.json({ error: 'Account ID required' }, { status: 400 });
    }

    await mailService.deleteAccount(token, accountId);
    return NextResponse.json({ success: true, message: 'Mailbox account deleted successfully' });
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to delete account' }, { status: 500 });
  }
}
