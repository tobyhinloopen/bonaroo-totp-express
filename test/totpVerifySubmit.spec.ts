import { testMiddleware } from "./support/testMiddleware";
import * as speakeasy from "speakeasy";
import { totpVerifySubmit } from "../src/totpVerifySubmit";
import { totpInit } from "../src/totpInit";

const SECRET = speakeasy.generateSecret().base32;
const TOKEN = speakeasy.totp({ encoding: "base32", secret: SECRET });
const OLD_TOKEN = speakeasy.totp({ encoding: "base32", secret: SECRET, time: Date.parse("2000-01-01") / 1000 });
const INVALID_TOKEN = "123456";
const getUserTotpSecret = () => Promise.resolve(SECRET);

it("totpVerifySubmit() without token assigns TOKEN_REQUIRED to totpErrorCodes", () => testMiddleware(
  [totpInit({}), totpVerifySubmit({ getUserTotpSecret })],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["TOKEN_REQUIRED"], verified: false }),
  { method: "post", data: { token: "" } }
));

it("totpVerifySubmit() with null-secret from getUserTotpSecret assigns SECRET_REQUIRED to totpErrorCodes", () => testMiddleware(
  [totpInit({}), totpVerifySubmit({ getUserTotpSecret: () => null })],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["SECRET_REQUIRED"], verified: false }),
  { method: "post", data: { token: TOKEN } }
));

it("totpVerifySubmit() with blank-secret from getUserTotpSecretassigns SECRET_REQUIRED to totpErrorCodes", () => testMiddleware(
  [totpInit({}), totpVerifySubmit({ getUserTotpSecret: () => "" })],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["SECRET_REQUIRED"], verified: false }),
  { method: "post", data: { token: TOKEN } }
));

it("totpVerifySubmit() with valid secret and token assigns totpVerified=true", () => testMiddleware(
  [totpInit({}), totpVerifySubmit({ getUserTotpSecret })],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: [], verified: true }),
  { method: "post", data: { token: TOKEN } }
));

it("totpVerifySubmit() with random token token assigns TOKEN_VERIFY_FAILURE to totpErrorCodes", () => testMiddleware(
  [totpInit({}), totpVerifySubmit({ getUserTotpSecret })],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["TOKEN_VERIFY_FAILURE"], verified: false }),
  { method: "post", data: { token: INVALID_TOKEN } }
));

it("totpVerifySubmit() with old token token assigns TOKEN_VERIFY_FAILURE to totpErrorCodes", () => testMiddleware(
  [totpInit({}), totpVerifySubmit({ getUserTotpSecret })],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["TOKEN_VERIFY_FAILURE"], verified: false }),
  { method: "post", data: { token: OLD_TOKEN } }
));
