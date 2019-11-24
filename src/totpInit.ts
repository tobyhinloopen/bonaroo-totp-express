import { NextFunction, Request, Response } from "express";

export function totpInit(options: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    req.totpVerified = false;
    next();
  };
}
