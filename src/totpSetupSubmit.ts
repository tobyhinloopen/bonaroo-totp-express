import { NextFunction, Request, Response } from "express";
import * as speakeasy from "speakeasy";

export function totpSetupSubmit() {
  return (req: Request, res: Response, next: NextFunction) => {

    const totpErrorCodes: string[] = [];
    res.locals.totpErrorCodes = totpErrorCodes;

    const { token, secret } = req.body;
    if (!token) {
      totpErrorCodes.push("TOKEN_REQUIRED");
    }
    if (!secret) {
      totpErrorCodes.push("SECRET_REQUIRED");
    }

    if (totpErrorCodes.length > 0) {
      next();
      return;
    }

    const isVerifiedToken = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token,
      window: 2
    });
    if (!isVerifiedToken) {
      totpErrorCodes.push("TOKEN_VERIFY_FAILURE");
    }

    next();
  };
}
