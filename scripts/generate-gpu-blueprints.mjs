/**
 * Generates the blueprint-style GPU thumbnails used by the availability
 * section into public/images/gpus/<familyId>.svg.
 *
 * All families share one canvas + primitive kit so the set stays visually
 * consistent; per-family configs vary form factor (SXM / PCIe / OAM /
 * consumer), die + memory layout, accent hue, and die-code label.
 *
 * Layout cues track real package topology at schematic fidelity:
 * - SXM: CoWoS die + HBM ring, VRM inductor field, gen-specific connectors
 * - B200: larger dual-die interposer with perimeter HBM
 * - PCIe pro: shrouded FHFL silhouette (not bare die-on-PCB)
 * - MI300X: XCD grid over IOD band + perimeter HBM
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

const COOL_FILLS = {
  dieFill: '#0e2438',
  chipFill: '#0d1a2b',
  boardFill: '#0c1728',
  pkgFill: '#0b1524'
};
const WARM_FILLS = {
  dieFill: '#2a1310',
  chipFill: '#1c0e0b',
  boardFill: '#160f10',
  pkgFill: '#150d0e'
};

const PALETTES = {
  hopper: { line: '#3ba5e5', bright: '#7fd4ff', dim: '#1f3b57', ...COOL_FILLS },
  hopperHbm3e: {
    line: '#3fc4c0',
    bright: '#8ff0ea',
    dim: '#1c4644',
    ...COOL_FILLS
  },
  blackwell: {
    line: '#8f8bff',
    bright: '#c4c1ff',
    dim: '#35335f',
    ...COOL_FILLS
  },
  ampere: { line: '#4a8ae5', bright: '#9cc4ff', dim: '#22385c', ...COOL_FILLS },
  ada: { line: '#57b8a5', bright: '#a5eeda', dim: '#24473f', ...COOL_FILLS },
  consumer: {
    line: '#6fae4e',
    bright: '#b6e89a',
    dim: '#2c4525',
    ...COOL_FILLS
  },
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

function mountingHoles(x, y, w, h, inset, p) {
  return [
    [x + inset, y + inset],
    [x + w - inset, y + inset],
    [x + inset, y + h - inset],
    [x + w - inset, y + h - inset]
  ]
    .map(
      ([cx, cy]) =>
        circle(cx, cy, 3.5, { stroke: p.line, opacity: 0.75 }) +
        circle(cx, cy, 1.3, { fill: p.line, opacity: 0.75 })
    )
    .join('');
}

function connectorStrip(x, y, w, h, p) {
  const ticks = [];
  for (let tx = x + 3; tx < x + w - 2; tx += 3.5) {
    ticks.push(line(tx, y + 1.5, tx, y + h - 1.5, p.line, { opacity: 0.65 }));
  }
  return rect(x, y, w, h, { stroke: p.line, opacity: 0.85 }) + ticks.join('');
}

function hbmStack(x, y, w, h, p, { thick = false, ghost = false } = {}) {
  if (ghost) {
    return (
      rect(x, y, w, h, {
        fill: 'none',
        stroke: p.line,
        dash: '2 2',
        opacity: 0.4
      }) +
      line(x + w / 3, y + 1, x + w / 3, y + h - 1, p.line, { opacity: 0.2 }) +
      line(x + (2 * w) / 3, y + 1, x + (2 * w) / 3, y + h - 1, p.line, {
        opacity: 0.2
      })
    );
  }
  const body =
    rect(x, y, w, h, { fill: p.chipFill, stroke: p.line, opacity: 0.95 }) +
    line(x + w / 3, y + 1, x + w / 3, y + h - 1, p.line, { opacity: 0.4 }) +
    line(x + (2 * w) / 3, y + 1, x + (2 * w) / 3, y + h - 1, p.line, {
      opacity: 0.4
    });
  if (!thick) return body;
  // HBM3e cue: slightly taller stack with an extra band
  return (
    body +
    rect(x + 1, y + h - 3.5, w - 2, 2, {
      fill: p.bright,
      opacity: 0.35
    })
  );
}

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
      ? text(
          x + w / 2,
          y + h / 2 + labelSize * 0.36,
          label,
          labelSize,
          p.bright,
          { bold: true }
        )
      : '')
  );
}

function memChip(x, y, w, h, p) {
  return rect(x, y, w, h, { fill: p.chipFill, stroke: p.line, opacity: 0.8 });
}

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

/** Dense VRM inductor field — the signature of real SXM modules. */
function vrmField(x, y, cols, rows, p) {
  const parts = [];
  const cellW = 7;
  const cellH = 9;
  const gapX = 2.5;
  const gapY = 2.5;
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const ix = x + c * (cellW + gapX);
      const iy = y + r * (cellH + gapY);
      parts.push(
        rect(ix, iy, cellW, cellH, {
          rx: 1,
          fill: p.dim,
          stroke: p.line,
          opacity: 0.55
        })
      );
      parts.push(
        line(ix + 1.5, iy + cellH / 2, ix + cellW - 1.5, iy + cellH / 2, p.line, {
          opacity: 0.35
        })
      );
    }
  }
  return parts.join('');
}

