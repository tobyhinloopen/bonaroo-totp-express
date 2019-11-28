declare namespace Express {
  export interface Request {
    totpVerified?: boolean;
    totpSecret?: string;
    totpSetupSuccess?: boolean;
  }
}
