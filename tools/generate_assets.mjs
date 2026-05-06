import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = join(repoRoot, "public", "assets");
const viewBox = "0 0 800 1000";

const palette = {
  outline: "#5b4438",
  outlineSoft: "#8b6c5a",
  skin: "#ffd8ba",
  skinLight: "#ffe8d8",
  skinShade: "#f0bf9b",
  hair: "#6e4c37",
  hairLight: "#a07a5b",
  hairShine: "#f4d8b8",
  yellow: "#ffd84e",
  yellowLight: "#fff2a6",
  yellowDeep: "#f3b836",
  blue: "#65c7ff",
  blueLight: "#a7e8ff",
  blueDeep: "#3aa4dd",
  pink: "#ffb8d1",
  pinkLight: "#ffe1f1",
  pinkDeep: "#ff8aa0",
  pinkBow: "#ff7fa6",
  green: "#83d99b",
  greenLight: "#baf0c6",
  greenDeep: "#5fbf7a",
  orange: "#ff9a65",
  white: "#ffffff",
  cream: "#fff6c8",
  red: "#ef5656",
  brown: "#9b6b43",
  brownLight: "#c08c5e",
  plush: "#d9a978",
  plushLight: "#f0c89a",
  plushDeep: "#b58658",
  eye: "#3f302b",
  eyeRing: "#7a4c3c",
};

const safeZones = {
  hatsMaxY: 240,
  clothesMinY: 380,
  shoesMinY: 690,
  itemFaceFront: { minX: 370, minY: 200, maxX: 430, maxY: 340 },
};

const assetSpec = {
  character: {
    base: { file: "character/base.svg", bounds: [232, 138, 562, 842] },
    face: { file: "character/face.svg", bounds: [298, 244, 502, 332] },
  },
  hats: {
    none: { file: "hats/none.svg", bounds: null },
    yellow_hat: { file: "hats/yellow_hat.svg", bounds: [226, 116, 578, 240] },
    rain_hat: { file: "hats/rain_hat.svg", bounds: [230, 104, 570, 240] },
    sleep_cap: { file: "hats/sleep_cap.svg", bounds: [238, 22, 562, 240] },
  },
  clothes: {
    daily: { file: "clothes/daily.svg", bounds: [256, 398, 544, 720] },
    park_hoodie: { file: "clothes/park_hoodie.svg", bounds: [254, 382, 546, 724] },
    rain_coat: { file: "clothes/rain_coat.svg", bounds: [256, 398, 544, 720] },
    pajamas: { file: "clothes/pajamas.svg", bounds: [250, 402, 550, 804] },
  },
  shoes: {
    normal: { file: "shoes/normal.svg", bounds: [284, 760, 516, 826] },
    sneakers: { file: "shoes/sneakers.svg", bounds: [276, 748, 524, 826] },
    rain_boots: { file: "shoes/rain_boots.svg", bounds: [280, 696, 520, 826] },
    fluffy_socks: { file: "shoes/fluffy_socks.svg", bounds: [280, 716, 520, 826] },
  },
  items: {
    none: { file: "items/none.svg", bounds: null },
    backpack: { file: "items/backpack.svg", bounds: [216, 390, 418, 740] },
    umbrella: { file: "items/umbrella.svg", bounds: [504, 70, 784, 624] },
    plush: { file: "items/plush.svg", bounds: [432, 402, 668, 792] },
  },
  backgrounds: {
    park: { file: "backgrounds/park.svg", bounds: [0, 0, 800, 1000] },
    rain: { file: "backgrounds/rain.svg", bounds: [0, 0, 800, 1000] },
    sleep: { file: "backgrounds/sleep.svg", bounds: [0, 0, 800, 1000] },
  },
  overlays: {
    park_birds: { file: "overlays/park_birds.svg", bounds: [80, 110, 712, 332] },
    rain_drops: { file: "overlays/rain_drops.svg", bounds: [60, 100, 716, 540] },
    sleep_stars: { file: "overlays/sleep_stars.svg", bounds: [62, 90, 724, 558] },
    confetti: { file: "overlays/confetti.svg", bounds: [80, 100, 712, 572] },
  },
};

function num(value) {
  if (!Number.isFinite(value)) {
    return "0";
  }
  if (Number.isInteger(value)) {
    return value.toString();
  }
  return Number.parseFloat(value.toFixed(2)).toString();
}

function starPath(cx, cy, outer, inner = outer * 0.45) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push(`${num(cx + Math.cos(angle) * radius)} ${num(cy + Math.sin(angle) * radius)}`);
  }
  return `M${points[0]}L${points.slice(1).join("L")}z`;
}

function heartPath(cx, cy, size) {
  const s = size;
  return `M${num(cx)} ${num(cy + s * 0.32)}C${num(cx - s * 1.2)} ${num(cy - s * 0.4)} ${num(cx - s)} ${num(cy - s * 1.25)} ${num(cx - s * 0.38)} ${num(cy - s * 1.25)}C${num(cx - s * 0.12)} ${num(cy - s * 1.25)} ${num(cx)} ${num(cy - s * 1.05)} ${num(cx)} ${num(cy - s * 0.82)}C${num(cx)} ${num(cy - s * 1.05)} ${num(cx + s * 0.12)} ${num(cy - s * 1.25)} ${num(cx + s * 0.38)} ${num(cy - s * 1.25)}C${num(cx + s)} ${num(cy - s * 1.25)} ${num(cx + s * 1.2)} ${num(cy - s * 0.4)} ${num(cx)} ${num(cy + s * 0.32)}z`;
}

function bowPath(cx, cy, size, color) {
  const w = size;
  const h = size * 0.6;
  const innerX = cx - w * 0.18;
  const innerXRight = cx + w * 0.18;
  const innerWidth = w * 0.36;
  const innerHeight = h * 0.9;
  const innerTop = cy - h * 0.45;
  const innerBottom = cy + h * 0.05;
  const dxOut = w * 0.3;
  const dyUp = -h * 0.4;
  const dyDown = h * 1.4;
  return `<g stroke="${palette.outline}" stroke-width="6" stroke-linejoin="round">
  <path d="M${num(cx - w)} ${num(cy - h * 0.6)}c${num(-dxOut)} ${num(dyUp)} ${num(-dxOut)} ${num(dyDown)} 0 ${num(h)}L${num(innerX)} ${num(innerBottom)}L${num(innerX)} ${num(innerTop)}z" fill="${color}"/>
  <path d="M${num(cx + w)} ${num(cy - h * 0.6)}c${num(dxOut)} ${num(dyUp)} ${num(dxOut)} ${num(dyDown)} 0 ${num(h)}L${num(innerXRight)} ${num(innerBottom)}L${num(innerXRight)} ${num(innerTop)}z" fill="${color}"/>
  <rect x="${num(innerX)}" y="${num(innerTop)}" width="${num(innerWidth)}" height="${num(innerHeight)}" rx="${num(w * 0.1)}" fill="${color}"/>
</g>`;
}