/**
 * Place `count` HBM stacks around a package rect.
 * count=6 → corner ring (TL/TR/ML/MR/BL/BR); count=8 → denser perimeter.
 * `ghostIndex` marks one stack inactive (H100 5+1 yield spare).
 */
function hbmRing(
  px,
  py,
  pw,
  ph,
  count,
  p,
  { thick = false, hbmW = 14, hbmH = 12, ghostIndex = -1 } = {}
) {
  const inset = 3;
  const ix = px + inset;
  const iy = py + inset;
  const iw = pw - inset * 2;
  const ih = ph - inset * 2;
  const positions = [];

  if (count === 6) {
    positions.push(
      [ix, iy],
      [ix + iw - hbmW, iy],
      [ix, iy + (ih - hbmH) / 2],
      [ix + iw - hbmW, iy + (ih - hbmH) / 2],
      [ix, iy + ih - hbmH],
      [ix + iw - hbmW, iy + ih - hbmH]
    );
  } else if (count === 8) {
    // Corner-weighted: 2× top/bot at corners + 2 per side (clear center)
    const midY1 = iy + (ih - 2 * hbmH) / 3;
    const midY2 = iy + (2 * (ih - 2 * hbmH)) / 3 + hbmH;
    positions.push(
      [ix, iy],
      [ix + iw - hbmW, iy],
      [ix, midY1],
      [ix + iw - hbmW, midY1],
      [ix, midY2],
      [ix + iw - hbmW, midY2],
      [ix, iy + ih - hbmH],
      [ix + iw - hbmW, iy + ih - hbmH]
    );
  } else {
    // Fallback: top then bottom
    const nTop = Math.ceil(count / 2);
    const nBot = count - nTop;
    const place = (n, y) => {
      const total = n * hbmW + (n - 1) * 2.5;
      let x = ix + (iw - total) / 2;
      for (let i = 0; i < n; i += 1) {
        positions.push([x, y]);
        x += hbmW + 2.5;
      }
    };
    place(nTop, iy);
    place(nBot, iy + ih - hbmH);
  }

  return positions
    .map(([x, y], i) =>
      hbmStack(x, y, hbmW, hbmH, p, {
        thick,
        ghost: i === ghostIndex
      })
    )
    .join('');
}

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
 * SXM mezzanine: landscape board, VRM field, CoWoS package with HBM ring,
 * gen-specific mezz connectors (SXM5 = short+long, SXM4 = equal pair).
 */
