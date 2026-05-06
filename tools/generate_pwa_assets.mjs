import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { deflateSync } from "node:zlib";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const publicRoot = join(repoRoot, "public");
const docsRoot = join(repoRoot, "docs");
const appUrl = "https://fzr400r3en2-sys.github.io/osyare_syuppatsu/";

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  crcTable[n] = c >>> 0;
}

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type, "ascii");
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])), 0);
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png(width, height, pixels) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);

  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    pixels.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }

  return Buffer.concat([signature, chunk("IHDR", ihdr), chunk("IDAT", deflateSync(raw)), chunk("IEND", Buffer.alloc(0))]);
}

function hexToRgba(hex) {
  const value = hex.replace("#", "");
  return [
    Number.parseInt(value.slice(0, 2), 16),
    Number.parseInt(value.slice(2, 4), 16),
    Number.parseInt(value.slice(4, 6), 16),
    255,
  ];
}

function makeCanvas(size, color) {
  const pixels = Buffer.alloc(size * size * 4);
  const rgba = hexToRgba(color);
  for (let i = 0; i < size * size; i += 1) {
    pixels.set(rgba, i * 4);
  }
  return { size, pixels };
}

function setPixel(canvas, x, y, color) {
  if (x < 0 || y < 0 || x >= canvas.size || y >= canvas.size) return;
  canvas.pixels.set(color, (Math.floor(y) * canvas.size + Math.floor(x)) * 4);
}

function fillCircle(canvas, cx, cy, radius, colorHex) {
  const color = hexToRgba(colorHex);
  const scale = canvas.size / 512;
  const x0 = Math.floor((cx - radius) * scale);
  const x1 = Math.ceil((cx + radius) * scale);
  const y0 = Math.floor((cy - radius) * scale);
  const y1 = Math.ceil((cy + radius) * scale);
  const scx = cx * scale;
  const scy = cy * scale;
  const sr = radius * scale;

  for (let y = y0; y <= y1; y += 1) {
    for (let x = x0; x <= x1; x += 1) {
      if ((x - scx) ** 2 + (y - scy) ** 2 <= sr ** 2) {
        setPixel(canvas, x, y, color);
      }
    }
  }
}

function fillRect(canvas, x, y, width, height, colorHex) {
  const color = hexToRgba(colorHex);
  const scale = canvas.size / 512;
  const x0 = Math.floor(x * scale);
  const x1 = Math.ceil((x + width) * scale);
  const y0 = Math.floor(y * scale);
  const y1 = Math.ceil((y + height) * scale);

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      setPixel(canvas, px, py, color);
    }
  }
}

function fillRoundedRect(canvas, x, y, width, height, radius, colorHex) {
  const color = hexToRgba(colorHex);
  const scale = canvas.size / 512;
  const x0 = Math.floor(x * scale);
  const x1 = Math.ceil((x + width) * scale);
  const y0 = Math.floor(y * scale);
  const y1 = Math.ceil((y + height) * scale);
  const r = radius * scale;

  for (let py = y0; py < y1; py += 1) {
    for (let px = x0; px < x1; px += 1) {
      const dx = Math.max(x0 + r - px, 0, px - (x1 - r));
      const dy = Math.max(y0 + r - py, 0, py - (y1 - r));
      if (dx * dx + dy * dy <= r * r) {
        setPixel(canvas, px, py, color);
      }
    }
  }
}

function drawIcon(size, maskable = false) {
  const canvas = makeCanvas(size, "#fff1b8");
  if (!maskable) {
    fillRoundedRect(canvas, 0, 0, 512, 512, 112, "#fff1b8");
  }
  fillCircle(canvas, 256, 205, 94, "#5f493f");
  fillCircle(canvas, 256, 205, 78, "#ffd7b5");
  fillRoundedRect(canvas, 170, 128, 172, 64, 30, "#ffd45e");
  fillRoundedRect(canvas, 144, 157, 224, 28, 14, "#5f493f");
  fillCircle(canvas, 226, 205, 11, "#40322d");
  fillCircle(canvas, 286, 205, 11, "#40322d");
  fillRoundedRect(canvas, 230, 238, 56, 12, 6, "#40322d");
  fillRoundedRect(canvas, 146, 306, 220, 118, 52, "#5f493f");
  fillRoundedRect(canvas, 160, 314, 192, 104, 44, "#80cfa4");
  fillCircle(canvas, 114, 113, 24, "#ffffff");
  fillCircle(canvas, 399, 119, 18, "#91d8ff");
  fillCircle(canvas, 395, 364, 28, "#ffffff");
  fillRoundedRect(canvas, 87, 367, 136, 24, 12, "#ff8aa0");
  fillRoundedRect(canvas, 289, 367, 136, 24, 12, "#ff8aa0");
  return png(size, size, canvas.pixels);
}