function laceFringe(x, y, width, count, color) {
  const step = width / count;
  let path = `M${x} ${y}`;
  for (let i = 0; i < count; i += 1) {
    const cx = x + step * (i + 0.5);
    path += `Q${cx} ${y + step * 0.7} ${x + step * (i + 1)} ${y}`;
  }
  return `<path d="${path}" fill="${color}" stroke="${palette.outline}" stroke-width="5" stroke-linejoin="round"/>`;
}

function svg(bounds, body) {
  const boundsValue = bounds ? bounds.join(" ") : "empty";
  const bodyText = body.trim();
  return `<svg viewBox="${viewBox}" xmlns="http://www.w3.org/2000/svg" data-draw-bounds="${boundsValue}">${bodyText ? `\n  ${bodyText.replaceAll("\n", "\n  ")}\n` : ""}</svg>\n`;
}

function readBounds(svgString) {
  const match = svgString.match(/data-draw-bounds="([^"]+)"/);
  if (!match) {
    return null;
  }

  if (match[1] === "empty") {
    return null;
  }

  const values = match[1].split(/\s+/).map(Number);
  return {
    minX: values[0],
    minY: values[1],
    maxX: values[2],
    maxY: values[3],
  };
}

function intersects(a, b) {
  return a.minX < b.maxX && a.maxX > b.minX && a.minY < b.maxY && a.maxY > b.minY;
}

function safeZoneCheck(id, svgString) {
  if (!svgString.includes(`viewBox="${viewBox}"`)) {
    throw new Error(`face safe zone violated: ${id}`);
  }

  const bounds = readBounds(svgString);
  if (!bounds) {
    return;
  }

  const [category] = id.split("/");
  const violates =
    (category === "hats" && bounds.maxY > safeZones.hatsMaxY) ||
    (category === "clothes" && bounds.minY < safeZones.clothesMinY) ||
    (category === "shoes" && bounds.minY < safeZones.shoesMinY) ||
    (category === "items" && intersects(bounds, safeZones.itemFaceFront));

  if (violates) {
    throw new Error(`face safe zone violated: ${id}`);
  }
}

function buildBase() {
  const spec = assetSpec.character.base;
  const svgString = svg(
    spec.bounds,
    `
<ellipse cx="400" cy="814" rx="155" ry="28" fill="${palette.outline}" opacity=".18"/>
<ellipse cx="400" cy="802" rx="116" ry="17" fill="${palette.white}" opacity=".16"/>
<g stroke="${palette.outline}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
  <path d="M330 445c-44 36-68 82-76 135" fill="none"/>
  <path d="M470 445c44 36 68 82 76 135" fill="none"/>
  <circle cx="246" cy="594" r="24" fill="${palette.skin}"/>
  <circle cx="554" cy="594" r="24" fill="${palette.skin}"/>
  <ellipse cx="240" cy="586" rx="9" ry="4" fill="${palette.white}" opacity=".48"/>
  <ellipse cx="548" cy="586" rx="9" ry="4" fill="${palette.white}" opacity=".48"/>
  <path d="M352 608v154" fill="none"/>
  <path d="M448 608v154" fill="none"/>
  <rect x="318" y="736" width="74" height="58" rx="28" fill="${palette.skin}"/>
  <rect x="408" y="736" width="74" height="58" rx="28" fill="${palette.skin}"/>
  <path d="M320 382c0-56 36-91 80-91s80 35 80 91v224H320z" fill="${palette.skin}"/>
  <rect x="306" y="402" width="188" height="220" rx="70" fill="${palette.skin}"/>
  <rect x="306" y="414" width="188" height="176" rx="62" fill="${palette.skinLight}"/>
  <path d="M336 430c28 22 100 22 128 0" fill="none" stroke="${palette.white}" stroke-width="8" opacity=".42"/>
  <ellipse cx="400" cy="395" rx="44" ry="9" fill="${palette.skinShade}" opacity=".48"/>
  <circle cx="400" cy="258" r="112" fill="${palette.skin}"/>
  <ellipse cx="360" cy="226" rx="34" ry="28" fill="${palette.skinLight}" opacity=".5"/>
  <ellipse cx="446" cy="320" rx="32" ry="18" fill="${palette.skinShade}" opacity=".24"/>
  <path d="M300 236c17-73 75-111 146-91 51 15 81 54 87 102-55-9-99-34-126-71-24 35-59 56-107 60z" fill="${palette.hair}"/>
  <path d="M232 238c8-44 28-76 56-94 4 22-2 50-22 80-12 18-22 22-34 14z" fill="${palette.hair}"/>
  <path d="M530 196c14 6 26 22 32 46 4 18-2 34-12 36-12 2-22-12-30-32-6-16-4-36 10-50z" fill="${palette.hair}"/>
  <path d="M334 201c24-42 69-58 112-46" fill="none" stroke="${palette.hairShine}" stroke-width="9" opacity=".74"/>
  <path d="M320 256c14-22 40-32 70-26" fill="none" stroke="${palette.hairLight}" stroke-width="7" opacity=".6"/>
</g>
${bowPath(264, 218, 18, palette.pinkBow)}
<circle cx="264" cy="218" r="5" fill="${palette.pinkLight}"/>`,
  );
  safeZoneCheck("character/base", svgString);
  return svgString;
}

