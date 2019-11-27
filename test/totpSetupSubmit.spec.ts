import { totpInit } from "../src/totpInit";
import { totpSetupSubmit } from "../src/totpSetupSubmit";
import { testMiddleware } from "./support/testMiddleware";
import * as speakeasy from "speakeasy";

const SECRET = speakeasy.generateSecret().base32;
const TOKEN = speakeasy.totp({ encoding: "base32", secret: SECRET });
const OLD_TOKEN = speakeasy.totp({ encoding: "base32", secret: SECRET, time: Date.parse("2000-01-01") / 1000 });
const INVALID_TOKEN = "123456";

test("totpSetupSubmit() without secret, add SECRET_REQUIRED to totpErrorCodes", async () => {
  await testMiddleware([totpInit({}), totpSetupSubmit()], async (req, res) => {
    expect(res.locals).toMatchObject({ totpErrorCodes: ["SECRET_REQUIRED"] })
  }, { method: "post", data: { token: TOKEN, secret: "" } });
});

test("totpSetupSubmit() without token, add TOKEN_REQUIRED to totpErrorCodes", async () => {
  await testMiddleware([totpInit({}), totpSetupSubmit()], async (req, res) => {
    expect(res.locals).toMatchObject({ totpErrorCodes: ["TOKEN_REQUIRED"] })
  }, { method: "post", data: { token: "", secret: SECRET } });
});

test("totpSetupSubmit() with secret but random code, add TOKEN_VERIFY_FAILURE to totpErrorCodes", async () => {
  await testMiddleware([totpInit({}), totpSetupSubmit()], async (req, res) => {
    expect(res.locals).toMatchObject({ totpErrorCodes: ["TOKEN_VERIFY_FAILURE"] })
  }, { method: "post", data: { token: INVALID_TOKEN, secret: SECRET } });
});

test("totpSetupSubmit() with secret but old code, add TOKEN_VERIFY_FAILURE to totpErrorCodes", async () => {
  await testMiddleware([totpInit({}), totpSetupSubmit()], async (req, res) => {
    expect(res.locals).toMatchObject({ totpErrorCodes: ["TOKEN_VERIFY_FAILURE"] })
  }, { method: "post", data: { token: OLD_TOKEN, secret: SECRET } });
});

test("totpSetupSubmit() with secret and valid token, no error is assigned", async () => {
  await testMiddleware([totpInit({}), totpSetupSubmit()], async (req, res) => {
    expect(res.locals).toMatchObject({ totpErrorCodes: [] })
  }, { method: "post", data: { token: TOKEN, secret: SECRET } });
});

// test("totpSetupSubmit() with secret and valid token, store the secret using totpInit's setUserTotpSecret", async () => {

// });
