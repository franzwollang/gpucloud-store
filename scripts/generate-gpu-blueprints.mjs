/**
 * Generates the blueprint-style GPU thumbnails used by the availability
 * section into public/images/gpus/<familyId>.svg.
 *
 * All families share one canvas + primitive kit so the set stays visually
 * consistent; per-family configs vary form factor (SXM / PCIe / OAM /
 * consumer), die + memory layout, accent hue, and die-code label.
 *
 * Run: node scripts/generate-gpu-blueprints.mjs
 */

import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  'public',
  'images',
  'gpus'
);

const W = 320;
const H = 180;

/** Accent palettes; `line` for structure, `bright` for the die/highlights. */
const COOL_FILLS = { dieFill: '#0e2438', chipFill: '#0d1a2b', boardFill: '#0c1728', pkgFill: '#0b1524' };
const WARM_FILLS = { dieFill: '#2a1310', chipFill: '#1c0e0b', boardFill: '#160f10', pkgFill: '#150d0e' };

const PALETTES = {
  hopper: { line: '#3ba5e5', bright: '#7fd4ff', dim: '#1f3b57', ...COOL_FILLS },
  hopperHbm3e: { line: '#3fc4c0', bright: '#8ff0ea', dim: '#1c4644', ...COOL_FILLS },
  blackwell: { line: '#8f8bff', bright: '#c4c1ff', dim: '#35335f', ...COOL_FILLS },
  ampere: { line: '#4a8ae5', bright: '#9cc4ff', dim: '#22385c', ...COOL_FILLS },
  ada: { line: '#57b8a5', bright: '#a5eeda', dim: '#24473f', ...COOL_FILLS },
  consumer: { line: '#6fae4e', bright: '#b6e89a', dim: '#2c4525', ...COOL_FILLS },
  amd: { line: '#e2604a', bright: '#ffb199', dim: '#57271f', ...WARM_FILLS }
};

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function text(x, y, str, size, fill, opts = {}) {
  const anchor = opts.anchor ?? 'middle';
  const spacing = opts.spacing ? ` letter-spacing="${opts.spacing}"` : '';
  const weight = opts.bold ? ' font-weight="600"' : '';
  return `<text x="${x}" y="${y}" font-family="ui-monospace, Menlo, monospace" font-size="${size}" fill="${fill}" text-anchor="${anchor}"${spacing}${weight}>${esc(str)}</text>`;
}

function rect(x, y, w, h, opts = {}) {
  const parts = [`<rect x="${x}" y="${y}" width="${w}" height="${h}"`];
  if (opts.rx) parts.push(`rx="${opts.rx}"`);
  parts.push(`fill="${opts.fill ?? 'none'}"`);
  if (opts.stroke) {
    parts.push(`stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"`);
  }
  if (opts.dash) parts.push(`stroke-dasharray="${opts.dash}"`);
  if (opts.opacity) parts.push(`opacity="${opts.opacity}"`);
  return parts.join(' ') + '/>';
}

function circle(cx, cy, r, opts = {}) {
  const parts = [`<circle cx="${cx}" cy="${cy}" r="${r}"`];
  parts.push(`fill="${opts.fill ?? 'none'}"`);
  if (opts.stroke) {
    parts.push(`stroke="${opts.stroke}" stroke-width="${opts.sw ?? 1}"`);
  }
  if (opts.opacity) parts.push(`opacity="${opts.opacity}"`);
  return parts.join(' ') + '/>';
}