function buildFace() {
  const spec = assetSpec.character.face;
  const svgString = svg(
    spec.bounds,
    `
<g stroke="${palette.outline}" stroke-width="3" stroke-linecap="round" fill="none" opacity=".58">
  <path d="M338 252c8-6 26-6 36 0"/>
  <path d="M426 252c8-6 26-6 36 0"/>
</g>
<circle cx="358" cy="274" r="16" fill="${palette.eye}"/>
<circle cx="442" cy="274" r="16" fill="${palette.eye}"/>
<circle cx="358" cy="274" r="11" fill="${palette.eyeRing}" opacity=".72"/>
<circle cx="442" cy="274" r="11" fill="${palette.eyeRing}" opacity=".72"/>
<circle cx="354" cy="268" r="6" fill="${palette.white}"/>
<circle cx="438" cy="268" r="6" fill="${palette.white}"/>
<circle cx="362" cy="280" r="2.4" fill="${palette.white}" opacity=".82"/>
<circle cx="446" cy="280" r="2.4" fill="${palette.white}" opacity=".82"/>
<ellipse cx="324" cy="310" rx="26" ry="14" fill="#ff9db0" opacity=".55"/>
<ellipse cx="476" cy="310" rx="26" ry="14" fill="#ff9db0" opacity=".55"/>
<ellipse cx="324" cy="306" rx="14" ry="6" fill="${palette.white}" opacity=".34"/>
<ellipse cx="476" cy="306" rx="14" ry="6" fill="${palette.white}" opacity=".34"/>
<path d="M364 320c20 22 52 22 72 0" fill="${palette.pinkLight}" stroke="#4c382f" stroke-width="9" stroke-linecap="round" stroke-linejoin="round"/>
<path d="M392 326c4 4 12 4 16 0" fill="none" stroke="#4c382f" stroke-width="5" stroke-linecap="round" opacity=".52"/>`,
  );
  safeZoneCheck("character/face", svgString);
  return svgString;
}

