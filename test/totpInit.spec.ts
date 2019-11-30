import { totpInit } from "../src/totpInit";
import { testMiddleware } from "./support";

test("totpInit assigns req.totpVerified to false", () => testMiddleware(
  totpInit({}),
  async (req, res) => expect(req.totp.verified).toEqual(false),
));
