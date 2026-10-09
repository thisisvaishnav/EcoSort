import * as THREE from 'three';

// Cache generated textures to conserve GPU memory
const textureCache = new Map<string, THREE.CanvasTexture>();

function getOrCreateCanvas(width: number, height: number): [HTMLCanvasElement, CanvasRenderingContext2D | null] {
  if (typeof document === 'undefined') {
    return [{} as HTMLCanvasElement, null];
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext ? canvas.getContext('2d') : null;
  return [canvas, ctx];
}

/**
 * Creates high-resolution procedural texture for the Milk Carton
 */
export function getMilkCartonTexture(): THREE.CanvasTexture {
  const cacheKey = 'milk_carton_tex';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const [canvas, ctx] = getOrCreateCanvas(512, 512);
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, dummy);
    return dummy;
  }

  // Background: Clean white carton paper
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 512);

  // Left half = Front panel (0 to 256)
  // Top sky blue bar
  ctx.fillStyle = '#3b82f6';
  ctx.fillRect(0, 0, 256, 30);

  // Bold "MILK" text
  ctx.fillStyle = '#1d4ed8';
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MILK', 128, 95);

  // Green grassy rolling hills at bottom
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(0, 420);
  ctx.bezierCurveTo(60, 390, 180, 440, 256, 410);
  ctx.lineTo(256, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.moveTo(0, 460);
  ctx.bezierCurveTo(90, 440, 160, 470, 256, 450);
  ctx.lineTo(256, 512);
  ctx.lineTo(0, 512);
  ctx.closePath();
  ctx.fill();

  // Cute Cow Face in center
  const cx = 128;
  const cy = 250;

  // Cow Ears
  ctx.fillStyle = '#475569';
  ctx.beginPath();
  ctx.ellipse(cx - 65, cy - 35, 22, 14, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(cx + 65, cy - 35, 22, 14, 0.4, 0, Math.PI * 2);
  ctx.fill();

  // Cow Head (White oval with brown patch)
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.ellipse(cx, cy, 62, 54, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineWidth = 5;
  ctx.strokeStyle = '#1e293b';
  ctx.stroke();

  // Brown eye patch
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.ellipse(cx + 25, cy - 15, 26, 26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Snout (Pink)
  ctx.fillStyle = '#fbcfe8';
  ctx.beginPath();
  ctx.ellipse(cx, cy + 24, 42, 22, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#f472b6';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Nostrils
  ctx.fillStyle = '#be185d';
  ctx.beginPath();
  ctx.arc(cx - 15, cy + 24, 4, 0, Math.PI * 2);
  ctx.arc(cx + 15, cy + 24, 4, 0, Math.PI * 2);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(cx - 24, cy - 8, 7, 0, Math.PI * 2);
  ctx.arc(cx + 24, cy - 8, 7, 0, Math.PI * 2);
  ctx.fill();
  // Eye sparkles
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(cx - 26, cy - 10, 2.5, 0, Math.PI * 2);
  ctx.arc(cx + 22, cy - 10, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Right half = Side panel with barcode & nutrition lines (256 to 512)
  ctx.fillStyle = '#e2e8f0';
  ctx.fillRect(256, 0, 4, 512); // divider

  // Nutrition text lines
  ctx.fillStyle = '#64748b';
  for (let i = 0; i < 9; i++) {
    ctx.fillRect(285, 70 + i * 28, 180 - (i % 3) * 35, 8);
  }

  // Barcode blue container
  ctx.fillStyle = '#dbeafe';
  ctx.fillRect(285, 360, 180, 100);
  ctx.strokeStyle = '#3b82f6';
  ctx.lineWidth = 3;
  ctx.strokeRect(285, 360, 180, 100);

  // Barcode vertical lines
  ctx.fillStyle = '#1e3a8a';
  const barPattern = [4, 2, 6, 3, 2, 8, 3, 4, 2, 7, 3, 5, 2, 6, 4];
  let barX = 300;
  for (const w of barPattern) {
    ctx.fillRect(barX, 375, w, 68);
    barX += w + 6;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates high-resolution procedural texture for the Folded Newspaper
 */
export function getNewspaperTexture(): THREE.CanvasTexture {
  const cacheKey = 'newspaper_tex';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const [canvas, ctx] = getOrCreateCanvas(512, 512);
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, dummy);
    return dummy;
  }

  // Newsprint cream-white paper
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(0, 0, 512, 512);

  // Outer border & crease line
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 4;
  ctx.strokeRect(10, 10, 492, 492);

  // Top header banner
  ctx.fillStyle = '#0f172a';
  ctx.font = '900 68px serif';
  ctx.textAlign = 'center';
  ctx.fillText('NEWS', 256, 85);

  // Double horizontal rule
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#0f172a';
  ctx.beginPath();
  ctx.moveTo(30, 105);
  ctx.lineTo(482, 105);
  ctx.moveTo(30, 114);
  ctx.lineTo(482, 114);
  ctx.stroke();

  // Full-color landscape picture box (like screenshot)
  const picX = 40;
  const picY = 135;
  const picW = 432;
  const picH = 190;

  // Sky
  const skyGrad = ctx.createLinearGradient(picX, picY, picX, picY + picH);
  skyGrad.addColorStop(0, '#38bdf8');
  skyGrad.addColorStop(0.7, '#bae6fd');
  skyGrad.addColorStop(1, '#86efac');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(picX, picY, picW, picH);

  // City Skyline in background
  ctx.fillStyle = '#0284c7';
  ctx.fillRect(picX + 90, picY + 70, 40, 60);
  ctx.fillRect(picX + 140, picY + 50, 50, 80);
  ctx.fillRect(picX + 200, picY + 65, 45, 65);
  ctx.fillRect(picX + 255, picY + 80, 35, 50);

  // Green park trees in foreground
  ctx.fillStyle = '#15803d';
  ctx.beginPath();
  ctx.arc(picX + 50, picY + 145, 45, 0, Math.PI * 2);
  ctx.arc(picX + 120, picY + 155, 40, 0, Math.PI * 2);
  ctx.arc(picX + 310, picY + 150, 48, 0, Math.PI * 2);
  ctx.arc(picX + 380, picY + 145, 45, 0, Math.PI * 2);
  ctx.fill();

  // Picture frame
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 3;
  ctx.strokeRect(picX, picY, picW, picH);

  // Headline under photo
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(40, 345, 432, 16);

  // 3-column text lines underneath
  ctx.fillStyle = '#475569';
  const colWidth = 132;
  const gap = 18;
  for (let c = 0; c < 3; c++) {
    const startX = 40 + c * (colWidth + gap);
    for (let line = 0; line < 5; line++) {
      ctx.fillRect(startX, 380 + line * 20, colWidth - (line === 4 ? 40 : 0), 7);
    }
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates high-resolution procedural texture for the Glossy Magazine
 */
export function getMagazineTexture(): THREE.CanvasTexture {
  const cacheKey = 'magazine_tex';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const [canvas, ctx] = getOrCreateCanvas(512, 512);
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, dummy);
    return dummy;
  }

  // Background sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, 512);
  skyGrad.addColorStop(0, '#60a5fa');
  skyGrad.addColorStop(0.5, '#93c5fd');
  skyGrad.addColorStop(1, '#bfdbfe');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, 512, 512);

  // Bold Red "MAGAZINE" Title Header
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(0, 0, 512, 95);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 58px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('MAGAZINE', 256, 72);

  // Yellow circular badges under header
  ctx.fillStyle = '#fbbf24';
  ctx.beginPath();
  ctx.arc(180, 130, 24, 0, Math.PI * 2);
  ctx.arc(330, 130, 24, 0, Math.PI * 2);
  ctx.fill();

  // Mountain range in middle
  ctx.fillStyle = '#3b82f6';
  ctx.beginPath();
  ctx.moveTo(80, 360);
  ctx.lineTo(256, 170); // Peak
  ctx.lineTo(432, 360);
  ctx.closePath();
  ctx.fill();

  // Mountain snowcap
  ctx.fillStyle = '#f8fafc';
  ctx.beginPath();
  ctx.moveTo(215, 230);
  ctx.lineTo(256, 170);
  ctx.lineTo(297, 230);
  ctx.lineTo(270, 250);
  ctx.lineTo(256, 235);
  ctx.lineTo(240, 250);
  ctx.closePath();
  ctx.fill();

  // Winding Blue River through green landscape
  ctx.fillStyle = '#22c55e';
  ctx.fillRect(0, 340, 512, 172);

  ctx.fillStyle = '#0284c7';
  ctx.beginPath();
  ctx.moveTo(256, 340);
  ctx.bezierCurveTo(230, 380, 340, 420, 280, 512);
  ctx.lineTo(360, 512);
  ctx.bezierCurveTo(400, 420, 290, 370, 300, 340);
  ctx.closePath();
  ctx.fill();

  // Pine trees on sides
  ctx.fillStyle = '#15803d';
  [
    [70, 300, 40],
    [130, 330, 48],
    [390, 290, 45],
    [440, 320, 55],
  ].forEach(([tx, ty, r]) => {
    ctx.beginPath();
    ctx.arc(tx, ty, r, 0, Math.PI * 2);
    ctx.fill();
  });

  // Yellow Callout Boxes (like screenshot)
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#f59e0b';
  ctx.lineWidth = 4;

  // Box 1 (top left)
  ctx.fillRect(40, 150, 150, 50);
  ctx.strokeRect(40, 150, 150, 50);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(52, 164, 126, 8);
  ctx.fillRect(52, 178, 90, 8);

  // Box 2 (bottom left)
  ctx.fillStyle = '#fef08a';
  ctx.fillRect(40, 410, 200, 60);
  ctx.strokeRect(40, 410, 200, 60);
  ctx.fillStyle = '#ef4444';
  ctx.fillRect(52, 426, 176, 10);
  ctx.fillRect(52, 444, 130, 10);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates high-resolution procedural texture for the Battery
 */
export function getBatteryTexture(): THREE.CanvasTexture {
  const cacheKey = 'battery_tex';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const [canvas, ctx] = getOrCreateCanvas(512, 512);
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, dummy);
    return dummy;
  }

  // Top 40% = Golden Yellow (#f59e0b)
  ctx.fillStyle = '#f59e0b';
  ctx.fillRect(0, 0, 512, 200);

  // Bottom 60% = Industrial Charcoal (#1e293b)
  ctx.fillStyle = '#1e293b';
  ctx.fillRect(0, 200, 512, 312);

  // Distinct "+" Sign on the golden band
  ctx.fillStyle = '#0f172a';
  // Horizontal bar of +
  ctx.fillRect(206, 80, 100, 28);
  // Vertical bar of +
  ctx.fillRect(242, 44, 28, 100);

  // Caution stripe border line between gold and black
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 194, 512, 12);

  // Scuff / rust marks along the bottom (like screenshot)
  ctx.fillStyle = '#92400e';
  ctx.beginPath();
  ctx.ellipse(140, 360, 45, 25, 0.3, 0, Math.PI * 2);
  ctx.ellipse(370, 420, 60, 30, -0.2, 0, Math.PI * 2);
  ctx.ellipse(260, 470, 35, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}

/**
 * Creates procedural label texture for Medicine Bottle (Red Cross)
 */
export function getMedicineLabelTexture(): THREE.CanvasTexture {
  const cacheKey = 'medicine_label_tex';
  if (textureCache.has(cacheKey)) {
    return textureCache.get(cacheKey)!;
  }

  const [canvas, ctx] = getOrCreateCanvas(512, 256);
  if (!ctx) {
    const dummy = new THREE.CanvasTexture(canvas);
    textureCache.set(cacheKey, dummy);
    return dummy;
  }

  // White pharmaceutical paper label
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, 512, 256);

  // Subtle border lines
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 4;
  ctx.strokeRect(8, 8, 496, 240);

  // Bold Red Medical Cross in center
  const cx = 256;
  const cy = 128;
  const crossW = 32;
  const crossL = 96;

  ctx.fillStyle = '#dc2626';
  // Horizontal bar
  ctx.fillRect(cx - crossL / 2, cy - crossW / 2, crossL, crossW);
  // Vertical bar
  ctx.fillRect(cx - crossW / 2, cy - crossL / 2, crossW, crossL);

  // Small prescription details text lines on sides
  ctx.fillStyle = '#94a3b8';
  for (let i = 0; i < 4; i++) {
    ctx.fillRect(40, 60 + i * 36, 100, 8);
    ctx.fillRect(370, 60 + i * 36, 100, 8);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  textureCache.set(cacheKey, texture);
  return texture;
}
