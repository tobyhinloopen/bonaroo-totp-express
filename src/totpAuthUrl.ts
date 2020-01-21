import { Handler, Request } from "express";
import { otpauthURL } from "speakeasy";

/**
 * Express middleware to generate and assign `totp.authUrl` based on
 * `totp.secret`.
 */
export function totpAuthUrl({ label, issuer }: totpAuthUrl.IOptions): Handler {
  return (req: Request, res, next) => {
    if (req.totp.secret) {
      req.totp.authUrl = otpauthURL({
        secret: req.totp.secret,
        encoding: "base32",
        label,
        issuer,
      });
    }
    next();
  };
}

export namespace totpAuthUrl {
  export interface IOptions {
    /**
     * The label is used to identify which account a key is associated with.
     * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format#label
     */
    label: string;

    /**
     * The issuer is a string value indicating the provider or service this
     * account is associated with.
     * @see https://github.com/google/google-authenticator/wiki/Key-Uri-Format#issuer
     */
    issuer?: string;
  }
}
