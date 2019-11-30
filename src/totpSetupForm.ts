import { NextFunction, Request, Response } from "express";
import { toDataURL } from "qrcode";
import { generateSecret } from "speakeasy";

export function totpSetupForm() {
  return (req: Request, res: Response, next: NextFunction) => {
    const secret = generateSecret();
    req.totp.secret = secret.base32;
    toDataURL(secret.otpauth_url, (err, url) => {
      req.totp.qrCodeUrl = url;
      next();
    });
  };
}
