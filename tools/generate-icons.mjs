// Original ProxyBox vector mark -> browser/PWA and in-app bitmap variants.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = path.join(root, 'frontend/public');
const source = fs.readFileSync(path.join(root, 'assets/proxy-box.svg'));
fs.writeFileSync(path.join(pub,'proxy-box.svg'),source);
fs.writeFileSync(path.join(pub,'favicon.svg'),source);
fs.writeFileSync(path.join(root,'frontend/src/assets/icons/logo.svg'),source);
for (const size of [48,72,96,144,168,192,256,512]) await sharp(source).resize(size,size).png().toFile(path.join(pub,`${size}x${size}.png`));
await sharp(source).resize(180,180).png().toFile(path.join(pub,'apple-touch-icon.png'));
await sharp(source).resize(512,512).png().toFile(path.join(pub,'logo.png'));
await sharp(source).resize(360,360).extend({top:76,bottom:76,left:76,right:76,background:'#0d9488'}).png().toFile(path.join(pub,'maskable-512x512.png'));
for (const [name,color] of [['logo.png','#0d9488'],['logo-red.png','#0d9488'],['logo-green.png','#6366f1']]) {
  const variant = Buffer.from(source.toString().replaceAll('#0d9488',color));
  await sharp(variant).resize(128,128).png().toFile(path.join(root,'frontend/src/assets/icons',name));
}
const png = await sharp(source).resize(32,32).png().toBuffer();
const header=Buffer.alloc(22); header.writeUInt16LE(1,2); header.writeUInt16LE(1,4); header[6]=32; header[7]=32;
header.writeUInt16LE(1,10); header.writeUInt16LE(32,12); header.writeUInt32LE(png.length,14); header.writeUInt32LE(22,18);
fs.writeFileSync(path.join(pub,'favicon.ico'),Buffer.concat([header,png]));
console.log('ProxyBox icons generated from assets/proxy-box.svg');
