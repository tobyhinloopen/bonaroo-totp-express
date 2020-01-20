import { Handler, Request } from "express";
import * as speakeasy from "speakeasy";

/**
 * Verify `totp.token` against `totp.secret` and assign `totp.verified` with
 * `true` on success, or `totp.errorCodes` with error codes on failure.
 */
export function totpVerify(): Handler {
  return (req: Request, res, next) => {
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
  };
}
