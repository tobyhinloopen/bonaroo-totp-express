import * as express from "express";
import { NextFunction, Request, Response } from "express";
import { totpVerify } from "./totpVerify";
import "./types";

export function totpVerifySubmit(options: Partial<totpVerifySubmit.IOptions> = {}) {
  const app = express();

  app.use(totpVerifySubmit.assignSecretAndTokenForVerification(options));
  app.use(totpVerify);

  return app;
}

export namespace totpVerifySubmit {
  export function assignSecretAndTokenForVerification(options: Partial<IOptions> = {}) {
    const { getUserTotpSecret } = { ...DEFAULT_OPTIONS, ...options };
    return async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { token } = req.body;
        const secret = await getUserTotpSecret(req);

        req.totp.secret = secret;
        req.totp.token = token;

        next();
      } catch (error) {
        next(error);
      }
    };
  }

  export interface IOptions {
    getUserTotpSecret(req: Request): Promise<string>|string;
  }

  export const DEFAULT_OPTIONS: IOptions = {
    getUserTotpSecret: () => { throw new Error(`getUserTotpSecret not implemented`); },
  };
}