function line(x1, y1, x2, y2, stroke, opts = {}) {
  const dash = opts.dash ? ` stroke-dasharray="${opts.dash}"` : '';
  const op = opts.opacity ? ` opacity="${opts.opacity}"` : '';
  return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-width="${opts.sw ?? 1}"${dash}${op}/>`;
}

/** Corner mounting holes for module boards (SXM / OAM). */
function mountingHoles(x, y, w, h, inset, p) {
  return [
    [x + inset, y + inset],
    [x + w - inset, y + inset],
    [x + inset, y + h - inset],
    [x + w - inset, y + h - inset]
  ]
    .map(
      ([cx, cy]) =>
        circle(cx, cy, 4, { stroke: p.line, opacity: 0.8 }) +
        circle(cx, cy, 1.5, { fill: p.line, opacity: 0.8 })
    )
    .join('');
}

/** Hatched mezzanine connector strip. */
function connectorStrip(x, y, w, h, p) {
  const ticks = [];
  for (let tx = x + 3; tx < x + w - 2; tx += 4) {
    ticks.push(line(tx, y + 1.5, tx, y + h - 1.5, p.line, { opacity: 0.65 }));
  }
  return rect(x, y, w, h, { stroke: p.line, opacity: 0.8 }) + ticks.join('');
}

/** A single HBM stack: outlined rect with internal split lines. */
function hbmStack(x, y, w, h, p) {
  return (
    rect(x, y, w, h, { fill: p.chipFill, stroke: p.line, opacity: 0.95 }) +
    line(x + w / 3, y + 1, x + w / 3, y + h - 1, p.line, { opacity: 0.4 }) +
    line(x + (2 * w) / 3, y + 1, x + (2 * w) / 3, y + h - 1, p.line, {
      opacity: 0.4
    })
  );
}

/** Compute die area: filled rect with faint internal circuit grid. */
function die(x, y, w, h, label, p, labelSize = 9) {
  const inner = [];
  for (let i = 1; i < 4; i += 1) {
    inner.push(
      line(x + (w * i) / 4, y + 2, x + (w * i) / 4, y + h - 2, p.bright, {
        opacity: 0.16
      })
    );
    inner.push(
      line(x + 2, y + (h * i) / 4, x + w - 2, y + (h * i) / 4, p.bright, {
        opacity: 0.16
      })
    );
  }
  return (
    rect(x, y, w, h, {
      fill: p.dieFill,
      stroke: p.bright,
      sw: 1.2,
      rx: 1
    }) +
    inner.join('') +
    (label
      ? text(x + w / 2, y + h / 2 + labelSize * 0.36, label, labelSize, p.bright, {
          bold: true
        })
      : '')
  );
}

/** Small memory chip (GDDR). */
function memChip(x, y, w, h, p) {
  return rect(x, y, w, h, { fill: p.chipFill, stroke: p.line, opacity: 0.8 });
}

/** Dashed dimension line with end ticks. */
function dimLine(x1, x2, y, labelStr, p) {
  return (
    line(x1, y, x2, y, p.line, { dash: '3 3', opacity: 0.55 }) +
    line(x1, y - 3, x1, y + 3, p.line, { opacity: 0.55 }) +
    line(x2, y - 3, x2, y + 3, p.line, { opacity: 0.55 }) +
    (labelStr
      ? text((x1 + x2) / 2, y - 3, labelStr, 6, p.line, { spacing: '0.12em' })
      : '')
  );
}

/** Shared canvas: background, blueprint grid, frame, corner ticks. */
function wrap(id, p, body, formLabel) {
  const gridLines = [];
  for (let gx = 16; gx < W; gx += 16) {
    gridLines.push(line(gx, 0, gx, H, '#16283f', { opacity: 0.45 }));
  }
  for (let gy = 12; gy < H; gy += 16) {
    gridLines.push(line(0, gy, W, gy, '#16283f', { opacity: 0.45 }));
  }
  const tick = 7;
  const corners = [
    line(10, 10, 10 + tick, 10, p.line, { opacity: 0.9 }) +
      line(10, 10, 10, 10 + tick, p.line, { opacity: 0.9 }),
    line(W - 10 - tick, 10, W - 10, 10, p.line, { opacity: 0.9 }) +
      line(W - 10, 10, W - 10, 10 + tick, p.line, { opacity: 0.9 }),
    line(10, H - 10, 10 + tick, H - 10, p.line, { opacity: 0.9 }) +
      line(10, H - 10 - tick, 10, H - 10, p.line, { opacity: 0.9 }),
    line(W - 10 - tick, H - 10, W - 10, H - 10, p.line, { opacity: 0.9 }) +
      line(W - 10, H - 10 - tick, W - 10, H - 10, p.line, { opacity: 0.9 })
  ].join('');

  return `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
<defs>
<linearGradient id="${id}-bg" x1="0" y1="0" x2="1" y2="1">
<stop offset="0%" stop-color="#0c1626"/>
<stop offset="55%" stop-color="#0a1220"/>
<stop offset="100%" stop-color="#0b0f1e"/>
</linearGradient>
</defs>
<rect width="${W}" height="${H}" fill="url(#${id}-bg)"/>
${gridLines.join('')}
${corners}
${body}
${formLabel ? text(W - 14, H - 14, formLabel, 7, p.line, { anchor: 'end', spacing: '0.22em' }) : ''}
</svg>
`;
}

// ---------------------------------------------------------------------------
// Form-factor renderers
// ---------------------------------------------------------------------------

/**
 * SXM mezzanine module: tall board, corner holes, interposer with die(s)
 * flanked by HBM columns, dual connector strips at bottom.
 */
function sxm(p, { dieLabel, hbmPerSide, dualDie, memLabel }) {
  const bx = 94;
  const by = 14;
  const bw = 132;
  const bh = 144;
  const parts = [];

  parts.push(rect(bx, by, bw, bh, { rx: 8, fill: p.boardFill, stroke: p.line, sw: 1.4 }));
  parts.push(mountingHoles(bx, by, bw, bh, 11, p));

  // Interposer / package
  const pw = 96;
  const ph = 78;
  const px = bx + (bw - pw) / 2;
  const py = by + 26;
  parts.push(rect(px, py, pw, ph, { fill: p.pkgFill, stroke: p.line, opacity: 0.9 }));

  // HBM columns
  const hbmW = 15;
  const hbmH = Math.min(21, (ph - 8 - (hbmPerSide - 1) * 4) / hbmPerSide);
  const colStartY = py + (ph - (hbmPerSide * hbmH + (hbmPerSide - 1) * 4)) / 2;
  for (let i = 0; i < hbmPerSide; i += 1) {
    const y = colStartY + i * (hbmH + 4);
    parts.push(hbmStack(px + 5, y, hbmW, hbmH, p));
    parts.push(hbmStack(px + pw - 5 - hbmW, y, hbmW, hbmH, p));
  }

  // Die(s)
  if (dualDie) {
    const dw = 22;
    const dh = 52;
    const cx = px + pw / 2;
    parts.push(die(cx - dw - 2, py + (ph - dh) / 2, dw, dh, '', p));
    parts.push(die(cx + 2, py + (ph - dh) / 2, dw, dh, '', p));
    parts.push(line(cx, py + (ph - dh) / 2 + 3, cx, py + (ph + dh) / 2 - 3, p.bright, { dash: '2 2', opacity: 0.8 }));
    parts.push(
      text(cx, py + ph / 2 + 2.5, dieLabel, 7, p.bright, { bold: true })
    );
  } else {
    const ds = 46;
    parts.push(die(px + (pw - ds) / 2, py + (ph - ds) / 2, ds, ds, dieLabel, p, 8));
  }

  // Mezzanine connectors
  const cy = by + bh - 16;
  parts.push(connectorStrip(bx + 12, cy, 48, 9, p));
  parts.push(connectorStrip(bx + bw - 60, cy, 48, 9, p));

  // Memory annotation + dimension line
  parts.push(text(160, py - 6, memLabel, 6.5, p.line, { spacing: '0.14em' }));
  parts.push(dimLine(bx, bx + bw, by + bh + 9, '', p));

  return parts.join('\n');
}

/**
 * PCIe add-in card: bracket, PCB, gold-finger edge connector, package with
 * HBM columns or a GDDR ring, capacitor bank.
 */
function pcie(p, { dieLabel, hbm, memLabel, slim }) {
  const cardX = 66;
  const cardW = 212;
  const cardY = slim ? 56 : 42;
  const cardH = slim ? 68 : 94;
  const parts = [];

  // Bracket
  parts.push(rect(54, cardY - 8, 7, cardH + 16, { rx: 2, fill: p.boardFill, stroke: p.line, opacity: 0.9 }));
  parts.push(circle(57.5, cardY, 2, { stroke: p.line, opacity: 0.7 }));
  parts.push(circle(57.5, cardY + cardH, 2, { stroke: p.line, opacity: 0.7 }));

  // PCB
  parts.push(rect(cardX, cardY, cardW, cardH, { rx: 4, fill: p.boardFill, stroke: p.line, sw: 1.4 }));

  // Gold fingers (edge connector) below the card
  const edgeX = cardX + 24;
  const edgeW = 118;
  parts.push(rect(edgeX, cardY + cardH, edgeW, 8, { fill: p.pkgFill, stroke: p.line, opacity: 0.85 }));
  for (let tx = edgeX + 3; tx < edgeX + edgeW - 2; tx += 4) {
    parts.push(line(tx, cardY + cardH + 1.5, tx, cardY + cardH + 6.5, p.bright, { opacity: 0.5 }));
  }
  // Connector notch
  parts.push(line(edgeX + 14, cardY + cardH, edgeX + 14, cardY + cardH + 8, p.line, { sw: 1.5, opacity: 0.9 }));

  // Package
  const pcx = cardX + cardW * 0.46;
  const pcy = cardY + cardH / 2 - (slim ? 2 : 4);
  if (hbm) {
    const pw = 72;
    const ph = 56;
    const px = pcx - pw / 2;
    const py = pcy - ph / 2;
    parts.push(rect(px, py, pw, ph, { fill: p.pkgFill, stroke: p.line, opacity: 0.9 }));
    const hbmW = 12;
    const hbmH = 17;
    for (let i = 0; i < 2; i += 1) {
      const y = py + 8 + i * (hbmH + 6);
      parts.push(hbmStack(px + 4, y, hbmW, hbmH, p));
      parts.push(hbmStack(px + pw - 4 - hbmW, y, hbmW, hbmH, p));
    }
    parts.push(die(pcx - 17, pcy - 17, 34, 34, dieLabel, p, 7.5));
  } else {
    const dw = 40;
    const dh = 34;
    parts.push(die(pcx - dw / 2, pcy - dh / 2, dw, dh, dieLabel, p, 7.5));
    // GDDR ring
    const gw = 13;
    const gh = 9;
    const gapX = 4;
    const topY = pcy - dh / 2 - gh - 5;
    const botY = pcy + dh / 2 + 5;
    for (let i = 0; i < 3; i += 1) {
      const gx = pcx - (1.5 * gw + gapX) + i * (gw + gapX);
      parts.push(memChip(gx, topY, gw, gh, p));
      parts.push(memChip(gx, botY, gw, gh, p));
    }
    parts.push(memChip(pcx - dw / 2 - gh - 5, pcy - gw / 2, gh, gw, p));
    parts.push(memChip(pcx + dw / 2 + 5, pcy - gw / 2, gh, gw, p));
  }

  // Capacitor bank on the right
  const capX = cardX + cardW - 44;
  for (let r = 0; r < (slim ? 2 : 3); r += 1) {
    for (let c = 0; c < 4; c += 1) {
      parts.push(
        rect(capX + c * 8, pcy - 18 + r * 14, 4, 9, {
          fill: p.dim,
          stroke: p.line,
          opacity: 0.55
        })
      );
    }
  }

  parts.push(text(pcx, cardY + (slim ? 12 : 14), memLabel, 6.5, p.line, { spacing: '0.14em' }));
  parts.push(dimLine(cardX, cardX + cardW, cardY - 8, '', p));

  return parts.join('\n');
}

/**
 * Consumer card: shroud with two axial fans, small die callout between them.
 */
function consumer(p, { dieLabel, brand }) {
  const cardX = 58;
  const cardY = 40;
  const cardW = 222;
  const cardH = 100;
  const parts = [];

  parts.push(rect(cardX, cardY, cardW, cardH, { rx: 10, fill: p.boardFill, stroke: p.line, sw: 1.4 }));

  // Fans
  for (const cx of [cardX + 58, cardX + cardW - 58]) {
    const cy = cardY + cardH / 2;
    const r = 36;
    parts.push(circle(cx, cy, r, { stroke: p.line, sw: 1.3, fill: p.pkgFill }));
    parts.push(circle(cx, cy, 7, { stroke: p.bright, fill: p.dieFill }));
    for (let i = 0; i < 7; i += 1) {
      const a1 = (i / 7) * Math.PI * 2;
      const a2 = a1 + 0.85;
      const x1 = cx + Math.cos(a1) * 9;
      const y1 = cy + Math.sin(a1) * 9;
      const x2 = cx + Math.cos(a2) * (r - 4);
      const y2 = cy + Math.sin(a2) * (r - 4);
      const mx = cx + Math.cos((a1 + a2) / 2 + 0.12) * (r * 0.62);
      const my = cy + Math.sin((a1 + a2) / 2 + 0.12) * (r * 0.62);
      parts.push(
        `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${p.line}" stroke-width="1" fill="none" opacity="0.7"/>`
      );
    }
  }

  // Die callout between fans
  const midX = cardX + cardW / 2;
  parts.push(die(midX - 14, cardY + cardH / 2 - 14, 28, 28, '', p));
  parts.push(text(midX, cardY + cardH / 2 + 2.5, dieLabel, 6.5, p.bright, { bold: true }));
  parts.push(line(midX, cardY + cardH / 2 - 14, midX, cardY + 8, p.bright, { dash: '2 3', opacity: 0.5 }));

  parts.push(text(midX, cardY + cardH + 14, brand, 6.5, p.line, { spacing: '0.2em' }));
  parts.push(dimLine(cardX, cardX + cardW, cardY - 8, '', p));

  return parts.join('\n');
}

