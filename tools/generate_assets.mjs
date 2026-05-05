import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
const assetsRoot = join(repoRoot, "public", "assets");
const viewBox = "0 0 800 1000";

const palette = {
  outline: "#5b4438",
  skin: "#ffd8ba",
  skinLight: "#ffe8d8",
  hair: "#6e4c37",
  hairLight: "#8a6449",
  yellow: "#ffd84e",
  yellowLight: "#fff2a6",
  blue: "#65c7ff",
  blueLight: "#a7e8ff",
  pink: "#ffb8d1",
  pinkLight: "#ffe1f1",
  green: "#83d99b",
  greenLight: "#baf0c6",
  orange: "#ff9a65",
  white: "#ffffff",
  cream: "#fff6c8",
  red: "#ef5656",
  brown: "#9b6b43",
  plush: "#d9a978",
  plushLight: "#e9bd8b",
  eye: "#3f302b",
};

const safeZones = {
  hatsMaxY: 240,
  clothesMinY: 380,
  shoesMinY: 690,
  itemFaceFront: { minX: 370, minY: 200, maxX: 430, maxY: 340 },
};

const assetSpec = {
  character: {
    base: { file: "character/base.svg", bounds: [246, 145, 554, 842] },
    face: { file: "character/face.svg", bounds: [303, 259, 497, 330] },
  },
  hats: {
    none: { file: "hats/none.svg", bounds: null },
    yellow_hat: { file: "hats/yellow_hat.svg", bounds: [226, 116, 578, 240] },
    rain_hat: { file: "hats/rain_hat.svg", bounds: [230, 104, 570, 240] },
    sleep_cap: { file: "hats/sleep_cap.svg", bounds: [238, 30, 562, 240] },
  },
  clothes: {
    daily: { file: "clothes/daily.svg", bounds: [262, 398, 538, 714] },
    park_hoodie: { file: "clothes/park_hoodie.svg", bounds: [256, 382, 544, 724] },
    rain_coat: { file: "clothes/rain_coat.svg", bounds: [260, 398, 540, 714] },
    pajamas: { file: "clothes/pajamas.svg", bounds: [252, 402, 548, 804] },
  },
  shoes: {
    normal: { file: "shoes/normal.svg", bounds: [286, 760, 514, 826] },
    sneakers: { file: "shoes/sneakers.svg", bounds: [278, 748, 522, 826] },
    rain_boots: { file: "shoes/rain_boots.svg", bounds: [282, 696, 518, 826] },
    fluffy_socks: { file: "shoes/fluffy_socks.svg", bounds: [282, 716, 518, 826] },
  },
  items: {
    none: { file: "items/none.svg", bounds: null },
    backpack: { file: "items/backpack.svg", bounds: [218, 390, 416, 732] },
    umbrella: { file: "items/umbrella.svg", bounds: [508, 74, 780, 616] },
    plush: { file: "items/plush.svg", bounds: [435, 410, 666, 790] },
  },
  backgrounds: {
    park: { file: "backgrounds/park.svg", bounds: [0, 0, 800, 1000] },
    rain: { file: "backgrounds/rain.svg", bounds: [0, 0, 800, 1000] },
    sleep: { file: "backgrounds/sleep.svg", bounds: [0, 0, 800, 1000] },
  },
  overlays: {
    park_birds: { file: "overlays/park_birds.svg", bounds: [90, 116, 702, 324] },
    rain_drops: { file: "overlays/rain_drops.svg", bounds: [69, 110, 707, 534] },
    sleep_stars: { file: "overlays/sleep_stars.svg", bounds: [68, 94, 720, 549] },
    confetti: { file: "overlays/confetti.svg", bounds: [84, 104, 706, 568] },
  },
};

function attrs(values) {
  return Object.entries(values)
    .map(([key, value]) => `${key}="${value}"`)
    .join(" ");
}

function starPath(cx, cy, outer, inner = outer * 0.45) {
  const points = [];
  for (let i = 0; i < 10; i += 1) {
    const angle = -Math.PI / 2 + (i * Math.PI) / 5;
    const radius = i % 2 === 0 ? outer : inner;
    points.push(`${(cx + Math.cos(angle) * radius).toFixed(1)} ${(cy + Math.sin(angle) * radius).toFixed(1)}`);
  }
  return `M${points[0]}L${points.slice(1).join("L")}z`;
}