function buildHat(id) {
  const spec = assetSpec.hats[id];
  const bodies = {
    none: "",
    yellow_hat: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M308 168c20-66 174-66 194 0v38H308z" fill="${palette.yellow}"/>
  <ellipse cx="405" cy="166" rx="62" ry="25" fill="${palette.yellowLight}" opacity=".4"/>
  <path d="M276 200h252c30 0 50 8 50 18 0 13-66 20-176 20s-176-7-176-20c0-10 20-18 50-18z" fill="${palette.yellowLight}"/>
  <path d="M324 196h152" stroke="${palette.orange}" stroke-linecap="round"/>
  <path d="M336 138c24-12 96-12 128 4" fill="none" stroke="${palette.white}" stroke-width="9" stroke-linecap="round" opacity=".62"/>
  <path d="M308 226c50 8 134 8 194 0" fill="none" stroke="${palette.yellowDeep}" stroke-width="6" stroke-linecap="round" opacity=".64"/>
</g>
<g fill="${palette.orange}" opacity=".72">
  <circle cx="358" cy="178" r="7"/>
  <circle cx="404" cy="174" r="7"/>
  <circle cx="450" cy="178" r="7"/>
</g>
${bowPath(404, 218, 22, palette.pinkBow)}
<path d="${heartPath(404, 200, 7)}" fill="${palette.pinkLight}" opacity=".9"/>`,
    rain_hat: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M306 162c0-32 42-58 94-58s94 26 94 58v40H306z" fill="${palette.blue}"/>
  <path d="M280 196h240c28 0 50 8 50 18 0 13-58 21-170 21s-170-8-170-21c0-10 22-18 50-18z" fill="${palette.blueLight}"/>
  <path d="M306 204c-18 12-24 22-12 29 18 0 30-8 32-25z" fill="${palette.blue}"/>
  <path d="M494 204c18 12 24 22 12 29-18 0-30-8-32-25z" fill="${palette.blue}"/>
  <path d="M332 200h136" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".58"/>
  <path d="M312 220c44 8 132 8 176 0" fill="none" stroke="${palette.blueDeep}" stroke-width="6" stroke-linecap="round" opacity=".58"/>
</g>
<path d="M350 142c24 22 76 22 100 0" fill="none" stroke="#effbff" stroke-width="12" stroke-linecap="round"/>
<g fill="${palette.white}" opacity=".82">
  <circle cx="350" cy="174" r="8"/>
  <circle cx="400" cy="154" r="8"/>
  <circle cx="450" cy="174" r="8"/>
</g>
${bowPath(498, 220, 12, palette.pinkBow)}`,
    sleep_cap: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M310 194c20-84 76-130 156-144 4 66-30 120-94 172z" fill="${palette.pink}"/>
  <circle cx="478" cy="58" r="28" fill="#fff4bc"/>
  <circle cx="478" cy="58" r="36" fill="#fff4bc" opacity=".22"/>
  <path d="M280 194h240c24 0 42 12 42 22 0 15-58 25-162 25s-162-10-162-25c0-10 18-22 42-22z" fill="${palette.pinkLight}"/>
  <path d="M336 196c36 14 92 14 128 0" fill="none" stroke="${palette.white}" stroke-width="8" opacity=".5"/>
  <path d="M312 222c46 8 134 8 178 0" fill="none" stroke="${palette.pinkBow}" stroke-width="6" stroke-linecap="round" opacity=".58"/>
</g>
<circle cx="358" cy="172" r="9" fill="#fff4bc"/>
<circle cx="420" cy="138" r="8" fill="#fff4bc"/>
<path d="${starPath(338, 138, 9, 4)}" fill="${palette.cream}" opacity=".82"/>
<path d="${starPath(450, 100, 8, 3.5)}" fill="${palette.cream}" opacity=".82"/>
<path d="${heartPath(394, 184, 12)}" fill="${palette.white}" opacity=".7"/>`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`hats/${id}`, svgString);
  return svgString;
}

function buildClothes(id) {
  const spec = assetSpec.clothes[id];
  const bodies = {
    daily: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M302 410c36-36 160-36 196 0l40 72-62 38-16-35v116H340V485l-16 35-62-38z" fill="${palette.white}"/>
  <path d="M332 424c34 18 102 18 136 0" fill="none" stroke="${palette.cream}" stroke-width="9" stroke-linecap="round"/>
  <path d="M334 596h132l22 100H312z" fill="#7fd7ff"/>
  <path d="M334 596l-18 100" fill="none" stroke-linecap="round"/>
  <path d="M466 596l18 100" fill="none" stroke-linecap="round"/>
  <path d="M348 630h104" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".75"/>
</g>
${laceFringe(310, 690, 180, 9, palette.white)}
${bowPath(400, 432, 18, palette.pinkBow)}
<circle cx="400" cy="465" r="14" fill="${palette.pinkDeep}" opacity=".82"/>
<path d="${heartPath(444, 540, 12)}" fill="${palette.pink}" opacity=".82"/>
<path d="${heartPath(356, 540, 12)}" fill="${palette.pink}" opacity=".82"/>
<g stroke="${palette.outline}" stroke-width="5" stroke-linecap="round" opacity=".22">
  <path d="M354 458l-18 18"/>
  <path d="M446 458l18 18"/>
</g>`,
    park_hoodie: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M320 432c10-32 50-50 80-50s70 18 80 50z" fill="#a7e6b6"/>
  <path d="M298 444c40-54 164-54 204 0l42 94-66 32-18-44v188H340V526l-18 44-66-32z" fill="${palette.green}"/>
  <path d="M400 444v264" fill="none" stroke-linecap="round"/>
  <path d="M350 610c28 18 72 18 100 0v52c-30 22-70 22-100 0z" fill="${palette.greenLight}"/>
  <path d="M338 484c22 16 102 16 124 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".42"/>
  <path d="M324 700h152" fill="none" stroke="${palette.greenDeep}" stroke-width="9" stroke-linecap="round" opacity=".7"/>
  <path d="M324 712h152" fill="none" stroke="${palette.greenDeep}" stroke-width="6" stroke-linecap="round" opacity=".55"/>
</g>
<circle cx="378" cy="476" r="9" fill="${palette.cream}"/>
<circle cx="422" cy="476" r="9" fill="${palette.cream}"/>
<path d="M362 636h76" stroke="${palette.white}" stroke-width="7" stroke-linecap="round" opacity=".55"/>
<g fill="${palette.cream}" opacity=".82">
  <circle cx="342" cy="536" r="7"/>
  <circle cx="458" cy="536" r="7"/>
</g>
<g transform="translate(348 540)">
  <circle r="14" fill="${palette.pink}"/>
  <circle r="6" fill="${palette.cream}"/>
  <g fill="${palette.pinkBow}">
    <ellipse cx="-10" cy="-2" rx="6" ry="9"/>
    <ellipse cx="10" cy="-2" rx="6" ry="9"/>
    <ellipse cx="0" cy="-12" rx="6" ry="9"/>
    <ellipse cx="0" cy="8" rx="6" ry="9"/>
  </g>
  <circle r="4" fill="${palette.cream}"/>
</g>`,
    rain_coat: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M302 410c38-34 158-34 196 0l42 96-70 34-15-42 36 206H309l36-206-15 42-70-34z" fill="${palette.yellow}"/>
  <path d="M330 414l70 58 70-58" fill="${palette.yellowLight}"/>
  <path d="M400 470v218" fill="none" stroke-linecap="round"/>
  <path d="M336 452c34 22 94 22 128 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".55"/>
  <path d="M310 700h180" fill="none" stroke="${palette.yellowDeep}" stroke-width="8" stroke-linecap="round" opacity=".68"/>
</g>
<circle cx="400" cy="526" r="11" fill="#fff8cf"/>
<circle cx="400" cy="576" r="11" fill="#fff8cf"/>
<circle cx="400" cy="626" r="11" fill="#fff8cf"/>
<g fill="${palette.blue}" opacity=".55">
  <path d="M346 540c10 17 16 28 16 38a16 16 0 1 1-32 0c0-10 6-21 16-38z"/>
  <path d="M454 610c9 15 14 25 14 34a14 14 0 1 1-28 0c0-9 5-19 14-34z"/>
</g>
${bowPath(400, 430, 22, palette.pinkBow)}
<path d="${heartPath(400, 410, 7)}" fill="${palette.pinkLight}" opacity=".9"/>`,
    pajamas: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M300 414c38-38 162-38 200 0l48 86-66 36-24-42v192H342V494l-24 42-66-36z" fill="#9fe7ff"/>
  <path d="M340 682h120l32 112H308z" fill="#9fe7ff"/>
  <path d="M400 416v368" fill="none" stroke-linecap="round"/>
  <path d="M334 450c38 24 94 24 132 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".5"/>
  <path d="M308 786h184" fill="none" stroke="${palette.blueDeep}" stroke-width="9" stroke-linecap="round" opacity=".58"/>
  <path d="M310 798h180" fill="none" stroke="${palette.blueDeep}" stroke-width="6" stroke-linecap="round" opacity=".42"/>
</g>
<g fill="#fff4a7">
  <path d="${starPath(360, 495, 30, 13)}"/>
  <path d="${starPath(450, 579, 26, 11)}"/>
  <path d="${starPath(356, 651, 22, 9)}"/>
  <path d="${starPath(458, 730, 18, 7)}"/>
</g>
<path d="${heartPath(444, 690, 13)}" fill="${palette.pink}" opacity=".78"/>
<g fill="${palette.white}" opacity=".88">
  <circle cx="416" cy="492" r="7"/>
  <circle cx="416" cy="542" r="7"/>
  <circle cx="416" cy="592" r="7"/>
</g>
${bowPath(400, 432, 17, palette.pinkBow)}`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`clothes/${id}`, svgString);
  return svgString;
}

function buildShoes(id) {
  const spec = assetSpec.shoes[id];
  const bodies = {
    normal: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M306 770h90c20 0 36 16 36 36v16H286v-20c0-18 10-32 20-32z" fill="${palette.brown}"/>
  <path d="M404 770h90c10 0 20 14 20 32v20H368v-16c0-20 16-36 36-36z" fill="${palette.brown}"/>
  <path d="M326 796h70" stroke="#fff0a8" stroke-linecap="round"/>
  <path d="M404 796h70" stroke="#fff0a8" stroke-linecap="round"/>
  <path d="M294 822h132M374 822h132" fill="none" stroke="${palette.outline}" stroke-width="8" opacity=".28"/>
</g>
<ellipse cx="356" cy="780" rx="34" ry="10" fill="${palette.white}" opacity=".28"/>
<ellipse cx="456" cy="780" rx="34" ry="10" fill="${palette.white}" opacity=".28"/>
${bowPath(356, 786, 12, palette.pinkBow)}
${bowPath(456, 786, 12, palette.pinkBow)}`,
    sneakers: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M294 756h104c24 0 44 20 44 44v22H278v-28c0-22 8-38 16-38z" fill="#f36f5f"/>
  <path d="M402 756h104c8 0 16 16 16 38v28H358v-22c0-24 20-44 44-44z" fill="#f36f5f"/>
  <path d="M286 820h154" stroke="${palette.white}" stroke-linecap="round"/>
  <path d="M360 820h154" stroke="${palette.white}" stroke-linecap="round"/>
</g>
<path d="M328 786h64M408 786h64" stroke="${palette.white}" stroke-width="10" stroke-linecap="round"/>
<path d="M336 800l34-24M416 800l34-24" stroke="${palette.cream}" stroke-width="6" stroke-linecap="round" opacity=".75"/>
<g fill="${palette.white}" opacity=".62">
  <circle cx="306" cy="772" r="5"/>
  <circle cx="412" cy="772" r="5"/>
</g>
<g fill="${palette.cream}">
  <circle cx="338" cy="780" r="4"/>
  <circle cx="416" cy="780" r="4"/>
</g>`,
    rain_boots: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M302 696h96v126H282v-34c0-20 20-36 42-36h-22z" fill="${palette.yellow}"/>
  <path d="M402 696h96v56h-22c22 0 42 16 42 36v34H402z" fill="${palette.yellow}"/>
  <path d="M304 720h92M404 720h92" stroke="#fff8cf" stroke-linecap="round"/>
  <path d="M304 748h92M404 748h92" stroke="${palette.orange}" stroke-width="8" stroke-linecap="round" opacity=".62"/>
</g>
<g fill="${palette.blue}" opacity=".58">
  <path d="M342 770c8 13 12 22 12 30a12 12 0 1 1-24 0c0-8 4-17 12-30z"/>
  <path d="M456 770c8 13 12 22 12 30a12 12 0 1 1-24 0c0-8 4-17 12-30z"/>
</g>
<g fill="${palette.red}" opacity=".66">
  <circle cx="318" cy="788" r="5"/>
  <circle cx="380" cy="800" r="5"/>
  <circle cx="436" cy="788" r="5"/>
  <circle cx="488" cy="800" r="5"/>
</g>
<path d="${heartPath(348, 712, 8)}" fill="${palette.pinkBow}" opacity=".82"/>
<path d="${heartPath(452, 712, 8)}" fill="${palette.pinkBow}" opacity=".82"/>`,
    fluffy_socks: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M306 724h92v96H282v-24c0-22 18-38 42-38h-18z" fill="${palette.white}"/>
  <path d="M402 724h92v34h-18c24 0 42 16 42 38v24H402z" fill="${palette.white}"/>
  <path d="M304 724c14-22 76-22 92 0" fill="#fff2f7"/>
  <path d="M404 724c14-22 76-22 92 0" fill="#fff2f7"/>
  <path d="M300 820h104M398 820h104" stroke="#ffe0ec" stroke-linecap="round"/>
</g>
<circle cx="330" cy="748" r="10" fill="#ffe0ec"/>
<circle cx="374" cy="748" r="10" fill="#ffe0ec"/>
<circle cx="426" cy="748" r="10" fill="#ffe0ec"/>
<circle cx="470" cy="748" r="10" fill="#ffe0ec"/>
<path d="${heartPath(350, 792, 10)}" fill="${palette.pink}" opacity=".82"/>
<path d="${heartPath(450, 792, 10)}" fill="${palette.pink}" opacity=".82"/>
<g stroke="${palette.pinkLight}" stroke-width="4" stroke-linecap="round" opacity=".7" fill="none">
  <path d="M310 730c18 6 60 6 80 2"/>
  <path d="M408 730c18 6 60 6 80 2"/>
</g>`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`shoes/${id}`, svgString);
  return svgString;
}

function buildItem(id) {
  const spec = assetSpec.items[id];
  const bodies = {
    none: "",
    backpack: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M252 438c16-54 114-54 130 0v220c0 38-24 66-65 66s-65-28-65-66z" fill="${palette.red}"/>
  <path d="M286 420c0-30 62-30 62 0" fill="none" stroke-linecap="round"/>
  <path d="M272 538h90" stroke-linecap="round"/>
  <path d="M262 470c-42 40-55 104-41 184" fill="none" stroke-linecap="round"/>
  <path d="M372 470c42 40 55 104 41 184" fill="none" stroke-linecap="round"/>
  <path d="M282 604h70v76h-70z" fill="${palette.orange}"/>
  <path d="M278 462c20 16 58 16 78 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".48"/>
  <path d="M260 660h114" fill="none" stroke="${palette.outline}" stroke-width="6" stroke-linecap="round" opacity=".4"/>
</g>
<path d="M292 642h50" stroke="${palette.cream}" stroke-width="7" stroke-linecap="round"/>
<g fill="${palette.cream}" opacity=".78">
  <circle cx="292" cy="512" r="7"/>
  <circle cx="342" cy="512" r="7"/>
</g>
<path d="M404 690l-12 36" fill="none" stroke="${palette.outline}" stroke-width="6" stroke-linecap="round"/>
<path d="${heartPath(388, 728, 12)}" fill="${palette.pinkBow}" opacity=".95"/>
<circle cx="388" cy="724" r="3" fill="${palette.white}" opacity=".82"/>
${bowPath(317, 416, 16, palette.pinkBow)}`,
    umbrella: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
  <path d="M540 198c0-72 54-118 120-118s120 46 120 118z" fill="${palette.blue}"/>
  <path d="M540 198c20 26 40 26 60 0 20 26 40 26 60 0 20 26 40 26 60 0 20 26 40 26 60 0" fill="none"/>
  <path d="M660 198l-106 408" fill="none"/>
  <path d="M554 606c-8 38-44 36-46 0" fill="none"/>
  <path d="M584 126c34-28 116-28 150 0" fill="none" stroke="${palette.white}" stroke-width="9" opacity=".5"/>
  <path d="M548 152c20 22 40 22 60 0" fill="none" stroke="${palette.blueLight}" stroke-width="9" opacity=".7"/>
  <path d="M608 138c20 22 40 22 60 0" fill="none" stroke="${palette.blueLight}" stroke-width="9" opacity=".7"/>
  <path d="M668 152c20 22 40 22 60 0" fill="none" stroke="${palette.blueLight}" stroke-width="9" opacity=".7"/>
</g>
<g fill="${palette.white}">
  <circle cx="580" cy="170" r="11"/>
  <circle cx="660" cy="146" r="10"/>
  <circle cx="740" cy="170" r="11"/>
</g>
<path d="${heartPath(706, 142, 14)}" fill="${palette.pinkBow}" opacity=".82"/>
${bowPath(660, 84, 18, palette.pinkBow)}
<path d="M540 200c12 8 36 8 60 0" fill="none" stroke="${palette.blueDeep}" stroke-width="6" stroke-linecap="round" opacity=".62"/>`,
    plush: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <circle cx="548" cy="496" r="76" fill="${palette.plush}"/>
  <circle cx="492" cy="438" r="28" fill="${palette.plush}"/>
  <circle cx="604" cy="438" r="28" fill="${palette.plush}"/>
  <circle cx="492" cy="438" r="14" fill="${palette.plushLight}"/>
  <circle cx="604" cy="438" r="14" fill="${palette.plushLight}"/>
  <ellipse cx="548" cy="488" rx="48" ry="22" fill="${palette.plushLight}" opacity=".58"/>
  <ellipse cx="548" cy="628" rx="78" ry="92" fill="${palette.plush}"/>
  <path d="M490 610c-48 18-70 54-55 88 42-3 72-30 89-76z" fill="${palette.plushLight}"/>
  <path d="M606 610c48 18 70 54 55 88-42-3-72-30-89-76z" fill="${palette.plushLight}"/>
  <path d="M500 700c-35 35-34 66 4 82 31-12 46-37 44-76z" fill="${palette.plushLight}"/>
  <path d="M596 700c35 35 34 66-4 82-31-12-46-37-44-76z" fill="${palette.plushLight}"/>
  <path d="M516 590c20 20 44 20 64 0" fill="none" stroke="${palette.plushLight}" stroke-width="9"/>
  <path d="M512 626c4 8 16 12 24 0" fill="none" stroke="${palette.plushDeep}" stroke-width="6" stroke-linecap="round" opacity=".64"/>
  <path d="M564 626c4 8 16 12 24 0" fill="none" stroke="${palette.plushDeep}" stroke-width="6" stroke-linecap="round" opacity=".64"/>
</g>
<circle cx="522" cy="500" r="11" fill="${palette.eye}"/>
<circle cx="574" cy="500" r="11" fill="${palette.eye}"/>
<circle cx="518" cy="496" r="4" fill="${palette.white}"/>
<circle cx="570" cy="496" r="4" fill="${palette.white}"/>
<ellipse cx="548" cy="528" rx="23" ry="16" fill="#f2c79b"/>
<path d="M532 546c10 12 22 12 32 0" fill="none" stroke="${palette.eye}" stroke-width="8" stroke-linecap="round"/>
<ellipse cx="500" cy="540" rx="13" ry="7" fill="#ff9db0" opacity=".58"/>
<ellipse cx="596" cy="540" rx="13" ry="7" fill="#ff9db0" opacity=".58"/>
<path d="${heartPath(548, 666, 14)}" fill="${palette.pink}" opacity=".62"/>
${bowPath(548, 426, 18, palette.pinkBow)}`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`items/${id}`, svgString);
  return svgString;
}