function sxm(
  p,
  {
    dieLabel,
    hbmCount = 6,
    dualDie = false,
    memLabel,
    connector = 'sxm5', // 'sxm5' | 'sxm4' | 'sxm6'
    thickHbm = false,
    large = false,
    ghostIndex = -1
  }
) {
  const bw = large ? 168 : 150;
  const bh = large ? 132 : 124;
  const bx = (W - bw) / 2;
  const by = 18;
  const parts = [];

  parts.push(
    rect(bx, by, bw, bh, {
      rx: 7,
      fill: p.boardFill,
      stroke: p.line,
      sw: 1.4
    })
  );
  parts.push(mountingHoles(bx, by, bw, bh, 10, p));

  // VRM inductor banks flanking the package (real SXM signature)
  const vrmCols = large ? 3 : 2;
  const vrmRows = large ? 5 : 4;
  parts.push(vrmField(bx + 10, by + 28, vrmCols, vrmRows, p));
  parts.push(
    vrmField(
      bx + bw - 10 - vrmCols * 9.5,
      by + 28,
      vrmCols,
      vrmRows,
      p
    )
  );
  // Top VRM strip
  parts.push(vrmField(bx + 36, by + 10, large ? 10 : 8, 1, p));

  // CoWoS package
  const pw = large ? 100 : 78;
  const ph = large ? 72 : 62;
  const px = bx + (bw - pw) / 2;
  const py = by + (bh - ph) / 2 - 4;
  parts.push(
    rect(px, py, pw, ph, { fill: p.pkgFill, stroke: p.line, opacity: 0.95 })
  );

  const hbmW = large ? 13 : 12;
  const hbmH = thickHbm ? 13 : 11;
  parts.push(
    hbmRing(px, py, pw, ph, hbmCount, p, {
      thick: thickHbm,
      hbmW,
      hbmH,
      ghostIndex
    })
  );

  // Die(s) in the clear center of the ring
  const diePad = hbmH + 6;
  if (dualDie) {
    const dw = (pw - diePad * 2 - 6) / 2;
    const dh = ph - diePad * 2;
    const dx = px + diePad;
    const dy = py + diePad;
    parts.push(die(dx, dy, dw, dh, '', p));
    parts.push(die(dx + dw + 6, dy, dw, dh, '', p));
    parts.push(
      line(
        dx + dw + 3,
        dy + 4,
        dx + dw + 3,
        dy + dh - 4,
        p.bright,
        { dash: '2 2', opacity: 0.85 }
      )
    );
    parts.push(
      text(px + pw / 2, py + ph / 2 + 2.5, dieLabel, 6.5, p.bright, {
        bold: true
      })
    );
  } else {
    const ds = Math.min(pw - diePad * 2, ph - diePad * 2);
    parts.push(
      die(
        px + (pw - ds) / 2,
        py + (ph - ds) / 2,
        ds,
        ds,
        dieLabel,
        p,
        7.5
      )
    );
  }

  // Mezzanine connectors
  const cy = by + bh - 14;
  if (connector === 'sxm5') {
    // Short + long (Hopper SXM5)
    parts.push(connectorStrip(bx + 14, cy, 36, 8, p));
    parts.push(connectorStrip(bx + bw - 14 - 58, cy, 58, 8, p));
  } else if (connector === 'sxm6') {
    // Wider pair for Blackwell
    parts.push(connectorStrip(bx + 12, cy, 52, 8, p));
    parts.push(connectorStrip(bx + bw - 12 - 64, cy, 64, 8, p));
  } else {
    // Equal long pair (SXM4)
    parts.push(connectorStrip(bx + 16, cy, 52, 8, p));
    parts.push(connectorStrip(bx + bw - 16 - 52, cy, 52, 8, p));
  }

  parts.push(
    text(bx + bw / 2, py - 5, memLabel, 6.5, p.line, { spacing: '0.12em' })
  );
  parts.push(dimLine(bx, bx + bw, by + bh + 8, '', p));

  return parts.join('\n');
}

/**
 * PCIe professional card: dual-slot (or slim) shrouded silhouette with
 * bracket, gold fingers, schematic package window, power connector cue.
 */
