import { Handler, Request } from "express";
import { toDataURL } from "qrcode";

/**
 * Express middleware to generate and assign the QR code url to `totp.qrCodeUrl`
 * based on `totp.authUrl`.
 */
export function totpQrCode(): Handler {
  return (req: Request, res, next) => {
    if (!req.totp.authUrl) {
      next();
      return;
    }
    toDataURL(req.totp.authUrl, (err, url) => {
      if (err) {
        next(err);
        return;
      }
      req.totp.qrCodeUrl = url;
      next();
    });
  };
}
