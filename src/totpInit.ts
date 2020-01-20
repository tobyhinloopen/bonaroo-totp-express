import { Handler, Request } from "express";

/**
 * Assign a blank ITotpState on `req.totp` and `res.locals.totp`.
 */
export function totpInit(options?: any): Handler {
  return (req: Request, res, next) => {
    if (!req.totp) {
      res.locals.totp = req.totp = {};
    }
    req.totp.verified = false;
    next();
  };
}