function pcie(
  p,
  {
    dieLabel,
    hbm = false,
    hbmCount = 6,
    memLabel,
    slim = false,
    dualSlot = true,
    ports = false,
    ghostIndex = -1
  }
) {
  const cardX = 58;
  const cardW = 220;
  const cardY = slim ? 52 : 38;
  const cardH = slim ? 62 : 88;
  const parts = [];

  // Dual-slot thickness cue (rear offset plate)
  if (dualSlot && !slim) {
    parts.push(
      rect(cardX + 4, cardY + 6, cardW, cardH, {
        rx: 5,
        fill: p.pkgFill,
        stroke: p.line,
        opacity: 0.45
      })
    );
  }

  // Bracket
  parts.push(
    rect(46, cardY - 6, 8, cardH + 14, {
      rx: 2,
      fill: p.boardFill,
      stroke: p.line,
      opacity: 0.9
    })
  );
  parts.push(circle(50, cardY + 2, 2, { stroke: p.line, opacity: 0.7 }));
  parts.push(
    circle(50, cardY + cardH - 2, 2, { stroke: p.line, opacity: 0.7 })
  );

  // Shroud body
  parts.push(
    rect(cardX, cardY, cardW, cardH, {
      rx: 5,
      fill: p.boardFill,
      stroke: p.line,
      sw: 1.4
    })
  );

  // Passive cooler vents (horizontal louvers)
  const ventX = cardX + 14;
  const ventW = cardW - 70;
  for (let i = 0; i < (slim ? 4 : 6); i += 1) {
    parts.push(
      line(
        ventX,
        cardY + 14 + i * 10,
        ventX + ventW,
        cardY + 14 + i * 10,
        p.line,
        { opacity: 0.35 }
      )
    );
  }

  // Schematic package window (dashed cutaway) — sized for thumbnail legibility
  const winW = hbm ? 68 : 44;
  const winH = hbm ? 48 : 32;
  const winX = cardX + 22;
  const winY = cardY + (cardH - winH) / 2;
  parts.push(
    rect(winX, winY, winW, winH, {
      stroke: p.bright,
      dash: '3 2',
      opacity: 0.7
    })
  );
  if (hbm) {
    parts.push(
      hbmRing(winX, winY, winW, winH, hbmCount, p, {
        hbmW: 10,
        hbmH: 9,
        ghostIndex
      })
    );
    const ds = 20;
    parts.push(
      die(
        winX + (winW - ds) / 2,
        winY + (winH - ds) / 2,
        ds,
        ds,
        dieLabel,
        p,
        5.5
      )
    );
  } else {
    // Compact GDDR edge chips (not a neat halo — board-edge style)
    parts.push(
      die(winX + 10, winY + 6, 24, 20, dieLabel, p, 5.5)
    );
    for (let i = 0; i < 3; i += 1) {
      parts.push(memChip(winX + winW + 6, winY + 4 + i * 9, 11, 7, p));
    }
    for (let i = 0; i < 2; i += 1) {
      parts.push(memChip(winX + 8 + i * 14, winY + winH + 4, 11, 7, p));
    }
  }

  // 16-pin / power connector cue on trailing edge
  parts.push(
    rect(cardX + cardW - 28, cardY + 12, 16, 22, {
      rx: 2,
      fill: p.pkgFill,
      stroke: p.line,
      opacity: 0.85
    })
  );
  for (let r = 0; r < 4; r += 1) {
    for (let c = 0; c < 2; c += 1) {
      parts.push(
        circle(
          cardX + cardW - 22 + c * 6,
          cardY + 17 + r * 4.5,
          1,
          { fill: p.line, opacity: 0.55 }
        )
      );
    }
  }

  // DisplayPort cluster (L40 / L40S)
  if (ports) {
    for (let i = 0; i < 4; i += 1) {
      parts.push(
        rect(cardX + cardW - 22, cardY + cardH - 28 + i * 6, 10, 4, {
          fill: p.dim,
          stroke: p.line,
          opacity: 0.7
        })
      );
    }
  }

  // Gold fingers
  const edgeX = cardX + 22;
  const edgeW = slim ? 100 : 130;
  parts.push(
    rect(edgeX, cardY + cardH, edgeW, 8, {
      fill: p.pkgFill,
      stroke: p.line,
      opacity: 0.85
    })
  );
  for (let tx = edgeX + 3; tx < edgeX + edgeW - 2; tx += 4) {
    parts.push(
      line(
        tx,
        cardY + cardH + 1.5,
        tx,
        cardY + cardH + 6.5,
        p.bright,
        { opacity: 0.5 }
      )
    );
  }
  parts.push(
    line(
      edgeX + 16,
      cardY + cardH,
      edgeX + 16,
      cardY + cardH + 8,
      p.line,
      { sw: 1.5, opacity: 0.9 }
    )
  );

  parts.push(
    text(cardX + cardW / 2, cardY + 11, memLabel, 6.5, p.line, {
      spacing: '0.12em'
    })
  );
  parts.push(dimLine(cardX, cardX + cardW, cardY - 8, '', p));

  return parts.join('\n');
}

