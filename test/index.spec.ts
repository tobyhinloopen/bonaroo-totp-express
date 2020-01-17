import * as src from "../src";

for (const name of ["totpInit", "totpSetupForm", "totpSetupSubmit", "totpVerify", "totpVerifySubmit"]) {
  test(`middleware ${name}() is exported and a function`, () => {
    expect(src).toHaveProperty(name);
    expect(typeof src[name]).toEqual("function");
  });
}