/**
 * AMD OAM module: near-square board, chiplet grid or dual GCD, HBM ring.
 */
function oam(p, { chiplets, dieLabel, memLabel }) {
  const bx = 88;
  const by = 14;
  const bw = 144;
  const bh = 144;
  const parts = [];

  parts.push(rect(bx, by, bw, bh, { rx: 8, fill: p.boardFill, stroke: p.line, sw: 1.4 }));
  parts.push(mountingHoles(bx, by, bw, bh, 11, p));

  const pw = 108;
  const ph = 82;
  const px = bx + (bw - pw) / 2;
  const py = by + 24;
  parts.push(rect(px, py, pw, ph, { fill: p.pkgFill, stroke: p.line, opacity: 0.9 }));

  const hbmW = 13;
  const hbmH = 16;
  for (let i = 0; i < 4; i += 1) {
    const y = py + 5 + i * (hbmH + 3.5);
    parts.push(hbmStack(px + 4, y, hbmW, hbmH, p));
    parts.push(hbmStack(px + pw - 4 - hbmW, y, hbmW, hbmH, p));
  }

  if (chiplets) {
    // MI300X: 2×4 XCD chiplet grid
    const cw = 16;
    const ch = 26;
    const gap = 3;
    const gridW = 4 * cw + 3 * gap;
    const gridH = 2 * ch + gap;
    const gx = px + (pw - gridW) / 2;
    const gy = py + (ph - gridH) / 2;
    for (let r = 0; r < 2; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        parts.push(die(gx + c * (cw + gap), gy + r * (ch + gap), cw, ch, '', p));
      }
    }
    parts.push(
      rect(gx - 3, gy - 3, gridW + 6, gridH + 6, { stroke: p.bright, dash: '3 2', opacity: 0.6 })
    );
  } else {
    // MI250: dual GCD
    const dw = 26;
    const dh = 58;
    const cx = px + pw / 2;
    parts.push(die(cx - dw - 3, py + (ph - dh) / 2, dw, dh, '', p));
    parts.push(die(cx + 3, py + (ph - dh) / 2, dw, dh, '', p));
    parts.push(line(cx, py + (ph - dh) / 2 + 4, cx, py + (ph + dh) / 2 - 4, p.bright, { dash: '2 2', opacity: 0.8 }));
  }

  parts.push(text(bx + bw / 2, py + ph / 2 + 2.5, dieLabel, 7, p.bright, { bold: true }));
  parts.push(text(160, py - 5, memLabel, 6.5, p.line, { spacing: '0.14em' }));

  const cy = by + bh - 15;
  parts.push(connectorStrip(bx + 12, cy, 52, 9, p));
  parts.push(connectorStrip(bx + bw - 64, cy, 52, 9, p));

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Family configs
// ---------------------------------------------------------------------------