function heartPath(cx, cy, size) {
  const s = size;
  return `M${cx} ${cy + s * 0.32}C${cx - s * 1.2} ${cy - s * 0.4} ${cx - s} ${cy - s * 1.25} ${cx - s * 0.38} ${cy - s * 1.25}C${cx - s * 0.12} ${cy - s * 1.25} ${cx} ${cy - s * 1.05} ${cx} ${cy - s * 0.82}C${cx} ${cy - s * 1.05} ${cx + s * 0.12} ${cy - s * 1.25} ${cx + s * 0.38} ${cy - s * 1.25}C${cx + s} ${cy - s * 1.25} ${cx + s * 1.2} ${cy - s * 0.4} ${cx} ${cy + s * 0.32}z`;
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
  <path d="M352 608v154" fill="none"/>
  <path d="M448 608v154" fill="none"/>
  <rect x="318" y="736" width="74" height="58" rx="28" fill="${palette.skin}"/>
  <rect x="408" y="736" width="74" height="58" rx="28" fill="${palette.skin}"/>
  <path d="M320 382c0-56 36-91 80-91s80 35 80 91v224H320z" fill="${palette.skin}"/>
  <rect x="306" y="402" width="188" height="220" rx="70" fill="${palette.skin}"/>
  <rect x="306" y="414" width="188" height="176" rx="62" fill="${palette.skinLight}"/>
  <path d="M336 430c28 22 100 22 128 0" fill="none" stroke="${palette.white}" stroke-width="8" opacity=".38"/>
  <circle cx="400" cy="258" r="112" fill="${palette.skin}"/>
  <ellipse cx="360" cy="226" rx="34" ry="28" fill="${palette.skinLight}" opacity=".44"/>
  <path d="M300 236c17-73 75-111 146-91 51 15 81 54 87 102-55-9-99-34-126-71-24 35-59 56-107 60z" fill="${palette.hair}"/>
  <path d="M334 201c24-42 69-58 112-46" fill="none" stroke="${palette.hairLight}" stroke-width="10" opacity=".62"/>
</g>`,
  );
  safeZoneCheck("character/base", svgString);
  return svgString;
}

function buildFace() {
  const spec = assetSpec.character.face;
  const svgString = svg(
    spec.bounds,
    `
<circle cx="358" cy="271" r="12" fill="${palette.eye}"/>
<circle cx="442" cy="271" r="12" fill="${palette.eye}"/>
<circle cx="354" cy="266" r="4" fill="${palette.white}" opacity=".78"/>
<circle cx="438" cy="266" r="4" fill="${palette.white}" opacity=".78"/>
<ellipse cx="327" cy="307" rx="24" ry="13" fill="#ff9db0" opacity=".48"/>
<ellipse cx="473" cy="307" rx="24" ry="13" fill="#ff9db0" opacity=".48"/>
<ellipse cx="327" cy="304" rx="13" ry="6" fill="${palette.white}" opacity=".24"/>
<ellipse cx="473" cy="304" rx="13" ry="6" fill="${palette.white}" opacity=".24"/>
<path d="M366 318c18 24 50 24 68 0" fill="none" stroke="#4c382f" stroke-width="10" stroke-linecap="round"/>`,
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
  <ellipse cx="405" cy="166" rx="62" ry="25" fill="${palette.yellowLight}" opacity=".36"/>
  <path d="M276 200h252c30 0 50 8 50 18 0 13-66 20-176 20s-176-7-176-20c0-10 20-18 50-18z" fill="#ffe47a"/>
  <path d="M324 194h152" stroke="${palette.orange}" stroke-linecap="round"/>
  <path d="M338 140c24-14 96-14 124 2" fill="none" stroke="${palette.white}" stroke-width="9" stroke-linecap="round" opacity=".55"/>
</g>
<g fill="${palette.orange}" opacity=".68">
  <circle cx="356" cy="178" r="7"/>
  <circle cx="404" cy="176" r="7"/>
  <circle cx="452" cy="178" r="7"/>
</g>`,
    rain_hat: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M306 162c0-32 42-58 94-58s94 26 94 58v40H306z" fill="${palette.blue}"/>
  <path d="M280 196h240c28 0 50 8 50 18 0 13-58 21-170 21s-170-8-170-21c0-10 22-18 50-18z" fill="${palette.blueLight}"/>
  <path d="M306 204c-18 12-24 22-12 29 18 0 30-8 32-25z" fill="${palette.blue}"/>
  <path d="M494 204c18 12 24 22 12 29-18 0-30-8-32-25z" fill="${palette.blue}"/>
  <path d="M332 200h136" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".54"/>
</g>
<path d="M350 142c24 22 76 22 100 0" fill="none" stroke="#effbff" stroke-width="12" stroke-linecap="round"/>
<g fill="${palette.white}" opacity=".75">
  <circle cx="350" cy="174" r="8"/>
  <circle cx="400" cy="154" r="8"/>
  <circle cx="450" cy="174" r="8"/>
</g>`,
    sleep_cap: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M310 194c20-84 76-130 156-144 4 66-30 120-94 172z" fill="${palette.pink}"/>
  <circle cx="478" cy="58" r="28" fill="#fff4bc"/>
  <path d="M280 194h240c24 0 42 12 42 22 0 15-58 25-162 25s-162-10-162-25c0-10 18-22 42-22z" fill="${palette.pinkLight}"/>
  <path d="M336 196c36 14 92 14 128 0" fill="none" stroke="${palette.white}" stroke-width="8" opacity=".45"/>
</g>
<circle cx="358" cy="172" r="9" fill="#fff4bc"/>
<circle cx="420" cy="138" r="8" fill="#fff4bc"/>
<path d="${heartPath(394, 184, 12)}" fill="${palette.white}" opacity=".68"/>`,
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
  <path d="M348 630h104" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".72"/>
</g>
<circle cx="400" cy="465" r="18" fill="#ff9db0"/>
<path d="${heartPath(444, 536, 14)}" fill="${palette.pink}" opacity=".8"/>
<g stroke="${palette.outline}" stroke-width="6" stroke-linecap="round" opacity=".28">
  <path d="M350 450l-22 22"/>
  <path d="M450 450l22 22"/>
</g>`,
    park_hoodie: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M320 432c10-32 50-50 80-50s70 18 80 50z" fill="#a7e6b6"/>
  <path d="M298 444c40-54 164-54 204 0l42 94-66 32-18-44v188H340V526l-18 44-66-32z" fill="${palette.green}"/>
  <path d="M400 444v264" fill="none" stroke-linecap="round"/>
  <path d="M350 610c28 18 72 18 100 0v52c-30 22-70 22-100 0z" fill="${palette.greenLight}"/>
  <path d="M338 484c22 16 102 16 124 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".38"/>
</g>
<circle cx="378" cy="476" r="8" fill="${palette.cream}"/>
<circle cx="422" cy="476" r="8" fill="${palette.cream}"/>
<path d="M362 636h76" stroke="${palette.white}" stroke-width="7" stroke-linecap="round" opacity=".55"/>
<g fill="${palette.cream}" opacity=".78">
  <circle cx="342" cy="536" r="7"/>
  <circle cx="458" cy="536" r="7"/>
</g>`,
    rain_coat: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M302 410c38-34 158-34 196 0l42 96-70 34-15-42 36 206H309l36-206-15 42-70-34z" fill="${palette.yellow}"/>
  <path d="M330 414l70 58 70-58" fill="${palette.yellowLight}"/>
  <path d="M400 470v218" fill="none" stroke-linecap="round"/>
  <path d="M336 452c34 22 94 22 128 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".5"/>
</g>
<circle cx="400" cy="526" r="10" fill="#fff8cf"/>
<circle cx="400" cy="576" r="10" fill="#fff8cf"/>
<circle cx="400" cy="626" r="10" fill="#fff8cf"/>
<g fill="${palette.blue}" opacity=".48">
  <path d="M346 540c10 17 16 28 16 38a16 16 0 1 1-32 0c0-10 6-21 16-38z"/>
  <path d="M454 610c9 15 14 25 14 34a14 14 0 1 1-28 0c0-9 5-19 14-34z"/>
</g>`,
    pajamas: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M300 414c38-38 162-38 200 0l48 86-66 36-24-42v192H342V494l-24 42-66-36z" fill="#9fe7ff"/>
  <path d="M340 682h120l32 112H308z" fill="#9fe7ff"/>
  <path d="M400 416v368" fill="none" stroke-linecap="round"/>
  <path d="M334 450c38 24 94 24 132 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".45"/>
</g>
<g fill="#fff4a7">
  <path d="${starPath(360, 495, 30, 13)}"/>
  <path d="${starPath(450, 579, 26, 11)}"/>
  <path d="${starPath(356, 651, 22, 9)}"/>
</g>
<path d="${heartPath(444, 690, 13)}" fill="${palette.pink}" opacity=".72"/>
<g fill="${palette.white}" opacity=".8">
  <circle cx="416" cy="492" r="7"/>
  <circle cx="416" cy="542" r="7"/>
  <circle cx="416" cy="592" r="7"/>
</g>`,
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
<ellipse cx="356" cy="780" rx="34" ry="10" fill="${palette.white}" opacity=".22"/>
<ellipse cx="456" cy="780" rx="34" ry="10" fill="${palette.white}" opacity=".22"/>`,
    sneakers: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M294 756h104c24 0 44 20 44 44v22H278v-28c0-22 8-38 16-38z" fill="#f36f5f"/>
  <path d="M402 756h104c8 0 16 16 16 38v28H358v-22c0-24 20-44 44-44z" fill="#f36f5f"/>
  <path d="M286 820h154" stroke="${palette.white}" stroke-linecap="round"/>
  <path d="M360 820h154" stroke="${palette.white}" stroke-linecap="round"/>
</g>
<path d="M328 786h64M408 786h64" stroke="${palette.white}" stroke-width="10" stroke-linecap="round"/>
<path d="M336 800l34-24M416 800l34-24" stroke="${palette.cream}" stroke-width="6" stroke-linecap="round" opacity=".72"/>`,
    rain_boots: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <path d="M302 696h96v126H282v-34c0-20 20-36 42-36h-22z" fill="${palette.yellow}"/>
  <path d="M402 696h96v56h-22c22 0 42 16 42 36v34H402z" fill="${palette.yellow}"/>
  <path d="M304 720h92M404 720h92" stroke="#fff8cf" stroke-linecap="round"/>
  <path d="M304 748h92M404 748h92" stroke="${palette.orange}" stroke-width="8" stroke-linecap="round" opacity=".55"/>
</g>
<g fill="${palette.blue}" opacity=".56">
  <path d="M342 770c8 13 12 22 12 30a12 12 0 1 1-24 0c0-8 4-17 12-30z"/>
  <path d="M456 770c8 13 12 22 12 30a12 12 0 1 1-24 0c0-8 4-17 12-30z"/>
</g>`,
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
<path d="${heartPath(350, 792, 10)}" fill="${palette.pink}" opacity=".7"/>
<path d="${heartPath(450, 792, 10)}" fill="${palette.pink}" opacity=".7"/>`,
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
  <path d="M278 462c20 16 58 16 78 0" fill="none" stroke="${palette.white}" stroke-width="8" stroke-linecap="round" opacity=".42"/>
</g>
<path d="M292 642h50" stroke="${palette.cream}" stroke-width="7" stroke-linecap="round"/>
<g fill="${palette.cream}" opacity=".75">
  <circle cx="292" cy="512" r="7"/>
  <circle cx="342" cy="512" r="7"/>
</g>`,
    umbrella: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round">
  <path d="M540 198c0-72 54-118 120-118s120 46 120 118z" fill="${palette.blue}"/>
  <path d="M540 198c20 26 40 26 60 0 20 26 40 26 60 0 20 26 40 26 60 0 20 26 40 26 60 0" fill="none"/>
  <path d="M660 198l-106 408" fill="none"/>
  <path d="M554 606c-8 38-44 36-46 0" fill="none"/>
  <path d="M584 126c34-28 116-28 150 0" fill="none" stroke="${palette.white}" stroke-width="9" opacity=".42"/>
</g>
<g fill="${palette.white}">
  <circle cx="580" cy="170" r="11"/>
  <circle cx="660" cy="146" r="10"/>
  <circle cx="740" cy="170" r="11"/>
</g>
<path d="${heartPath(704, 144, 13)}" fill="${palette.pink}" opacity=".72"/>`,
    plush: `
<g stroke="${palette.outline}" stroke-width="12" stroke-linejoin="round">
  <circle cx="548" cy="496" r="76" fill="${palette.plush}"/>
  <circle cx="492" cy="438" r="28" fill="${palette.plush}"/>
  <circle cx="604" cy="438" r="28" fill="${palette.plush}"/>
  <ellipse cx="548" cy="628" rx="78" ry="92" fill="${palette.plush}"/>
  <path d="M490 610c-48 18-70 54-55 88 42-3 72-30 89-76z" fill="${palette.plushLight}"/>
  <path d="M606 610c48 18 70 54 55 88-42-3-72-30-89-76z" fill="${palette.plushLight}"/>
  <path d="M500 700c-35 35-34 66 4 82 31-12 46-37 44-76z" fill="${palette.plushLight}"/>
  <path d="M596 700c35 35 34 66-4 82-31-12-46-37-44-76z" fill="${palette.plushLight}"/>
  <path d="M516 590c20 20 44 20 64 0" fill="none" stroke="${palette.plushLight}" stroke-width="9"/>
</g>
<circle cx="522" cy="500" r="9" fill="${palette.eye}"/>
<circle cx="574" cy="500" r="9" fill="${palette.eye}"/>
<circle cx="519" cy="497" r="3" fill="${palette.white}"/>
<circle cx="571" cy="497" r="3" fill="${palette.white}"/>
<ellipse cx="548" cy="528" rx="23" ry="16" fill="#f2c79b"/>
<path d="M532 546c10 12 22 12 32 0" fill="none" stroke="${palette.eye}" stroke-width="8" stroke-linecap="round"/>
<path d="${heartPath(548, 666, 14)}" fill="${palette.pink}" opacity=".58"/>`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`items/${id}`, svgString);
  return svgString;
}

