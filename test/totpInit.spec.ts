import { totpInit } from "../src/totpInit";
import * as express from "express";
import supertest = require("supertest");

test("totpInit assigns req.totpVerified to false", (done) => {
  const app = express();

  app.use(totpInit({}));

  app.get("/", (req, res) => {
    expect((req as any).totpVerified).toEqual(false);
    res.type("txt").send("Hi");
  });

  app.use((error, req, res, next) => done(error));
  supertest(app).get("/").expect(200).then(() => done(), done);
});
