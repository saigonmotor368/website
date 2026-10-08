import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const root = process.cwd();
const logoPath = path.join(root, "public", "logo_sgm.png");
const heroPath = path.join(root, "public", "sgm-hero-premium.png");
const appDir = path.join(root, "src", "app");
const publicDir = path.join(root, "public");

const iconPng = await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#ffffff" },
})
  .composite([
    {
      input: await sharp(logoPath)
        .resize(404, 404, { fit: "contain", background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .png()
        .toBuffer(),
      gravity: "center",
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();

await fs.writeFile(path.join(appDir, "icon.png"), iconPng);
await fs.writeFile(path.join(publicDir, "icon-512.png"), iconPng);

const icon192 = await sharp(iconPng)
  .resize(192, 192, { fit: "cover" })
  .png({ compressionLevel: 9 })
  .toBuffer();
await fs.writeFile(path.join(publicDir, "icon-192.png"), icon192);

const maskableIcon = await sharp({
  create: { width: 512, height: 512, channels: 4, background: "#0b3132" },
})
  .composite([
    {
      input: await sharp(logoPath)
        .resize(300, 300, { fit: "contain", background: "#ffffff" })
        .flatten({ background: "#ffffff" })
        .png({ compressionLevel: 9 })
        .toBuffer(),
      gravity: "center",
    },
  ])
  .png({ compressionLevel: 9 })
  .toBuffer();
await fs.writeFile(path.join(publicDir, "icon-maskable-512.png"), maskableIcon);

const appleIcon = await sharp(logoPath)
  .resize(152, 152, { fit: "contain", background: "#ffffff" })
  .extend({ top: 14, bottom: 14, left: 14, right: 14, background: "#ffffff" })
  .flatten({ background: "#ffffff" })
  .png({ compressionLevel: 9 })
  .toBuffer();

await fs.writeFile(path.join(appDir, "apple-icon.png"), appleIcon);
await fs.writeFile(path.join(publicDir, "apple-touch-icon.png"), appleIcon);

const faviconSizes = [16, 32, 48];
const faviconImages = await Promise.all(
  faviconSizes.map((size) =>
    sharp(logoPath)
      .resize(size, size, { fit: "contain", background: "#ffffff" })
      .flatten({ background: "#ffffff" })
      .ensureAlpha(1)
      .png({ compressionLevel: 9 })
      .toBuffer(),
  ),
);

const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);
icoHeader.writeUInt16LE(1, 2);
icoHeader.writeUInt16LE(faviconImages.length, 4);

let imageOffset = 6 + faviconImages.length * 16;
const directoryEntries = faviconImages.map((image, index) => {
  const size = faviconSizes[index];
  const entry = Buffer.alloc(16);
  entry.writeUInt8(size, 0);
  entry.writeUInt8(size, 1);
  entry.writeUInt8(0, 2);
  entry.writeUInt8(0, 3);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(image.length, 8);
  entry.writeUInt32LE(imageOffset, 12);
  imageOffset += image.length;
  return entry;
});

await fs.writeFile(
  path.join(appDir, "favicon.ico"),
  Buffer.concat([icoHeader, ...directoryEntries, ...faviconImages]),
);

const logoForOg = await sharp(logoPath)
  .resize(112, 112, { fit: "contain", background: "#ffffff" })
  .flatten({ background: "#ffffff" })
  .png({ compressionLevel: 9 })
  .toBuffer();

const overlay = Buffer.from(`
  <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="shade" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#071f25" stop-opacity="0.98"/>
        <stop offset="49%" stop-color="#071f25" stop-opacity="0.88"/>
        <stop offset="72%" stop-color="#071f25" stop-opacity="0.20"/>
        <stop offset="100%" stop-color="#071f25" stop-opacity="0.05"/>
      </linearGradient>
      <linearGradient id="gold" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#f0c768"/>
        <stop offset="100%" stop-color="#fff1b7"/>
      </linearGradient>
    </defs>
    <rect width="1200" height="630" fill="url(#shade)"/>
    <rect x="54" y="52" width="126" height="126" rx="63" fill="#ffffff"/>
    <text x="202" y="101" fill="#ffffff" font-family="Arial, Segoe UI, sans-serif" font-size="31" font-weight="800" letter-spacing="1">SAIGON</text>
    <text x="202" y="139" fill="#56c4b2" font-family="Arial, Segoe UI, sans-serif" font-size="31" font-weight="800" letter-spacing="1">MOTOR</text>
    <text x="54" y="274" fill="#ffffff" font-family="Arial, Segoe UI, sans-serif" font-size="62" font-weight="800">DỊCH VỤ HỒ SƠ XE</text>
    <rect x="54" y="300" width="108" height="5" rx="2" fill="#c92e43"/>
    <text x="54" y="365" fill="#ffffff" font-family="Arial, Segoe UI, sans-serif" font-size="31" font-weight="600">Sang tên • Thu hồi đăng ký, biển số</text>
    <rect x="54" y="431" width="398" height="82" rx="41" fill="#c92e43"/>
    <text x="92" y="483" fill="#ffffff" font-family="Arial, Segoe UI, sans-serif" font-size="31" font-weight="800">0704 104 104</text>
    <text x="54" y="568" fill="url(#gold)" font-family="Arial, Segoe UI, sans-serif" font-size="23" font-weight="700">Kiểm tra hồ sơ • Báo phí rõ ràng</text>
  </svg>
`);

await sharp(heroPath)
  .resize(1200, 630, { fit: "cover", position: "center" })
  .composite([
    { input: overlay, top: 0, left: 0 },
    { input: logoForOg, top: 59, left: 61 },
  ])
  .jpeg({ quality: 88, chromaSubsampling: "4:4:4", progressive: true })
  .toFile(path.join(publicDir, "og-saigon-motor.jpg"));

console.log("Generated favicon.ico, icon.png, apple-icon.png and og-saigon-motor.jpg");
