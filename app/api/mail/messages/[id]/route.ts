import { NextResponse } from 'next/server';
import { mailService, MailApiError } from '@/lib/mail-service';

export const dynamic = 'force-dynamic';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Authorization bearer token required' }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await mailService.getMessage(token, id);
    return NextResponse.json(message);
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to retrieve message details' }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Authorization bearer token required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();

    if (typeof body.seen !== 'boolean') {
      return NextResponse.json({ error: 'Field "seen" must be a boolean' }, { status: 400 });
    }

    const updated = await mailService.updateMessageSeen(token, id, body.seen);
    return NextResponse.json(updated);
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to update message status' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    if (!token) {
      return NextResponse.json({ error: 'Authorization bearer token required' }, { status: 401 });
    }

    const { id } = await params;
    await mailService.deleteMessage(token, id);
    return NextResponse.json({ success: true, message: 'Message deleted successfully' });
  } catch (err: unknown) {
    if (err instanceof MailApiError) {
      return NextResponse.json({ error: err.message }, { status: err.status });
    }
    return NextResponse.json({ error: 'Failed to delete message' }, { status: 500 });
  }
}