function buildBackground(id) {
  const spec = assetSpec.backgrounds[id];
  const bodies = {
    park: `
<rect width="800" height="1000" fill="#bfefff"/>
<circle cx="675" cy="118" r="62" fill="#ffe176"/>
<circle cx="675" cy="118" r="88" fill="#ffe176" opacity=".2"/>
<path d="M0 640c130-88 220-80 352-4 150-84 284-92 448 6v358H0z" fill="#80d995"/>
<path d="M0 724c110-58 236-52 362 18 122-54 276-52 438 4v254H0z" fill="#63c981"/>
<path d="M348 720c44 30 72 96 84 280H260c22-132 48-216 88-280z" fill="#f7d690" opacity=".62"/>
<path d="M484 490h80v214h-80z" fill="#ffbd6f" stroke="${palette.outline}" stroke-width="10" stroke-linejoin="round"/>
<path d="M540 516h172l-36 70H540z" fill="#7dc8ff" stroke="${palette.outline}" stroke-width="10" stroke-linejoin="round"/>
<path d="M674 586c-38 68-72 106-140 140" fill="none" stroke="${palette.outline}" stroke-width="10" stroke-linecap="round"/>
<path d="M88 190c38-34 82-34 120 0 34-24 76-21 106 10" fill="none" stroke="${palette.white}" stroke-width="28" stroke-linecap="round"/>
<g fill="#ffb8d1" opacity=".78">
  <circle cx="112" cy="746" r="9"/>
  <circle cx="160" cy="714" r="8"/>
  <circle cx="666" cy="760" r="10"/>
</g>
<g stroke="${palette.outline}" stroke-width="5" stroke-linecap="round" opacity=".34">
  <path d="M112 758v28"/>
  <path d="M160 724v24"/>
  <path d="M666 772v28"/>
</g>`,
    rain: `
<rect width="800" height="1000" fill="#b9d7e8"/>
<path d="M0 0h800v580c-160 55-294 44-414-18-130 56-258 56-386 0z" fill="#9fb6c5"/>
<path d="M60 230c58-54 132-54 190 0 48-34 116-30 160 12 54-42 124-34 168 18" fill="none" stroke="#eef7ff" stroke-width="42" stroke-linecap="round" opacity=".82"/>
<g fill="#65b7ef" opacity=".72">
  <path d="M154 330c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
  <path d="M324 282c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
  <path d="M498 344c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
  <path d="M660 286c18 30 28 50 28 68a28 28 0 1 1-56 0c0-18 10-38 28-68z"/>
</g>
<rect y="624" width="800" height="376" fill="#8ad0ad"/>
<ellipse cx="250" cy="780" rx="160" ry="44" fill="#66bde8" opacity=".7"/>
<ellipse cx="570" cy="704" rx="98" ry="28" fill="#66bde8" opacity=".58"/>
<ellipse cx="250" cy="770" rx="92" ry="18" fill="${palette.white}" opacity=".22"/>
<ellipse cx="570" cy="696" rx="56" ry="11" fill="${palette.white}" opacity=".2"/>
<path d="M0 642c112 28 220 28 326-4 146 42 304 42 474 0" fill="none" stroke="${palette.white}" stroke-width="10" opacity=".2"/>`,
    sleep: `
<rect width="800" height="1000" fill="#dcd9ff"/>
<rect y="620" width="800" height="380" fill="#ffe4ef"/>
<path d="M0 620h800" stroke="${palette.outline}" stroke-width="8" opacity=".22"/>
<path d="M610 92c-50 22-70 82-43 130 26 48 86 65 132 40-20 48-78 80-136 67-72-16-116-88-100-160 12-52 52-88 102-101 17-4 35-3 45 24z" fill="#fff0a6"/>
<g fill="#fff4a7">
  <path d="${starPath(174, 190, 43, 19)}"/>
  <path d="${starPath(314, 267, 32, 14)}"/>
  <path d="${starPath(684, 418, 39, 17)}"/>
</g>
<path d="${heartPath(244, 388, 22)}" fill="${palette.pink}" opacity=".42"/>
<rect x="84" y="604" width="632" height="122" rx="46" fill="${palette.white}" stroke="${palette.outline}" stroke-width="10" opacity=".55"/>
<rect x="124" y="560" width="180" height="110" rx="34" fill="#bfefff" stroke="${palette.outline}" stroke-width="10" opacity=".8"/>
<path d="M130 650c118 38 314 38 568 0" fill="none" stroke="${palette.white}" stroke-width="12" opacity=".42"/>`,
  };
  const svgString = svg(spec.bounds, bodies[id]);
  safeZoneCheck(`backgrounds/${id}`, svgString);
  return svgString;
}

