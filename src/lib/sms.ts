/**
 * SMS delivery abstraction. Swap the provider implementation without
 * changing any caller code.
 *
 * For development: logs the OTP code to the console instead of sending SMS.
 * For production: integrates with the configured SMS provider (Twilio by default).
 */
import 'server-only';

export type SmsSendResult =
  | { success: true }
  | { success: false; reason: string };

export async function sendOtpSms(phone: string, code: string): Promise<SmsSendResult> {
  if (process.env.NODE_ENV !== 'production') {
    // Development — print to stdout, never to client
    console.log(`[DEV] OTP for ${phone}: ${code}`);
    return { success: true };
  }

  // Production — Twilio REST API (minimal, no SDK dependency)
  const accountSid = process.env.SMS_PROVIDER_ACCOUNT_SID;
  const apiKey = process.env.SMS_PROVIDER_API_KEY;
  const from = process.env.SMS_FROM_NUMBER;

  if (!accountSid || !apiKey || !from) {
    console.error('[SMS] Provider credentials are not configured');
    return { success: false, reason: 'sms_not_configured' };
  }

  try {
    const body = new URLSearchParams({
      To: phone,
      From: from,
      Body: `Your PlayBite code is: ${code}. It expires in 5 minutes.`,
    });

    const res = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${accountSid}:${apiKey}`).toString('base64')}`,
        },
        body: body.toString(),
      },
    );

    if (!res.ok) {
      const err = await res.text();
      console.error('[SMS] Twilio error:', err);
      return { success: false, reason: 'sms_delivery_failed' };
    }

    return { success: true };
  } catch (err) {
    console.error('[SMS] Network error:', err);
    return { success: false, reason: 'sms_network_error' };
  }
}
