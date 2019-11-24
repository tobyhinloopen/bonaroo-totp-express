import { hello } from "../src";
import * as express from "express";
import supertest = require("supertest");

test("hello", () => {
  expect(hello("foo")).toEqual("Hello foo");
});

test("supertest", () => {
  const app = express();

  app.get("/", (req, res) => res.type("txt").send("Hi"));

  return supertest(app)
    .get("/")
    .expect(200, "Hi")
    .expect("Content-Type", /text/);
});
