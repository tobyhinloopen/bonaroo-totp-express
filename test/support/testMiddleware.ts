import * as express from "express";
import { Request, Response, NextFunction } from "express";
import supertest = require("supertest");
import bodyParser = require("body-parser");

/**
 * Test an express middleware by creating an express app & sending a request to
 * the app. The `test`-callback is invoked inside a request handler handling the
 * request.
 * @param middleware The middleware to add to the request app
 * @param test A function to test the request and/or response with inside a
 * request handler.
 * @param options
 */
export function testMiddleware(
  middleware: testMiddleware.Middleware|testMiddleware.Middleware[],
  test: (req: Request, res: Response) => Promise<void>,
  options: Partial<testMiddleware.Options> = {},
): Promise<supertest.Response> {

  const { path, method, data } = { ...testMiddleware.DEFAULT_OPTIONS, ...options };
  const app = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(...(Array.isArray(middleware) ? middleware : [middleware]));

  // Create a request handler to test the middleware with.
  // If the test didn't fail, render a 200 OK response.
  app[method](path, async (req, res, next) => {
    try {
      await test(req, res);
      res.type("txt").send("Hi");
    } catch (error) {
      next(error);
    }
  });

  return new Promise((resolve, reject) => {
    // Register an error handler to capture errors in the request handler.
    // If an error is caught, reject the promise to indicate a test failure.
    // To ensure the express request will finish, we'll also pass the same error
    // back to express.
    app.use((error, req, res, next) => { reject(error); next(error); });

    // Invoke the request handler by sending a request to the express app.
    supertest(app)[method](path).send(data).expect(200).then(resolve, reject);
  });
}

export namespace testMiddleware {
  export type Middleware = (req: Request, res: Response, next: NextFunction) => void;

  export const DEFAULT_OPTIONS: Options = {
    path: "/",
    method: "get",
    data: {},
  }

  export interface Options {
    path: string;
    method: "get" | "post";
    data: string | object;
  }
}