const gfExp = new Uint8Array(512);
const gfLog = new Uint8Array(256);
let x = 1;
for (let i = 0; i < 255; i += 1) {
  gfExp[i] = x;
  gfLog[x] = i;
  x <<= 1;
  if (x & 0x100) x ^= 0x11d;
}
for (let i = 255; i < 512; i += 1) gfExp[i] = gfExp[i - 255];

function gfMul(a, b) {
  return a === 0 || b === 0 ? 0 : gfExp[gfLog[a] + gfLog[b]];
}

function reedSolomonGenerator(degree) {
  const result = [1];
  for (let i = 0; i < degree; i += 1) {
    result.push(0);
    for (let j = 0; j < result.length - 1; j += 1) {
      result[j] = gfMul(result[j], gfExp[i]) ^ result[j + 1];
    }
  }
  return result;
}

function reedSolomonRemainder(data, degree) {
  const generator = reedSolomonGenerator(degree);
  const result = Array(degree).fill(0);
  for (const byte of data) {
    const factor = byte ^ result.shift();
    result.push(0);
    for (let i = 0; i < degree; i += 1) {
      result[i] ^= gfMul(generator[i], factor);
    }
  }
  return result;
}

function pushBits(bits, value, count) {
  for (let i = count - 1; i >= 0; i -= 1) {
    bits.push(((value >>> i) & 1) !== 0);
  }
}

function bytesToBits(bytes) {
  const bits = [];
  for (const byte of bytes) pushBits(bits, byte, 8);
  return bits;
}

