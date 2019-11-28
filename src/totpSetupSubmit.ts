import { NextFunction, Request, Response } from "express";
import * as speakeasy from "speakeasy";

export function totpSetupSubmit(options: Partial<totpSetupSubmit.Options> = {}) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { setUserTotpSecret } = { ...totpSetupSubmit.DEFAULT_OPTIONS, ...options };

      const totpErrorCodes: string[] = [];
      res.locals.totpErrorCodes = totpErrorCodes;
      res.locals.totpVerified = req.totpVerified = false;
      res.locals.totpSetupSuccess = req.totpSetupSuccess = false;

      const { token, secret } = req.body;

      res.locals.totpSecret = req.totpSecret = secret;

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
        next();
        return;
      }

      await setUserTotpSecret(req, secret);

      res.locals.totpVerified = req.totpVerified = true;
      res.locals.totpSetupSuccess = req.totpSetupSuccess = true;

      next();
    } catch (error) {
      next(error);
    }
  };
}

export namespace totpSetupSubmit {
  export interface Options {
    setUserTotpSecret(req: Request, secret: string): Promise<void>|void;
  }

  export const DEFAULT_OPTIONS: Options = {
    setUserTotpSecret: () => {},
  };
}
