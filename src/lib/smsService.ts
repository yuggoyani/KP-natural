/**
 * KP Natural Dairy Farm - Server-Side Multi-Provider SMS Dispatcher
 * Dispatches secure OTP messages to Indian mobile numbers via configured gateways.
 * (Secrets and keys remain strictly server-side)
 */

interface SendSmsOptions {
  mobileNumber: string; // 10-digit Indian number without +91
  otp: string;
}

export interface SendSmsResult {
  success: boolean;
  provider: string;
  messageId?: string;
  error?: string;
  isDemoMode?: boolean;
}

/**
 * Dispatch SMS containing the 6-digit OTP code
 */
export async function sendOtpSms({ mobileNumber, otp }: SendSmsOptions): Promise<SendSmsResult> {
  const cleanMobile = mobileNumber.replace(/\D/g, "");
  const last10 = cleanMobile.length >= 10 ? cleanMobile.slice(-10) : cleanMobile;
  const fullIndianMobile = `+91${last10}`;

  const messageText = `Your KP Natural Dairy Farm verification code is: ${otp}. Valid for 5 minutes. Do not share this OTP with anyone.`;

  const isProduction = process.env.NODE_ENV === "production" || process.env.VERCEL === "1";
  const explicitProvider = (process.env.SMS_PROVIDER || "").toLowerCase().trim();

  // 1. FAST2SMS PROVIDER (Primary recommendation for India)
  if (explicitProvider === "fast2sms" || process.env.FAST2SMS_API_KEY) {
    const apiKey = process.env.FAST2SMS_API_KEY?.trim();
    if (!apiKey) {
      console.error("[SMS Gateway] FAST2SMS_API_KEY is missing in environment variables.");
      return {
        success: false,
        provider: "fast2sms",
        error: "SMS provider configuration is incomplete.",
      };
    }

    try {
      const senderId = process.env.FAST2SMS_SENDER_ID?.trim();
      const templateId = process.env.FAST2SMS_TEMPLATE_ID?.trim();

      const payload: Record<string, any> = {
        numbers: last10,
      };

      if (senderId && templateId) {
        // DLT Route (preserved for future enterprise sender ID & template usage)
        payload.route = "dlt";
        payload.sender_id = senderId;
        payload.message = templateId;
        payload.variables_values = otp;
      } else {
        // Fast2SMS Quick SMS route ("q") - delivers custom OTP message without KYC block
        payload.route = "q";
        payload.message = messageText;
        payload.language = "english";
        payload.flash = 0;
      }

      const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
        method: "POST",
        headers: {
          authorization: apiKey,
          Authorization: apiKey,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      const isSuccess =
        data.return === true ||
        data.status_code === 200 ||
        (Array.isArray(data.message) && data.message[0]?.toLowerCase().includes("success"));

      if (isSuccess) {
        return {
          success: true,
          provider: "fast2sms",
          messageId: data.request_id || "fast2sms_sent",
        };
      }

      const errMsg = Array.isArray(data.message) ? data.message.join(", ") : (data.message || "Fast2SMS dispatch failed");
      console.error("[SMS Gateway] Fast2SMS Quick SMS dispatch returned error:", errMsg);
      return {
        success: false,
        provider: "fast2sms",
        error: "Unable to send OTP right now. Please check your mobile number and try again.",
      };
    } catch (err: any) {
      console.error("[SMS Gateway] Fast2SMS network/exception:", err?.message || err);
      return {
        success: false,
        provider: "fast2sms",
        error: "Unable to deliver OTP SMS. Please try again in a few moments.",
      };
    }
  }

  // 2. TWILIO PROVIDER
  if (
    explicitProvider === "twilio" ||
    (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_PHONE_NUMBER)
  ) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID?.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN?.trim();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER?.trim();

    if (!accountSid || !authToken || !fromNumber) {
      console.error("[SMS Gateway] Twilio configuration incomplete.");
      return {
        success: false,
        provider: "twilio",
        error: "Twilio SMS configuration is incomplete.",
      };
    }

    try {
      const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
      const params = new URLSearchParams();
      params.append("To", fullIndianMobile);
      params.append("From", fromNumber);
      params.append("Body", messageText);

      const auth = Buffer.from(`${accountSid}:${authToken}`).toString("base64");
      const res = await fetch(twilioUrl, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      const data = await res.json();
      if (res.ok && data.sid) {
        return { success: true, provider: "twilio", messageId: data.sid };
      }

      console.error("[SMS Gateway] Twilio dispatch returned error:", data.message || `Code ${data.code}`);
      return {
        success: false,
        provider: "twilio",
        error: "Unable to deliver OTP SMS via Twilio. Please try again.",
      };
    } catch (err: any) {
      console.error("[SMS Gateway] Twilio network/exception:", err?.message || err);
      return {
        success: false,
        provider: "twilio",
        error: "Twilio network error. Please try again.",
      };
    }
  }

  // 3. MSG91 PROVIDER
  if (explicitProvider === "msg91" || process.env.MSG91_AUTH_KEY) {
    const authKey = process.env.MSG91_AUTH_KEY?.trim();
    const templateId = process.env.MSG91_TEMPLATE_ID?.trim();

    if (!authKey) {
      console.error("[SMS Gateway] MSG91_AUTH_KEY is missing.");
      return {
        success: false,
        provider: "msg91",
        error: "MSG91 configuration is incomplete.",
      };
    }

    try {
      const url = `https://control.msg91.com/api/v5/otp?template_id=${templateId || ""}&mobile=91${last10}&authkey=${authKey}&otp=${otp}`;
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      const data = await res.json();
      if (data.type === "success") {
        return { success: true, provider: "msg91", messageId: data.message };
      }

      console.error("[SMS Gateway] MSG91 dispatch returned error:", data.message || data);
      return {
        success: false,
        provider: "msg91",
        error: "Unable to send OTP via MSG91. Please try again.",
      };
    } catch (err: any) {
      console.error("[SMS Gateway] MSG91 network/exception:", err?.message || err);
      return {
        success: false,
        provider: "msg91",
        error: "MSG91 network error. Please try again.",
      };
    }
  }

  // 4. PRODUCTION GATING: NEVER silently succeed without a real SMS gateway in production
  if (isProduction) {
    console.error(
      "[SMS Gateway] CRITICAL: No SMS provider (FAST2SMS_API_KEY, TWILIO, or MSG91) is configured in Vercel Production environment variables."
    );
    return {
      success: false,
      provider: "none",
      error: "SMS service is currently unconfigured on the server. Please contact support or try again shortly.",
    };
  }

  // 5. LOCAL DEVELOPMENT SIMULATION MODE (Only active when NOT in production)
  console.log("===============================================================");
  console.log(`[KP NATURAL SMS DISPATCHER] (LOCAL DEV SIMULATION MODE)`);
  console.log(`To: +91 ${last10}`);
  console.log(`Message: "${messageText}"`);
  console.log(`OTP Code: >>> [ ${otp} ] <<<`);
  console.log(`To test real SMS delivery, configure FAST2SMS_API_KEY in .env.local.`);
  console.log("===============================================================");

  return {
    success: true,
    provider: "simulation_dev_mode",
    isDemoMode: true,
  };
}
