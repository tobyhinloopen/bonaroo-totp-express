import * as express from "express";
import { NextFunction, Request, Response } from "express";
import { totpVerify } from "./totpVerify";
import "./types";

export function totpSetupSubmit(options: Partial<totpSetupSubmit.IOptions> = {}) {
  const app = express();

  app.use(totpSetupSubmit.extractTokenAndSecretForSubmission);
  app.use(totpVerify);
  app.use(totpSetupSubmit.completeSubmitAfterVerification(options));

  return app;
}

export namespace totpSetupSubmit {
  export function extractTokenAndSecretForSubmission(req: Request, res: Response, next: NextFunction) {
    const { token, secret } = req.body;
    req.totp.secret = secret;
    req.totp.token = token;
    next();
  }

  export function completeSubmitAfterVerification(options: Partial<IOptions> = {}) {
    const { setUserTotpSecret } = { ...DEFAULT_OPTIONS, ...options };
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        req.totp.setupSuccess = req.totp.verified;
        if (req.totp.setupSuccess) {
          await setUserTotpSecret(req, req.totp.secret!);
        }
        next();
      } catch (error) {
        next(error);
      }
    };
  }

  export interface IOptions {
    setUserTotpSecret(req: Request, secret: string): Promise<void>|void;
  }

  export const DEFAULT_OPTIONS: IOptions = {
    setUserTotpSecret: () => { /* NOOP */ },
  };
}
