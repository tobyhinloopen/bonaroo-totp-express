import { Handler, Request, Router } from "express";
import { totpVerify } from "./totpVerify";

/**
 * Extract totp token from request body and verify it against a secret fetched
 * from `getUserTotpSecret` in `options`.
 *
 * Assign `totp.verified` with `true` on success, or `totp.errorCodes` with
 * error codes on failure.
 */
export function totpVerifySubmit(options: Partial<totpVerifySubmit.IOptions> = {}): Handler {
  return Router().use(
    totpVerifySubmit.assignSecretAndTokenForVerification(options),
    totpVerify(),
  );
}

export namespace totpVerifySubmit {
  export function assignSecretAndTokenForVerification(options: Partial<IOptions> = {}): Handler {
    const { getUserTotpSecret } = { ...DEFAULT_OPTIONS, ...options };
    return async (req: Request, res, next) => {
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
