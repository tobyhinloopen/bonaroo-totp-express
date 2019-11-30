import { ITotpState } from "./ITotpState";

declare namespace Express {
  export interface Request {
    totp?: ITotpState;
  }
}

declare module "express" {
  export interface Request {
    totp?: ITotpState;
  }
}
