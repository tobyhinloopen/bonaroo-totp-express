/**
 * An interface representing the current TOTP state, present on every request.
 */
export interface ITotpState {
  /**
   * Whether the TOTP code was verified this request (or earlier in the session)
   */
  verified?: boolean;

  /**
   * The current TOTP secret as a BASE32 string. Only set for setup and verify.
   * The secret should only be exposed to the user in setup.
   */
  secret?: string;

  /**
   * Whether the setup for this exact request was successful.
   */
  setupSuccess?: boolean;

  /**
   * The current user-provided 6-digit token or password. Only set for setup and
   * verify.
   */
  token?: string;

  /**
   * QR code representing the current secret. Only set for setup.
   */
  qrCodeUrl?: string;

  /**
   * Error codes. Only set for setup and verify. Empty array means no errors.
   */
  errorCodes?: string[];
}
