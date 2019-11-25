import * as express from "express";
import { Request, Response, NextFunction } from "express";
import supertest = require("supertest");

export function testMiddleware(
  middleware: (req: Request, res: Response, next: NextFunction) => void,
  test: (req: Request, res: Response) => Promise<void>,
): Promise<supertest.Response> {
  const app = express();
  app.get("/", middleware, async (req, res, next) => {
    try {
      await test(req, res);
      res.type("txt").send("Hi");
    } catch (error) {
      next(error);
    }
  });
  return new Promise((resolve, reject) => {
    app.use((error, req, res, next) => { reject(error); next(error); });
    supertest(app).get("/").expect(200).then(resolve, reject);
  });
}