function buildOverlay(id) {
  const spec = assetSpec.overlays[id];
  const bodies = {
    park_birds: `
<g fill="none" stroke="${palette.outline}" stroke-width="12" stroke-linecap="round" stroke-linejoin="round" opacity=".74">
  <path d="M170 238c24-32 54-32 78 0 24-32 54-32 78 0"/>
  <path d="M464 176c20-26 44-26 64 0 20-26 44-26 64 0"/>
  <path d="M548 292c18-22 40-22 58 0 18-22 40-22 58 0"/>
</g>
<g fill="${palette.cream}" opacity=".78">
  <circle cx="144" cy="304" r="12"/>
  <circle cx="624" cy="126" r="10"/>
  <path d="${starPath(382, 142, 19, 8)}"/>
</g>`,
    rain_drops: `
<g fill="#65b7ef" opacity=".58">
  <path d="M94 110c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M222 228c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M384 124c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M520 262c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M682 142c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M136 420c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
  <path d="M640 448c16 27 25 45 25 61a25 25 0 1 1-50 0c0-16 9-34 25-61z"/>
</g>
<g fill="${palette.white}" opacity=".34">
  <ellipse cx="94" cy="162" rx="7" ry="12"/>
  <ellipse cx="384" cy="176" rx="7" ry="12"/>
  <ellipse cx="640" cy="500" rx="7" ry="12"/>
</g>`,
    sleep_stars: `
<g fill="#fff4a7" opacity=".82">
  <path d="${starPath(112, 288, 43, 19)}"/>
  <path d="${starPath(246, 139, 32, 14)}"/>
  <path d="${starPath(548, 212, 43, 19)}"/>
  <path d="${starPath(688, 375, 32, 14)}"/>
  <path d="${starPath(166, 513, 32, 14)}"/>
</g>
<g fill="${palette.pink}" opacity=".42">
  <path d="${heartPath(348, 336, 18)}"/>
  <path d="${heartPath(620, 514, 16)}"/>
</g>`,
    confetti: `
<g opacity=".86">
  <rect x="104" y="118" width="42" height="18" rx="8" fill="#ff8aa0" transform="rotate(20 125 127)"/>
  <rect x="232" y="210" width="20" height="48" rx="8" fill="#ffe176" transform="rotate(-24 242 234)"/>
  <rect x="648" y="158" width="44" height="18" rx="8" fill="#7bdc96" transform="rotate(-18 670 167)"/>
  <rect x="568" y="304" width="20" height="48" rx="8" fill="#9fe7ff" transform="rotate(32 578 328)"/>
  <rect x="116" y="462" width="44" height="18" rx="8" fill="#ff9a65" transform="rotate(-30 138 471)"/>
  <rect x="674" y="520" width="20" height="48" rx="8" fill="#ff8aa0" transform="rotate(24 684 544)"/>
  <circle cx="206" cy="338" r="16" fill="#7bdc96"/>
  <circle cx="594" cy="438" r="14" fill="#ffe176"/>
  <circle cx="384" cy="126" r="12" fill="#9fe7ff"/>
  <path d="${starPath(400, 290, 43, 19)}" fill="#fff6c8"/>
  <path d="${heartPath(506, 188, 18)}" fill="${palette.pink}"/>
  <path d="${heartPath(296, 430, 16)}" fill="${palette.blueLight}"/>
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
