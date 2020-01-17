import { Handler, Request } from "express";
import { toDataURL } from "qrcode";
import { generateSecret } from "speakeasy";

/**
 * Generate a new secret and QR code and assign them to `totp.secret` and
 * `totp.qrCodeUrl`.
 */
export function totpSetupForm(): Handler {
  return (req: Request, res, next) => {
    const secret = generateSecret();
    req.totp.secret = secret.base32;
    toDataURL(secret.otpauth_url, (err, url) => {
      req.totp.qrCodeUrl = url;
      next();
    });
  };
}
