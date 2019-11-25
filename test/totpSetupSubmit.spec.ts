// import { totpSetupForm } from "../src/totpSetupForm";
// import { testMiddleware } from "./support";

test("totpSetupSubmit() with secret and valid token, store the secret using totpInit's setUserTotpSecret", async () => {

});

test("totpSetupSubmit() without secret, add SECRET_REQUIRED to totpErrorCode", async () => {

});

test("totpSetupSubmit() without token, add CODE_REQUIRED to totpErrorCode", async () => {

});

test("totpSetupSubmit() with secret but random code, add CODE_VERIFY_FAILURE to totpErrorCode", async () => {

});

test("totpSetupSubmit() with secret but old code, add CODE_VERIFY_FAILURE to totpErrorCode", async () => {

});
