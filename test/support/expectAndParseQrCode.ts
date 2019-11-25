import * as Jimp from "jimp";
import * as QrCode from "qrcode-reader";

export async function expectAndParseQrCodeDataUrl(maybeDataUrl: any): Promise<string> {
  expect(typeof maybeDataUrl).toEqual("string");
  const dataUrl = maybeDataUrl as string;
  expect(dataUrl).toMatch(/^data:image\/png;base64,/);
  const buffer = Buffer.from(dataUrl.substr("data:image/png;base64,".length), "base64");
  const image = await (Jimp as any).read(buffer);

  return new Promise((resolve, reject) => {
    const qr = new QrCode();
    qr.callback = (error, value) => error ? reject(error) : resolve(value.result);
    qr.decode(image.bitmap);
  });
}
