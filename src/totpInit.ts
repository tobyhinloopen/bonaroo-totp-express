import { NextFunction, Request, Response } from "express";

export function totpInit(options: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.totp) {
      res.locals.totp = req.totp = {};
    }
    req.totp.verified = false;
    next();
  };
}