/**
 * Consumer AIC: dual fans + 3-slot thickness cue; no fake die between fans.
 */
function consumer(p, { dieLabel, brand, tripleFan = false }) {
  const cardX = 52;
  const cardY = 36;
  const cardW = 228;
  const cardH = 96;
  const parts = [];

  // 3-slot depth plates
  parts.push(
    rect(cardX + 6, cardY + 8, cardW, cardH, {
      rx: 9,
      fill: p.pkgFill,
      stroke: p.line,
      opacity: 0.35
    })
  );
  parts.push(
    rect(cardX + 3, cardY + 4, cardW, cardH, {
      rx: 9,
      fill: p.pkgFill,
      stroke: p.line,
      opacity: 0.5
    })
  );

  parts.push(
    rect(cardX, cardY, cardW, cardH, {
      rx: 10,
      fill: p.boardFill,
      stroke: p.line,
      sw: 1.4
    })
  );

  const fanCenters = tripleFan
    ? [cardX + 48, cardX + cardW / 2, cardX + cardW - 48]
    : [cardX + 62, cardX + cardW - 62];
  const fanR = tripleFan ? 30 : 34;

  for (const cx of fanCenters) {
    const cy = cardY + cardH / 2;
    parts.push(
      circle(cx, cy, fanR, {
        stroke: p.line,
        sw: 1.3,
        fill: p.pkgFill
      })
    );
    parts.push(circle(cx, cy, 6, { stroke: p.bright, fill: p.dieFill }));
    for (let i = 0; i < 7; i += 1) {
      const a1 = (i / 7) * Math.PI * 2;
      const a2 = a1 + 0.85;
      const x1 = cx + Math.cos(a1) * 8;
      const y1 = cy + Math.sin(a1) * 8;
      const x2 = cx + Math.cos(a2) * (fanR - 4);
      const y2 = cy + Math.sin(a2) * (fanR - 4);
      const mx = cx + Math.cos((a1 + a2) / 2 + 0.12) * (fanR * 0.6);
      const my = cy + Math.sin((a1 + a2) / 2 + 0.12) * (fanR * 0.6);
      parts.push(
        `<path d="M ${x1.toFixed(1)} ${y1.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${x2.toFixed(1)} ${y2.toFixed(1)}" stroke="${p.line}" stroke-width="1" fill="none" opacity="0.7"/>`
      );
    }
  }

  // Die code as a corner callout (not inventing silicon between fans)
  parts.push(
    rect(cardX + 8, cardY + 8, 36, 14, {
      rx: 2,
      fill: p.pkgFill,
      stroke: p.bright,
      opacity: 0.85
    })
  );
  parts.push(
    text(cardX + 26, cardY + 18, dieLabel, 6.5, p.bright, { bold: true })
  );

  parts.push(
    text(cardX + cardW / 2, cardY + cardH + 14, brand, 6.5, p.line, {
      spacing: '0.18em'
    })
  );
  parts.push(dimLine(cardX, cardX + cardW, cardY - 8, '', p));

  return parts.join('\n');
}

/**
 * AMD OAM: rectangular MCM, perimeter HBM, chiplet stack cue for MI300X.
 */
