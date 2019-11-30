import { totpInit } from "../src/totpInit";
import { totpSetupForm } from "../src/totpSetupForm";
import { expectAndParseQrCodeDataUrl } from "./support/expectAndParseQrCode";
import { parse } from "url";
import { testMiddleware } from "./support";

test("totpSetupForm assigns a secret and qr code", () => testMiddleware(
  [totpInit({}), totpSetupForm()],
  async (req, res) => {
    expect(typeof res.locals.totp.secret).toEqual("string");
    expect(typeof res.locals.totp.qrCodeUrl).toEqual("string");
  }),
);

test("totpSetupForm's totpQrCodeUrl is a QR code containing an OTP auth url", () => testMiddleware(
  [totpInit({}), totpSetupForm()],
  async (req, res) => {
    const value = await expectAndParseQrCodeDataUrl(res.locals.totp.qrCodeUrl);
    const url = parse(value, true);
    expect(url).toMatchObject({
      protocol: "otpauth:",
      slashes: true,
      host: "totp",
      query: { secret: req.totp.secret, },
    });
  })
);
