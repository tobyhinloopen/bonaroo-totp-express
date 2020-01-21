import { Handler, NextFunction, Request, Response, Router } from "express";
import { totpVerify } from "./totpVerify";

/**
 * Extract the secret and token from the request body, verify the token against
 * the secret, and store the secret when verification was successful using
 * `setUserTotpSecret` in `options`.
 */
export function totpSetupSubmit(options: Partial<totpSetupSubmit.IOptions> = {}): Handler {
  return Router().use(
    totpSetupSubmit.extractTokenAndSecretForSubmission,
    totpVerify(),
    totpSetupSubmit.completeSubmitAfterVerification(options),
  );
}

export namespace totpSetupSubmit {
  export function extractTokenAndSecretForSubmission(req: Request, res: Response, next: NextFunction) {
    const { token, secret } = req.body;
    req.totp.secret = secret;
    req.totp.token = token;
    next();
  }

  export function completeSubmitAfterVerification(options: Partial<IOptions> = {}): Handler {
    const { setUserTotpSecret } = { ...DEFAULT_OPTIONS, ...options };
    return async (req: Request, res, next) => {
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
