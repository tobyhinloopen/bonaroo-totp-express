import { totpInit } from "../src/totpInit";
import { totpSetupForm } from "../src/totpSetupForm";
import { expectAndParseQrCodeDataUrl } from "./support/expectAndParseQrCode";
import { parse } from "url";
import { testMiddleware } from "./support";

const OPTS: totpSetupForm.IOptions = {
  label: "info@example.com",
};

test("totpSetupForm assigns a secret and qr code", () => testMiddleware(
  [totpInit({}), totpSetupForm(OPTS)],
  async (req, res) => {
    expect(typeof req.totp.secret).toEqual("string");
    expect(typeof req.totp.qrCodeUrl).toEqual("string");
  }),
);

test("totpSetupForm's totpQrCodeUrl is a QR code containing an OTP auth url", () => testMiddleware(
  [totpInit({}), totpSetupForm(OPTS)],
  async (req, res) => {
    const value = await expectAndParseQrCodeDataUrl(req.totp.qrCodeUrl);
    const url = parse(value, true);
    expect(url).toMatchObject({
      protocol: "otpauth:",
      slashes: true,
      host: "totp",
      query: { secret: req.totp.secret },
    });
  }),
);
