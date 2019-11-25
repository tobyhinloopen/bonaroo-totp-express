import { NextFunction, Request, Response } from "express";
import { toDataURL } from "qrcode";
import { generateSecret } from "speakeasy";

export function totpSetupForm() {
  return (req: Request, res: Response, next: NextFunction) => {
    const secret = generateSecret();
    res.locals.totpSecret = secret.base32;
    toDataURL(secret.otpauth_url, (err, url) => {
      res.locals.totpQrCodeUrl = url;
      next();
    });
  };
}