function buildBackground(id) {
  const spec = assetSpec.backgrounds[id];
  const bodies = {
    park: `
<defs>
  <linearGradient id="park-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#cdf2ff"/>
    <stop offset="100%" stop-color="#9ddcf3"/>
  </linearGradient>
  <linearGradient id="park-ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#9ee2ad"/>
    <stop offset="100%" stop-color="#67c684"/>
  </linearGradient>
</defs>
<rect width="800" height="1000" fill="url(#park-sky)"/>
<circle cx="675" cy="118" r="62" fill="#ffe176"/>
<circle cx="675" cy="118" r="92" fill="#ffe176" opacity=".22"/>
<circle cx="675" cy="118" r="124" fill="#ffe176" opacity=".1"/>
<g fill="${palette.white}" opacity=".9">
  <path d="M70 168c20-30 60-30 80 0 24-22 64-22 86 6-30 12-118 12-166-6z"/>
  <path d="M438 110c20-26 56-26 76 0 22-18 58-18 80 6-28 10-126 10-156-6z"/>
  <path d="M126 280c14-22 46-22 60 0 16-16 44-16 60 4-22 8-96 8-120-4z"/>
</g>
<path d="M0 640c130-88 220-80 352-4 150-84 284-92 448 6v358H0z" fill="url(#park-ground)"/>
<path d="M0 724c110-58 236-52 362 18 122-54 276-52 438 4v254H0z" fill="#5fbf7a"/>
<path d="M348 720c44 30 72 96 84 280H260c22-132 48-216 88-280z" fill="#f7d690" opacity=".7"/>
<path d="M484 490h80v214h-80z" fill="#ffbd6f" stroke="${palette.outline}" stroke-width="10" stroke-linejoin="round"/>
<path d="M540 516h172l-36 70H540z" fill="#7dc8ff" stroke="${palette.outline}" stroke-width="10" stroke-linejoin="round"/>
<path d="M674 586c-38 68-72 106-140 140" fill="none" stroke="${palette.outline}" stroke-width="10" stroke-linecap="round"/>
<g stroke="${palette.outline}" stroke-width="6" stroke-linecap="round" opacity=".42">
  <path d="M112 758v32"/>
  <path d="M160 724v28"/>
  <path d="M214 776v22"/>
  <path d="M666 772v32"/>
  <path d="M720 740v28"/>
</g>
<g fill="${palette.white}">
  <g transform="translate(112 752)">
    <circle r="10"/>
    <g fill="#ffe176">
      <ellipse cx="0" cy="-10" rx="6" ry="9"/>
      <ellipse cx="9" cy="-2" rx="9" ry="6"/>
      <ellipse cx="-9" cy="-2" rx="9" ry="6"/>
      <ellipse cx="6" cy="7" rx="8" ry="6"/>
      <ellipse cx="-6" cy="7" rx="8" ry="6"/>
    </g>
    <circle r="5" fill="${palette.yellow}"/>
  </g>
  <g transform="translate(160 720)">
    <g fill="#ff8aa0">
      <ellipse cx="0" cy="-9" rx="5" ry="8"/>
      <ellipse cx="8" cy="-2" rx="8" ry="5"/>
      <ellipse cx="-8" cy="-2" rx="8" ry="5"/>
      <ellipse cx="5" cy="6" rx="7" ry="5"/>
      <ellipse cx="-5" cy="6" rx="7" ry="5"/>
    </g>
    <circle r="4" fill="${palette.cream}"/>
  </g>
  <g transform="translate(214 770)">
    <g fill="${palette.white}">
      <ellipse cx="0" cy="-9" rx="5" ry="8"/>
      <ellipse cx="8" cy="-2" rx="8" ry="5"/>
      <ellipse cx="-8" cy="-2" rx="8" ry="5"/>
      <ellipse cx="5" cy="6" rx="7" ry="5"/>
      <ellipse cx="-5" cy="6" rx="7" ry="5"/>
    </g>
    <circle r="4" fill="${palette.yellow}"/>
  </g>
  <g transform="translate(666 770)">
    <g fill="#ffb8d1">
      <ellipse cx="0" cy="-10" rx="6" ry="9"/>
      <ellipse cx="9" cy="-2" rx="9" ry="6"/>
      <ellipse cx="-9" cy="-2" rx="9" ry="6"/>
      <ellipse cx="6" cy="7" rx="8" ry="6"/>
      <ellipse cx="-6" cy="7" rx="8" ry="6"/>
    </g>
    <circle r="5" fill="${palette.cream}"/>
  </g>
  <g transform="translate(720 738)">
    <g fill="#fff4a7">
      <ellipse cx="0" cy="-9" rx="5" ry="8"/>
      <ellipse cx="8" cy="-2" rx="8" ry="5"/>
      <ellipse cx="-8" cy="-2" rx="8" ry="5"/>
      <ellipse cx="5" cy="6" rx="7" ry="5"/>
      <ellipse cx="-5" cy="6" rx="7" ry="5"/>
    </g>
    <circle r="4" fill="${palette.orange}"/>
  </g>
</g>
<g fill="${palette.white}" opacity=".5">
  <circle cx="220" cy="612" r="7"/>
  <circle cx="450" cy="600" r="6"/>
</g>`,
    rain: `
<defs>
  <linearGradient id="rain-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#c1d8e7"/>
    <stop offset="100%" stop-color="#9eb9cd"/>
  </linearGradient>
  <linearGradient id="rain-ground" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#a4dfc2"/>
    <stop offset="100%" stop-color="#79c4a0"/>
  </linearGradient>
</defs>
<rect width="800" height="1000" fill="url(#rain-sky)"/>
<g opacity=".46" fill="none" stroke-width="20" stroke-linecap="round">
  <path d="M-40 460c160 0 200-80 360-80s200 80 360 80" stroke="#ffd9e9"/>
  <path d="M-40 480c160 0 200-80 360-80s200 80 360 80" stroke="#fce0a4" opacity=".6"/>
  <path d="M-40 500c160 0 200-80 360-80s200 80 360 80" stroke="#bce0a4" opacity=".5"/>
  <path d="M-40 520c160 0 200-80 360-80s200 80 360 80" stroke="#a3d4ee" opacity=".5"/>
</g>
<path d="M0 0h800v580c-160 55-294 44-414-18-130 56-258 56-386 0z" fill="#9fb6c5" opacity=".82"/>
<path d="M60 230c58-54 132-54 190 0 48-34 116-30 160 12 54-42 124-34 168 18" fill="none" stroke="#eef7ff" stroke-width="42" stroke-linecap="round" opacity=".88"/>
<g fill="#65b7ef" opacity=".74">
  <path d="M154 330c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
  <path d="M324 282c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
  <path d="M498 344c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
  <path d="M660 286c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
</g>
<g fill="${palette.white}" opacity=".7">
  <ellipse cx="154" cy="370" rx="6" ry="11"/>
  <ellipse cx="324" cy="322" rx="6" ry="11"/>
  <ellipse cx="498" cy="384" rx="6" ry="11"/>
  <ellipse cx="660" cy="326" rx="6" ry="11"/>
</g>
<rect y="624" width="800" height="376" fill="url(#rain-ground)"/>
<ellipse cx="250" cy="780" rx="160" ry="44" fill="#66bde8" opacity=".78"/>
<ellipse cx="570" cy="704" rx="98" ry="28" fill="#66bde8" opacity=".66"/>
<ellipse cx="250" cy="770" rx="92" ry="18" fill="${palette.white}" opacity=".3"/>
<ellipse cx="570" cy="696" rx="56" ry="11" fill="${palette.white}" opacity=".26"/>
<g fill="${palette.white}" opacity=".4">
  <circle cx="186" cy="770" r="6"/>
  <circle cx="244" cy="752" r="5"/>
  <circle cx="320" cy="780" r="6"/>
  <circle cx="552" cy="690" r="5"/>
  <circle cx="612" cy="704" r="5"/>
</g>
<path d="M0 642c112 28 220 28 326-4 146 42 304 42 474 0" fill="none" stroke="${palette.white}" stroke-width="10" opacity=".26"/>`,
    sleep: `
<defs>
  <linearGradient id="sleep-sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#e6e2ff"/>
    <stop offset="100%" stop-color="#cec8f8"/>
  </linearGradient>
  <linearGradient id="sleep-floor" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0%" stop-color="#ffe4ef"/>
    <stop offset="100%" stop-color="#f6c8d8"/>
  </linearGradient>
</defs>
<rect width="800" height="1000" fill="url(#sleep-sky)"/>
<rect y="620" width="800" height="380" fill="url(#sleep-floor)"/>
<path d="M0 620h800" stroke="${palette.outline}" stroke-width="8" opacity=".22"/>
<path d="M610 92c-50 22-70 82-43 130 26 48 86 65 132 40-20 48-78 80-136 67-72-16-116-88-100-160 12-52 52-88 102-101 17-4 35-3 45 24z" fill="#fff0a6"/>
<path d="M598 110c-26 14-38 50-22 80 16 30 50 38 76 22-12 28-46 50-78 40-44-10-68-58-58-104 8-34 32-58 64-66 12-4 22-2 18 28z" fill="#fff7c8" opacity=".7"/>
<g fill="#fff4a7">
  <path d="${starPath(174, 190, 43, 19)}"/>
  <path d="${starPath(314, 267, 32, 14)}"/>
  <path d="${starPath(684, 418, 39, 17)}"/>
  <path d="${starPath(120, 392, 22, 9)}"/>
  <path d="${starPath(420, 168, 24, 10)}"/>
</g>
<g fill="${palette.white}" opacity=".62">
  <circle cx="174" cy="186" r="6"/>
  <circle cx="314" cy="263" r="5"/>
  <circle cx="684" cy="414" r="6"/>
</g>
<path d="${heartPath(244, 388, 22)}" fill="${palette.pink}" opacity=".48"/>
<path d="${heartPath(540, 312, 18)}" fill="${palette.pink}" opacity=".4"/>
<rect x="84" y="604" width="632" height="122" rx="46" fill="${palette.white}" stroke="${palette.outline}" stroke-width="10" opacity=".58"/>
<rect x="124" y="560" width="180" height="110" rx="34" fill="#bfefff" stroke="${palette.outline}" stroke-width="10" opacity=".84"/>
<path d="M132 612c50 30 110 30 158 0" fill="none" stroke="${palette.white}" stroke-width="9" opacity=".66"/>
<path d="M130 650c118 38 314 38 568 0" fill="none" stroke="${palette.white}" stroke-width="12" opacity=".46"/>
<g transform="translate(146 524)">
  <ellipse cx="0" cy="0" rx="34" ry="14" fill="#fff8d9" stroke="${palette.outline}" stroke-width="6"/>
  <path d="M-12 0v-40h24v40" fill="#fff8d9" stroke="${palette.outline}" stroke-width="6" stroke-linejoin="round"/>
  <path d="M0 -42c-22 0-32-22-12-30 14-6 32 0 32 14 0 10-8 16-20 16z" fill="#fff2a6" stroke="${palette.outline}" stroke-width="6"/>
</g>`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`backgrounds/${id}`, svgString);
  return svgString;
}

