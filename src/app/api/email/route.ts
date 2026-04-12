import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email service is not configured.' },
      { status: 503 }
    );
  }

  try {
    const { to, subject, html, text } = await request.json();

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'Promptimzer <noreply@promptimzer.com>',
        to,
        subject,
        html,
        text,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: `Failed to send email: ${JSON.stringify(error)}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { error: 'Failed to send email.' },
      { status: 500 }
    );
  }
}
