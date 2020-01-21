import { Handler, Request, Router } from "express";
import { generateSecret } from "speakeasy";
import { totpAuthUrl } from "./totpAuthUrl";
import { totpQrCode } from "./totpQrCode";

/**
 * Generate a new secret and QR code and assign them to `totp.secret` and
 * `totp.qrCodeUrl`.
 */
export function totpSetupForm(options: totpSetupForm.IOptions): Handler {
  return Router().use(
    totpSetupForm.assignSecret,
    totpAuthUrl(options),
    totpQrCode(),
  );
}

export namespace totpSetupForm {
  export type IOptions = totpAuthUrl.IOptions;

  export function assignSecret(req: Request, res, next) {
    const secret = generateSecret({ otpauth_url: false });
    req.totp.secret = secret.base32;
    next();
  }
}
