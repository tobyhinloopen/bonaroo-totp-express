export interface ITotpState {
  verified?: boolean;
  secret?: string;
  setupSuccess?: boolean;
  token?: string;
  qrCodeUrl?: string;
  errorCodes?: string[];
}
