import { totpInit } from "../src/totpInit";
import { totpSetupSubmit } from "../src/totpSetupSubmit";
import { testMiddleware } from "./support/testMiddleware";
import * as speakeasy from "speakeasy";
import { Request } from "express";

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

test("totpSetupSubmit() invokes setUserTotpSecret on success", async () => {
  const setUserTotpSecret = jest.fn();
  let request: Request;
  await testMiddleware(
    [
      totpInit({}),
      totpSetupSubmit({ setUserTotpSecret }),
    ],
    async (req, res) => { request = req; },
    { method: "post", data: { token: TOKEN, secret: SECRET } },
  );
  expect(setUserTotpSecret).toHaveBeenCalledWith(request, SECRET);
});

test("totpSetupSubmit() does not invoke setUserTotpSecret on failure", async () => {
  const setUserTotpSecret = jest.fn();
  await testMiddleware(
    [
      totpInit({}),
      totpSetupSubmit({ setUserTotpSecret }),
    ],
    async (req, res) => {},
    { method: "post", data: { token: INVALID_TOKEN, secret: SECRET } },
  );
  expect(setUserTotpSecret).not.toHaveBeenCalled();
});

test("totpSetupSubmit() on success assigns res.locals. & req. totpVerified & totpSetupSuccess=true", () => testMiddleware(
  totpSetupSubmit({}),
  async (req, res) => {
    expect(res.locals.totpSetupSuccess).toEqual(true);
    expect(req.totpSetupSuccess).toEqual(true);
    expect(res.locals.totpVerified).toEqual(true);
    expect(req.totpVerified).toEqual(true);
  },
  { method: "post", data: { token: TOKEN, secret: SECRET } },
));

test("totpSetupSubmit() assigns res.locals. & req. totpVerified & totpSetupSuccess=false", () => testMiddleware(
  totpSetupSubmit({}),
  async (req, res) => {
    expect(res.locals.totpSetupSuccess).toEqual(false);
    expect(req.totpSetupSuccess).toEqual(false);
    expect(res.locals.totpVerified).toEqual(false);
    expect(req.totpVerified).toEqual(false);
  },
  { method: "post", data: { token: INVALID_TOKEN, secret: SECRET } },
));

test("totpSetupSubmit() assigns res.locals. & req.totpSecret", () => testMiddleware(
  totpSetupSubmit({}),
  async (req, res) => {
    expect(res.locals.totpSecret).toEqual(SECRET);
    expect(req.totpSecret).toEqual(SECRET);
  },
  { method: "post", data: { token: TOKEN, secret: SECRET } },
));
