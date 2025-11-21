import { NextRequest, NextResponse } from 'next/server';

/**
 * API route to accept contact form submissions and forward via SendGrid.
 *
 * Environment variables expected to enable sending:
 * - SENDGRID_API_KEY: SendGrid API key
 * - SENDGRID_FROM: verified sender email (e.g. "no-reply@yourdomain.com")
 * - SENDGRID_TO: recipient email for inbound contact messages (e.g. "you@company.com")
 *
 * If SENDGRID_API_KEY is not set the endpoint will return 501 with instructions.
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, company, email, role, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, message' },
        { status: 400 }
      );
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM = process.env.SENDGRID_FROM || process.env.SENDGRID_TO || 'no-reply@example.com';
    const TO = process.env.SENDGRID_TO || process.env.SENDGRID_FROM || null;

    if (!SENDGRID_API_KEY || !TO) {
      return NextResponse.json(
        {
          error:
            'Email provider not configured. Set SENDGRID_API_KEY and SENDGRID_TO (or SENDGRID_FROM) environment variables.',
        },
        { status: 501 }
      );
    }

    // Construct email body
    const subject = `New contact from ${name} - GPUcloud.store`;
    const plainText = [
      `Name: ${name}`,
      `Company: ${company || '-'}`,
      `Email: ${email}`,
      `Role: ${role || '-'}`,
      '',
      'Message:',
      message,
    ].join('\n');

    const sendgridPayload = {
      personalizations: [
        {
          to: [{ email: TO }],
          subject,
        },
      ],
      from: { email: FROM },
      content: [
        { type: 'text/plain', value: plainText },
        {
          type: 'text/html',
          value: `<pre style="white-space:pre-wrap">${plainText}</pre>`,
        },
      ],
    };

    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendgridPayload),
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json({ error: 'SendGrid error', detail: text }, { status: 502 });
    }

    return NextResponse.json({ ok: true }, { status: 200 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