function makeQrCode(text) {
  const version = 5;
  const size = version * 4 + 17;
  const dataCodewords = 86;
  const blockDataCodewords = 43;
  const eccCodewords = 24;
  const bytes = Buffer.from(text, "utf8");
  const bits = [];

  pushBits(bits, 0b0100, 4);
  pushBits(bits, bytes.length, 8);
  for (const byte of bytes) pushBits(bits, byte, 8);
  const capacityBits = dataCodewords * 8;
  pushBits(bits, 0, Math.min(4, capacityBits - bits.length));
  while (bits.length % 8 !== 0) bits.push(false);

  const data = [];
  for (let i = 0; i < bits.length; i += 8) {
    let byte = 0;
    for (let j = 0; j < 8; j += 1) byte = (byte << 1) | (bits[i + j] ? 1 : 0);
    data.push(byte);
  }
  for (let pad = 0xec; data.length < dataCodewords; pad ^= 0xec ^ 0x11) data.push(pad);

  const blocks = [data.slice(0, blockDataCodewords), data.slice(blockDataCodewords)];
  const eccBlocks = blocks.map((block) => reedSolomonRemainder(block, eccCodewords));
  const codewords = [];
  for (let i = 0; i < blockDataCodewords; i += 1) {
    for (const block of blocks) codewords.push(block[i]);
  }
  for (let i = 0; i < eccCodewords; i += 1) {
    for (const block of eccBlocks) codewords.push(block[i]);
  }

  const modules = Array.from({ length: size }, () => Array(size).fill(false));
  const reserved = Array.from({ length: size }, () => Array(size).fill(false));

  function setFunctionModule(col, row, dark) {
    modules[row][col] = dark;
    reserved[row][col] = true;
  }

  function drawFinder(col, row) {
    for (let dy = -1; dy <= 7; dy += 1) {
      for (let dx = -1; dx <= 7; dx += 1) {
        const xPos = col + dx;
        const yPos = row + dy;
        if (xPos < 0 || yPos < 0 || xPos >= size || yPos >= size) continue;
        const dark = dx >= 0 && dx <= 6 && dy >= 0 && dy <= 6 && (dx === 0 || dx === 6 || dy === 0 || dy === 6 || (dx >= 2 && dx <= 4 && dy >= 2 && dy <= 4));
        setFunctionModule(xPos, yPos, dark);
      }
    }
  }

  function drawAlignment(col, row) {
    for (let dy = -2; dy <= 2; dy += 1) {
      for (let dx = -2; dx <= 2; dx += 1) {
        setFunctionModule(col + dx, row + dy, Math.max(Math.abs(dx), Math.abs(dy)) !== 1);
      }
    }
  }

  drawFinder(0, 0);
  drawFinder(size - 7, 0);
  drawFinder(0, size - 7);
  drawAlignment(30, 30);
  for (let i = 8; i < size - 8; i += 1) {
    setFunctionModule(6, i, i % 2 === 0);
    setFunctionModule(i, 6, i % 2 === 0);
  }
  setFunctionModule(8, size - 8, true);

  const allBits = bytesToBits(codewords);
  let bitIndex = 0;
  let upward = true;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right -= 1;
    for (let vert = 0; vert < size; vert += 1) {
      const row = upward ? size - 1 - vert : vert;
      for (let j = 0; j < 2; j += 1) {
        const col = right - j;
        if (reserved[row][col]) continue;
        let bit = bitIndex < allBits.length ? allBits[bitIndex] : false;
        bitIndex += 1;
        if ((row + col) % 2 === 0) bit = !bit;
        modules[row][col] = bit;
      }
    }
    upward = !upward;
  }

  const dataBits = 0b00000;
  let remainder = dataBits << 10;
  for (let i = 14; i >= 10; i -= 1) {
    if (((remainder >>> i) & 1) !== 0) remainder ^= 0x537 << (i - 10);
  }
  const formatBits = ((dataBits << 10) | remainder) ^ 0x5412;
  const getBit = (value, index) => ((value >>> index) & 1) !== 0;
  for (let i = 0; i <= 5; i += 1) setFunctionModule(8, i, getBit(formatBits, i));
  setFunctionModule(8, 7, getBit(formatBits, 6));
  setFunctionModule(8, 8, getBit(formatBits, 7));
  setFunctionModule(7, 8, getBit(formatBits, 8));
  for (let i = 9; i < 15; i += 1) setFunctionModule(14 - i, 8, getBit(formatBits, i));
  for (let i = 0; i < 8; i += 1) setFunctionModule(size - 1 - i, 8, getBit(formatBits, i));
  for (let i = 8; i < 15; i += 1) setFunctionModule(8, size - 15 + i, getBit(formatBits, i));

  return modules;
}

function qrSvg(text) {
  const modules = makeQrCode(text);
  const moduleCount = modules.length;
  const quiet = 4;
  const scale = 12;
  const size = (moduleCount + quiet * 2) * scale;
  const rects = [];

  for (let row = 0; row < moduleCount; row += 1) {
    for (let col = 0; col < moduleCount; col += 1) {
      if (modules[row][col]) {
        rects.push(`<rect x="${(col + quiet) * scale}" y="${(row + quiet) * scale}" width="${scale}" height="${scale}"/>`);
      }
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size + 72}" role="img" aria-label="おしゃれして しゅっぱつ！を開くQRコード">
  <rect width="${size}" height="${size + 72}" rx="24" fill="#fff8e8"/>
  <rect x="0" y="0" width="${size}" height="${size}" fill="#ffffff"/>
  <g fill="#3f302b">
    ${rects.join("\n    ")}
  </g>
  <text x="${size / 2}" y="${size + 28}" text-anchor="middle" font-family="sans-serif" font-size="24" font-weight="700" fill="#4f3b34">おしゃれして しゅっぱつ！</text>
  <text x="${size / 2}" y="${size + 56}" text-anchor="middle" font-family="sans-serif" font-size="15" fill="#6a5144">${text}</text>
</svg>
`;
}

function write(file, contents) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, contents);
}

write(join(publicRoot, "icons", "icon-192.png"), drawIcon(192));
write(join(publicRoot, "icons", "icon-512.png"), drawIcon(512));
write(join(publicRoot, "icons", "icon-maskable-512.png"), drawIcon(512, true));
write(join(publicRoot, "install-qr.svg"), qrSvg(appUrl));
write(join(docsRoot, "install-qr.svg"), qrSvg(appUrl));

console.log(`PWA icons and QR generated for ${appUrl}`);
