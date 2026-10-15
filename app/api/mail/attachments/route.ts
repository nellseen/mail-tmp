import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');

    const { searchParams } = new URL(req.url);
    const downloadUrl = searchParams.get('url');
    const filenameParam = searchParams.get('filename') || 'attachment';

    if (!downloadUrl) {
      return NextResponse.json({ error: 'Download URL is required' }, { status: 400 });
    }

    // Ensure the target URL is strictly hosted on api.mail.tm
    let targetUrl: URL;
    try {
      targetUrl = new URL(downloadUrl, 'https://api.mail.tm');
      if (targetUrl.hostname !== 'api.mail.tm') {
        return NextResponse.json({ error: 'Invalid attachment target host' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Malformed download URL' }, { status: 400 });
    }

    const headers: Record<string, string> = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(targetUrl.toString(), {
      headers,
    });

    if (!res.ok) {
      return NextResponse.json(
        { error: `Provider error downloading attachment: HTTP ${res.status}` },
        { status: res.status }
      );
    }

    const arrayBuffer = await res.arrayBuffer();

    // Sanitize filename to prevent header injection or directory traversal
    const safeFilename = filenameParam
      .replace(/[^a-zA-Z0-9._-]/g, '_')
      .replace(/^\.+/, '') || 'attachment.dat';

    // Disallow dangerous executable types from being executed or opened inline
    const contentType = res.headers.get('content-type') || 'application/octet-stream';
    const isDangerousExecutable = /\.(exe|bat|cmd|sh|vbs|ps1|scr|msi|dll)$/i.test(safeFilename);

    const safeContentType = isDangerousExecutable
      ? 'application/octet-stream'
      : contentType;

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': safeContentType,
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
        'X-Content-Type-Options': 'nosniff',
        'Cache-Control': 'private, no-transform, no-cache',
      },
    });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: (err as Error)?.message || 'Failed to download attachment' },
      { status: 500 }
    );
  }
}
