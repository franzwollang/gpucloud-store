/**
 * Vercel Serverless function to accept contact form submissions and forward via SendGrid.
 *
 * Environment variables expected to enable sending:
 * - SENDGRID_API_KEY: SendGrid API key
 * - SENDGRID_FROM: verified sender email (e.g. "no-reply@yourdomain.com")
 * - SENDGRID_TO: recipient email for inbound contact messages (e.g. "you@company.com")
 *
 * If SENDGRID_API_KEY is not set the endpoint will return 501 with instructions.
 */

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, company, email, role, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Missing required fields: name, email, message' });
    }

    const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
    const FROM = process.env.SENDGRID_FROM || process.env.SENDGRID_TO || 'no-reply@example.com';
    const TO = process.env.SENDGRID_TO || process.env.SENDGRID_FROM || null;

    if (!SENDGRID_API_KEY || !TO) {
      return res.status(501).json({
        error: 'Email provider not configured. Set SENDGRID_API_KEY and SENDGRID_TO (or SENDGRID_FROM) environment variables in Vercel.'
      });
    }

    // construct email body
    const subject = `New contact from ${name} - GPUcloud.store`;
    const plainText = [
      `Name: ${name}`,
      `Company: ${company || '-'} `,
      `Email: ${email}`,
      `Role: ${role || '-'} `,
      '',
      'Message:',
      message
    ].join('\n');

    const sendgridPayload = {
      personalizations: [
        {
          to: [{ email: TO }],
          subject
        }
      ],
      from: { email: FROM },
      content: [
        { type: 'text/plain', value: plainText },
        { type: 'text/html', value: `<pre style="white-space:pre-wrap">${plainText}</pre>` }
      ]
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(sendgridPayload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ error: 'SendGrid error', detail: text });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Internal server error' });
  }
}