const FAMILIES = {
  'h100-sxm': {
    palette: PALETTES.hopper,
    formLabel: 'SXM5',
    render: p => sxm(p, { dieLabel: 'GH100', hbmPerSide: 3, memLabel: '80GB HBM3' })
  },
  'h100-pcie': {
    palette: PALETTES.hopper,
    formLabel: 'PCIE GEN5',
    render: p => pcie(p, { dieLabel: 'GH100', hbm: true, memLabel: '80GB HBM3' })
  },
  h200: {
    palette: PALETTES.hopperHbm3e,
    formLabel: 'SXM5',
    render: p => sxm(p, { dieLabel: 'GH100', hbmPerSide: 3, memLabel: '141GB HBM3E' })
  },
  b200: {
    palette: PALETTES.blackwell,
    formLabel: 'SXM6',
    render: p => sxm(p, { dieLabel: 'GB100 ×2', hbmPerSide: 4, dualDie: true, memLabel: '180GB HBM3E' })
  },
  'a100-sxm': {
    palette: PALETTES.ampere,
    formLabel: 'SXM4',
    render: p => sxm(p, { dieLabel: 'GA100', hbmPerSide: 3, memLabel: '80GB HBM2E' })
  },
  'a100-pcie': {
    palette: PALETTES.ampere,
    formLabel: 'PCIE GEN4',
    render: p => pcie(p, { dieLabel: 'GA100', hbm: true, memLabel: '80GB HBM2E' })
  },
  l40s: {
    palette: PALETTES.ada,
    formLabel: 'PCIE GEN4',
    render: p => pcie(p, { dieLabel: 'AD102', hbm: false, memLabel: '48GB GDDR6' })
  },
  l40: {
    palette: PALETTES.ada,
    formLabel: 'PCIE GEN4',
    render: p => pcie(p, { dieLabel: 'AD102', hbm: false, memLabel: '48GB GDDR6' })
  },
  a10: {
    palette: PALETTES.ampere,
    formLabel: 'PCIE · 1-SLOT',
    render: p => pcie(p, { dieLabel: 'GA102', hbm: false, memLabel: '24GB GDDR6', slim: true })
  },
  'rtx-4090': {
    palette: PALETTES.consumer,
    formLabel: 'AIC · 3-SLOT',
    render: p => consumer(p, { dieLabel: 'AD102', brand: 'GEFORCE RTX 4090' })
  },
  'rtx-3090': {
    palette: PALETTES.consumer,
    formLabel: 'AIC · 3-SLOT',
    render: p => consumer(p, { dieLabel: 'GA102', brand: 'GEFORCE RTX 3090' })
  },
  mi300x: {
    palette: PALETTES.amd,
    formLabel: 'OAM',
    render: p => oam(p, { chiplets: true, dieLabel: 'XCD ×8', memLabel: '192GB HBM3' })
  },
  mi250: {
    palette: PALETTES.amd,
    formLabel: 'OAM',
    render: p => oam(p, { chiplets: false, dieLabel: 'GCD ×2', memLabel: '128GB HBM2E' })
  }
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [id, cfg] of Object.entries(FAMILIES)) {
  const svg = wrap(id, cfg.palette, cfg.render(cfg.palette), cfg.formLabel);
  writeFileSync(join(OUT_DIR, `${id}.svg`), svg);
  console.log(`wrote ${id}.svg`);
}
