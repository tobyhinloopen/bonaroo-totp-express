import { totpSetupForm } from "../src/totpSetupForm";
import { expectAndParseQrCodeDataUrl } from "./support/expectAndParseQrCode";
import { parse } from "url";
import { testMiddleware } from "./support";

test("totpSetupForm assigns a secret and qr code",
() => testMiddleware(totpSetupForm(), async (req, res) => {
  expect(typeof res.locals.totpSecret).toEqual("string");
  expect(typeof res.locals.totpQrCodeUrl).toEqual("string");
}));

test("totpSetupForm's totpQrCodeUrl is a QR code containing an OTP auth url",
() => testMiddleware(totpSetupForm(), async (req, res) => {
  const value = await expectAndParseQrCodeDataUrl(res.locals.totpQrCodeUrl);
  const url = parse(value, true);
  expect(url).toMatchObject({
    protocol: "otpauth:",
    slashes: true,
    host: "totp",
    query: { secret: res.locals.totpSecret, },
  });
}));