function oam(p, { chiplets, dieLabel, memLabel }) {
  const bw = 168;
  const bh = 128;
  const bx = (W - bw) / 2;
  const by = 16;
  const parts = [];

  parts.push(
    rect(bx, by, bw, bh, {
      rx: 7,
      fill: p.boardFill,
      stroke: p.line,
      sw: 1.4
    })
  );
  parts.push(mountingHoles(bx, by, bw, bh, 10, p));
  parts.push(vrmField(bx + 10, by + 22, 2, 4, p));
  parts.push(vrmField(bx + bw - 10 - 19, by + 22, 2, 4, p));

  const pw = 112;
  const ph = 78;
  const px = bx + (bw - pw) / 2;
  const py = by + 22;
  parts.push(
    rect(px, py, pw, ph, { fill: p.pkgFill, stroke: p.line, opacity: 0.95 })
  );
  parts.push(hbmRing(px, py, pw, ph, 8, p, { hbmW: 12, hbmH: 11 }));

  if (chiplets) {
    // Four IOD pads with 2 XCDs stacked on each (no overlap with a band)
    const iodW = 15;
    const iodH = 11;
    const xcdW = 13;
    const xcdH = 12;
    const colGap = 3.5;
    const cols = 4;
    const stackW = cols * iodW + (cols - 1) * colGap;
    const gx = px + (pw - stackW) / 2;
    const iodY = py + ph - 16 - iodH;
    const xcd0Y = iodY - xcdH + 2; // slight sit-on-IOD overlap
    const xcd1Y = xcd0Y - xcdH - 1;

    for (let c = 0; c < cols; c += 1) {
      const ix = gx + c * (iodW + colGap);
      const cx = ix + (iodW - xcdW) / 2;
      parts.push(
        rect(ix, iodY, iodW, iodH, {
          fill: p.dim,
          stroke: p.line,
          opacity: 0.85
        })
      );
      parts.push(die(cx, xcd0Y, xcdW, xcdH, '', p));
      parts.push(die(cx, xcd1Y, xcdW, xcdH, '', p));
    }
    parts.push(
      text(px + pw / 2, xcd1Y - 5, dieLabel, 6.5, p.bright, { bold: true })
    );
    parts.push(
      text(px + pw / 2, iodY + iodH + 8, 'IOD ×4', 5.5, p.line, {
        spacing: '0.1em'
      })
    );
  } else {
    // Dual GCD
    const dw = 28;
    const dh = 40;
    const cx = px + pw / 2;
    const dy = py + (ph - dh) / 2;
    parts.push(die(cx - dw - 3, dy, dw, dh, '', p));
    parts.push(die(cx + 3, dy, dw, dh, '', p));
    parts.push(
      line(cx, dy + 4, cx, dy + dh - 4, p.bright, {
        dash: '2 2',
        opacity: 0.8
      })
    );
    parts.push(
      text(cx, py + ph / 2 + 2.5, dieLabel, 7, p.bright, { bold: true })
    );
  }

  parts.push(
    text(bx + bw / 2, py - 5, memLabel, 6.5, p.line, { spacing: '0.12em' })
  );

  const cy = by + bh - 14;
  parts.push(connectorStrip(bx + 14, cy, 56, 8, p));
  parts.push(connectorStrip(bx + bw - 14 - 56, cy, 56, 8, p));
  parts.push(dimLine(bx, bx + bw, by + bh + 8, '', p));

  return parts.join('\n');
}

// ---------------------------------------------------------------------------
// Family configs
// ---------------------------------------------------------------------------

