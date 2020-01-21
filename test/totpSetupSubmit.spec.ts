import { totpInit } from "../src/totpInit";
import { totpSetupSubmit } from "../src/totpSetupSubmit";
import { testMiddleware } from "./support/testMiddleware";
import * as speakeasy from "speakeasy";
import { Request } from "express";
import * as express from "express";
import bodyParser = require("body-parser");
import supertest = require("supertest");

const SECRET = speakeasy.generateSecret().base32;
const TOKEN = speakeasy.totp({ encoding: "base32", secret: SECRET });
const OLD_TOKEN = speakeasy.totp({ encoding: "base32", secret: SECRET, time: Date.parse("2000-01-01") / 1000 });
const INVALID_TOKEN = "123456";

test("totpSetupSubmit() without secret, add SECRET_REQUIRED to errorCodes", () => testMiddleware(
  [totpInit({}), totpSetupSubmit()],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["SECRET_REQUIRED"] }),
  { method: "post", data: { token: TOKEN, secret: "" } })
);

test("totpSetupSubmit() without token, add TOKEN_REQUIRED to errorCodes", () => testMiddleware(
  [totpInit({}), totpSetupSubmit()],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["TOKEN_REQUIRED"] }),
  { method: "post", data: { token: "", secret: SECRET } })
);

test("totpSetupSubmit() with secret but random token, add TOKEN_VERIFY_FAILURE to errorCodes", () => testMiddleware(
  [totpInit({}), totpSetupSubmit()],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["TOKEN_VERIFY_FAILURE"] }),
  { method: "post", data: { token: INVALID_TOKEN, secret: SECRET } })
);

test("totpSetupSubmit() with secret but old token, add TOKEN_VERIFY_FAILURE to errorCodes", () => testMiddleware(
  [totpInit({}), totpSetupSubmit()],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: ["TOKEN_VERIFY_FAILURE"] }),
  { method: "post", data: { token: OLD_TOKEN, secret: SECRET } })
);

test("totpSetupSubmit() with secret and valid token, no error is assigned", () => testMiddleware(
  [totpInit({}), totpSetupSubmit()],
  async (req, res) => expect(req.totp).toMatchObject({ errorCodes: [] }),
  { method: "post", data: { token: TOKEN, secret: SECRET } })
);

test("totpSetupSubmit() invokes setUserTotpSecret on success", async () => {
  const setUserTotpSecret = jest.fn();
  let request: Request;
  await testMiddleware(
    [totpInit({}), totpSetupSubmit({ setUserTotpSecret })],
    async (req, res) => { request = req; },
    { method: "post", data: { token: TOKEN, secret: SECRET } },
  );
  expect(setUserTotpSecret).toHaveBeenCalledWith(request, SECRET);
});

test("totpSetupSubmit() does not invoke setUserTotpSecret on failure", async () => {
  const setUserTotpSecret = jest.fn();
  await testMiddleware(
    [totpInit({}), totpSetupSubmit({ setUserTotpSecret })],
    async (req, res) => {},
    { method: "post", data: { token: INVALID_TOKEN, secret: SECRET } },
  );
  expect(setUserTotpSecret).not.toHaveBeenCalled();
});

test("totpSetupSubmit() on success assigns verified & setupSuccess=true", () => testMiddleware(
  [totpInit({}), totpSetupSubmit({})],
  async (req, res) => {
    expect(req.totp.setupSuccess).toEqual(true);
    expect(req.totp.verified).toEqual(true);
  },
  { method: "post", data: { token: TOKEN, secret: SECRET } },
));

test("totpSetupSubmit() assigns verified & setupSuccess=false", () => testMiddleware(
  [totpInit({}), totpSetupSubmit({})],
  async (req, res) => {
    expect(req.totp.setupSuccess).toEqual(false);
    expect(req.totp.verified).toEqual(false);
  },
  { method: "post", data: { token: INVALID_TOKEN, secret: SECRET } },
));

test("totpSetupSubmit() assigns secret", () => testMiddleware(
  [totpInit({}), totpSetupSubmit({})],
  async (req, res) => expect(req.totp.secret).toEqual(SECRET),
  { method: "post", data: { token: TOKEN, secret: SECRET } },
));

test("totpSetupSubmit() doesn't destroy app settings", () => testMiddleware(
  [
    (req, res, next) => {
      req.app.set("view engine", "ejs");
      next();
    },
    totpInit({}),
    totpSetupSubmit({}),
  ],
  async (req, res) => expect(req.app.get("view engine")).toEqual("ejs"),
  { method: "post", data: { token: TOKEN, secret: SECRET } },
));

test("totpSetupSubmit() as handler doesn't destroy app settings", () => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  app.use(totpInit({}));

  app.post("/", totpSetupSubmit({}), (req, res, next) => {
    try {
      expect(req.app.get("view engine")).toEqual("ejs");
      res.send("ok");
      next();
    } catch (error) {
      next(error);
    }
  });

  return new Promise((resolve, reject) => {
    app.use((error, req, res, next) => { reject(error); next(error); });
    supertest(app).post("/").send({ token: TOKEN, secret: SECRET })
      .expect(200).then(resolve, reject);
  });
});

test("totpSetupSubmit() as middleware doesn't destroy app settings", () => {
  const app = express();

  app.use(bodyParser.urlencoded({ extended: true }));
  app.set("view engine", "ejs");
  app.use(totpInit({}));

  app.use(totpSetupSubmit({}));
  app.post("/", (req, res, next) => {
    try {
      expect(req.app.get("view engine")).toEqual("ejs");
      res.send("ok");
      next();
    } catch (error) {
      next(error);
    }
  });

  return new Promise((resolve, reject) => {
    app.use((error, req, res, next) => { reject(error); next(error); });
    supertest(app).post("/").send({ token: TOKEN, secret: SECRET })
      .expect(200).then(resolve, reject);
  });
});
