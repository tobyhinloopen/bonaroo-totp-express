import { totpSetup } from "../src/totpSetup";
import { expectAndParseQrCodeDataUrl } from "./support/expectAndParseQrCode";
import { parse } from "url";
import { testMiddleware } from "./support";

test("totpSetup assigns a secret and qr code",
() => testMiddleware(totpSetup(), async (req, res) => {
  expect(typeof res.locals.totpSecret).toEqual("string");
  expect(typeof res.locals.totpQrCodeUrl).toEqual("string");
}));

test("totpSetup's totpQrCodeUrl is a QR code containing an OTP auth url",
() => testMiddleware(totpSetup(), async (req, res) => {
  const value = await expectAndParseQrCodeDataUrl(res.locals.totpQrCodeUrl);
  const url = parse(value, true);
  expect(url).toMatchObject({
    protocol: "otpauth:",
    slashes: true,
    host: "totp",
    query: { secret: res.locals.totpSecret, },
  });
}));
