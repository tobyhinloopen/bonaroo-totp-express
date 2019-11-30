import { NextFunction, Request, Response } from "express";
import * as speakeasy from "speakeasy";
import "./types";

export function totpVerify(req: Request, res: Response, next: NextFunction) {
  const errorCodes = req.totp.errorCodes = [] as string[];
  const { token, secret } = req.totp;

  if (!token) {
    errorCodes.push("TOKEN_REQUIRED");
  }
  if (!secret) {
    errorCodes.push("SECRET_REQUIRED");
  }

  if (errorCodes.length > 0) {
    next();
    return;
  }

  req.totp.verified = speakeasy.totp.verify({
    secret,
    encoding: "base32",
    token,
    window: 2,
  });

  if (!req.totp.verified) {
    errorCodes.push("TOKEN_VERIFY_FAILURE");
  }

  next();
}
