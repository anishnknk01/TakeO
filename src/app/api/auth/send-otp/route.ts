import { NextRequest, NextResponse } from 'next/server';
import { generateOtp } from '@/lib/otp';
import { sendOtpSms } from '@/lib/sms';
import { z } from 'zod';

const Body = z.object({
  phone: z.string().regex(/^\+91[6-9]\d{9}$/),
  scope: z.string().optional().default('global'),
});

/**
 * POST /api/auth/send-otp
 * Generates and delivers an OTP to the given phone number.
 * Rate-limited at the OTP library layer.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = Body.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const { phone, scope } = parsed.data;
  const result = await generateOtp(phone, scope);

  if (!result.success) {
    const statusCode = result.reason === 'rate_limited' ? 429 : 429;
    return NextResponse.json(
      { error: result.reason, retryAfterSeconds: result.retryAfterSeconds },
      { status: statusCode },
    );
  }

  const smsResult = await sendOtpSms(phone, result.code);
  if (!smsResult.success) {
    return NextResponse.json({ error: 'sms_delivery_failed' }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    cooldownSeconds: result.cooldownSeconds,
    // Only in dev — never expose in production
    ...(process.env.NODE_ENV !== 'production' ? { _devCode: result.code } : {}),
  });
}
