import { NextResponse } from 'next/server';
import { z } from 'zod';
import { mailService, MailApiError } from '@/lib/mail-service';

export const dynamic = 'force-dynamic';

const LoginSchema = z.object({
  address: z.string().email({ message: 'Valid email address format required' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = LoginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || 'Invalid input credentials' },
        { status: 400 }
      );
    }

    const { address, password } = parsed.data;
    const tokenData = await mailService.getToken(address, password);

    // Also fetch account details for the client
    const account = await mailService.getMe(tokenData.token);

    return NextResponse.json({
      token: tokenData.token,
      account,
    });
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to authenticate mailbox' }, { status: 500 });
  }
}