const FAMILIES = {
  'h100-sxm': {
    palette: PALETTES.hopper,
    formLabel: 'SXM5',
    render: p =>
      sxm(p, {
        dieLabel: 'GH100',
        hbmCount: 6,
        memLabel: '80GB HBM3 · 5+1',
        connector: 'sxm5',
        ghostIndex: 5
      })
  },
  'h100-pcie': {
    palette: PALETTES.hopper,
    formLabel: 'PCIE GEN5 · 2-SLOT',
    render: p =>
      pcie(p, {
        dieLabel: 'GH100',
        hbm: true,
        hbmCount: 6,
        memLabel: '80GB HBM3 · 5+1',
        dualSlot: true,
        ghostIndex: 5
      })
  },
  h200: {
    palette: PALETTES.hopperHbm3e,
    formLabel: 'SXM5 · HBM3E',
    render: p =>
      sxm(p, {
        dieLabel: 'GH100',
        hbmCount: 6,
        memLabel: '141GB HBM3E · 6×24',
        connector: 'sxm5',
        thickHbm: true
      })
  },
  b200: {
    palette: PALETTES.blackwell,
    formLabel: 'SXM6',
    render: p =>
      sxm(p, {
        dieLabel: 'GB100 ×2',
        hbmCount: 8,
        dualDie: true,
        memLabel: '180GB HBM3E',
        connector: 'sxm6',
        thickHbm: true,
        large: true
      })
  },
  'a100-sxm': {
    palette: PALETTES.ampere,
    formLabel: 'SXM4',
    render: p =>
      sxm(p, {
        dieLabel: 'GA100',
        hbmCount: 6,
        memLabel: '80GB HBM2E',
        connector: 'sxm4'
      })
  },
  'a100-pcie': {
    palette: PALETTES.ampere,
    formLabel: 'PCIE GEN4 · 2-SLOT',
    render: p =>
      pcie(p, {
        dieLabel: 'GA100',
        hbm: true,
        hbmCount: 6,
        memLabel: '80GB HBM2E',
        dualSlot: true
      })
  },
  l40s: {
    palette: PALETTES.ada,
    formLabel: 'PCIE GEN4 · 2-SLOT',
    render: p =>
      pcie(p, {
        dieLabel: 'AD102',
        hbm: false,
        memLabel: '48GB GDDR6',
        dualSlot: true,
        ports: true
      })
  },
  l40: {
    palette: PALETTES.ada,
    formLabel: 'PCIE GEN4 · 2-SLOT',
    render: p =>
      pcie(p, {
        dieLabel: 'AD102',
        hbm: false,
        memLabel: '48GB GDDR6',
        dualSlot: true,
        ports: true
      })
  },
  a10: {
    palette: PALETTES.ampere,
    formLabel: 'PCIE · 1-SLOT',
    render: p =>
      pcie(p, {
        dieLabel: 'GA102',
        hbm: false,
        memLabel: '24GB GDDR6',
        slim: true,
        dualSlot: false
      })
  },
  'rtx-4090': {
    palette: PALETTES.consumer,
    formLabel: 'AIC · 3-SLOT',
    render: p =>
      consumer(p, {
        dieLabel: 'AD102',
        brand: 'GEFORCE RTX 4090',
        tripleFan: true
      })
  },
  'rtx-3090': {
    palette: PALETTES.consumer,
    formLabel: 'AIC · 3-SLOT',
    render: p =>
      consumer(p, {
        dieLabel: 'GA102',
        brand: 'GEFORCE RTX 3090',
        tripleFan: false
      })
  },
  mi300x: {
    palette: PALETTES.amd,
    formLabel: 'OAM',
    render: p =>
      oam(p, {
        chiplets: true,
        dieLabel: 'XCD ×8',
        memLabel: '192GB HBM3'
      })
  },
  mi250: {
    palette: PALETTES.amd,
    formLabel: 'OAM',
    render: p =>
      oam(p, {
        chiplets: false,
        dieLabel: 'GCD ×2',
        memLabel: '128GB HBM2E'
      })
  }
};

mkdirSync(OUT_DIR, { recursive: true });
for (const [id, cfg] of Object.entries(FAMILIES)) {
  const svg = wrap(id, cfg.palette, cfg.render(cfg.palette), cfg.formLabel);
  writeFileSync(join(OUT_DIR, `${id}.svg`), svg);
  console.log(`wrote ${id}.svg`);
}