function buildOverlay(id) {
  const spec = assetSpec.overlays[id];
  const bodies = {
    park_birds: `
<g fill="none" stroke="${palette.outline}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".82">
  <path d="M170 238c24-32 54-32 78 0 24-32 54-32 78 0"/>
  <path d="M464 176c20-26 44-26 64 0 20-26 44-26 64 0"/>
  <path d="M548 292c18-22 40-22 58 0 18-22 40-22 58 0"/>
</g>
<g fill="${palette.cream}" opacity=".82">
  <circle cx="144" cy="304" r="13"/>
  <circle cx="624" cy="126" r="11"/>
  <path d="${starPath(382, 142, 19, 8)}"/>
</g>
<g fill="${palette.pink}" opacity=".68">
  <path d="${heartPath(220, 200, 11)}"/>
  <path d="${heartPath(680, 252, 11)}"/>
</g>
<g fill="${palette.white}" opacity=".82">
  <circle cx="92" cy="200" r="6"/>
  <circle cx="380" cy="280" r="5"/>
  <circle cx="700" cy="180" r="6"/>
</g>`,
      rain_drops: `
<g fill="#65b7ef" opacity=".62">
  <path d="M94 110c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M222 228c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M384 124c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M520 262c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M682 142c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M136 420c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M640 448c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
</g>
<g fill="${palette.white}" opacity=".4">
  <ellipse cx="94" cy="162" rx="7" ry="12"/>
  <ellipse cx="384" cy="176" rx="7" ry="12"/>
  <ellipse cx="640" cy="500" rx="7" ry="12"/>
</g>
<g fill="${palette.pinkLight}" opacity=".75">
  <path d="${heartPath(312, 388, 12)}"/>
  <path d="${heartPath(560, 502, 12)}"/>
</g>`,
    sleep_stars: `
<g fill="#fff4a7" opacity=".88">
  <path d="${starPath(112, 288, 43, 19)}"/>
  <path d="${starPath(246, 139, 32, 14)}"/>
  <path d="${starPath(548, 212, 43, 19)}"/>
  <path d="${starPath(688, 375, 32, 14)}"/>
  <path d="${starPath(166, 513, 32, 14)}"/>
  <path d="${starPath(412, 472, 22, 10)}"/>
</g>
<g fill="${palette.white}" opacity=".6">
  <circle cx="112" cy="284" r="5"/>
  <circle cx="548" cy="208" r="4"/>
  <circle cx="166" cy="509" r="4"/>
</g>
<g fill="${palette.pink}" opacity=".46">
  <path d="${heartPath(348, 336, 18)}"/>
  <path d="${heartPath(620, 514, 16)}"/>
</g>
<g fill="${palette.cream}" opacity=".68" font-family="serif" font-style="italic" font-size="48">
  <text x="436" y="118">Z</text>
  <text x="486" y="146" font-size="34">z</text>
</g>`,
    confetti: `
<g opacity=".9">
  <rect x="104" y="118" width="42" height="18" rx="8" fill="#ff8aa0" transform="rotate(20 125 127)"/>
  <rect x="232" y="210" width="20" height="48" rx="8" fill="#ffe176" transform="rotate(-24 242 234)"/>
  <rect x="648" y="158" width="44" height="18" rx="8" fill="#7bdc96" transform="rotate(-18 670 167)"/>
  <rect x="568" y="304" width="20" height="48" rx="8" fill="#9fe7ff" transform="rotate(32 578 328)"/>
  <rect x="116" y="462" width="44" height="18" rx="8" fill="#ff9a65" transform="rotate(-30 138 471)"/>
  <rect x="674" y="520" width="20" height="48" rx="8" fill="#ff8aa0" transform="rotate(24 684 544)"/>
  <rect x="380" y="568" width="36" height="14" rx="6" fill="#9fe7ff" transform="rotate(-12 398 575)"/>
  <circle cx="206" cy="338" r="16" fill="#7bdc96"/>
  <circle cx="594" cy="438" r="14" fill="#ffe176"/>
  <circle cx="384" cy="126" r="12" fill="#9fe7ff"/>
  <circle cx="500" cy="552" r="10" fill="#ffb8d1"/>
  <path d="${starPath(400, 290, 43, 19)}" fill="#fff6c8"/>
  <path d="${starPath(160, 220, 18, 8)}" fill="#fff6c8"/>
  <path d="${starPath(720, 380, 22, 10)}" fill="#fff6c8"/>
  <path d="${heartPath(506, 188, 18)}" fill="${palette.pink}"/>
  <path d="${heartPath(296, 430, 16)}" fill="${palette.blueLight}"/>
  <path d="${heartPath(640, 250, 14)}" fill="${palette.pinkLight}"/>
</g>`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`overlays/${id}`, svgString);
  return svgString;
}

const outputs = [
  [assetSpec.character.base.file, buildBase()],
  [assetSpec.character.face.file, buildFace()],
  ...Object.keys(assetSpec.hats).map((id) => [assetSpec.hats[id].file, buildHat(id)]),
  ...Object.keys(assetSpec.clothes).map((id) => [assetSpec.clothes[id].file, buildClothes(id)]),
  ...Object.keys(assetSpec.shoes).map((id) => [assetSpec.shoes[id].file, buildShoes(id)]),
  ...Object.keys(assetSpec.items).map((id) => [assetSpec.items[id].file, buildItem(id)]),
  ...Object.keys(assetSpec.backgrounds).map((id) => [assetSpec.backgrounds[id].file, buildBackground(id)]),
  ...Object.keys(assetSpec.overlays).map((id) => [assetSpec.overlays[id].file, buildOverlay(id)]),
];

for (const [relativePath, contents] of outputs) {
  const outputPath = join(assetsRoot, relativePath);
  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, contents, "utf8");
}

console.log(`${outputs.length} assets generated`);
