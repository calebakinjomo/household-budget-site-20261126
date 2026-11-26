// Hearth & Ledger — small SVG charts, drawn from the live totals.
// No chart library: two focused helpers, donut and daily bars, both pure SVG.

import { money } from './store.js';

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// Donut of spending by category. slices: [{ name, value, color }].
export function donutChart(slices, size = 260) {
  const total = slices.reduce((s, x) => s + x.value, 0);
  const cx = size / 2;
  const cy = size / 2;
  const r = size / 2 - 14;
  const inner = r - 34;
  if (total <= 0) {
    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="No spending yet">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="#eee8da" stroke-width="34"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" font-size="15" fill="#7d8a86">No spending yet</text></svg>`;
  }
  let angle = -Math.PI / 2;
  let paths = '';
  for (const s of slices) {
    if (s.value <= 0) continue;
    const frac = s.value / total;
    const a0 = angle;
    const a1 = angle + frac * Math.PI * 2;
    const large = frac > 0.5 ? 1 : 0;
    const x0 = cx + r * Math.cos(a0);
    const y0 = cy + r * Math.sin(a0);
    const x1 = cx + r * Math.cos(a1);
    const y1 = cy + r * Math.sin(a1);
    const xi1 = cx + inner * Math.cos(a1);
    const yi1 = cy + inner * Math.sin(a1);
    const xi0 = cx + inner * Math.cos(a0);
    const yi0 = cy + inner * Math.sin(a0);
    paths += `<path d="M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(1)} ${y1.toFixed(1)} L ${xi1.toFixed(1)} ${yi1.toFixed(1)} A ${inner} ${inner} 0 ${large} 0 ${xi0.toFixed(1)} ${yi0.toFixed(1)} Z" fill="${s.color}"><title>${esc(s.name)}: ${money(s.value)}</title></path>`;
    angle = a1;
  }
  return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" role="img" aria-label="Spending by category, ${money(total)} in total">
    ${paths}
    <text x="${cx}" y="${cy - 4}" text-anchor="middle" font-size="13" fill="#7d8a86">Spent so far</text>
    <text x="${cx}" y="${cy + 18}" text-anchor="middle" font-size="19" font-weight="800" fill="#1d2b29">${money(total)}</text>
  </svg>`;
}

// Daily spending bars for the month so far, with a cumulative line on top.
// days: [{ day, spent }]. Returns an SVG sized to its viewBox (scales to width).
export function dailyChart(days) {
  const W = 640;
  const H = 260;
  const padL = 44;
  const padB = 26;
  const padT = 14;
  const plotW = W - padL - 12;
  const plotH = H - padT - padB;
  const maxDay = Math.max(...days.map((d) => d.spent), 1);
  const total = days.reduce((s, d) => s + d.spent, 0);
  const maxCum = Math.max(total, 1);
  const slot = plotW / days.length;
  const barW = Math.max(4, Math.min(18, slot * 0.62));

  let bars = '';
  let cum = 0;
  let linePts = '';
  days.forEach((d, i) => {
    const x = padL + i * slot + (slot - barW) / 2;
    const h = (d.spent / maxDay) * plotH;
    const y = padT + plotH - h;
    bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="2" fill="#14564f"><title>Nov ${d.day}: ${money(d.spent)}</title></rect>`;
    cum += d.spent;
    const cx = padL + i * slot + slot / 2;
    const cy = padT + plotH - (cum / maxCum) * plotH;
    linePts += `${cx.toFixed(1)},${cy.toFixed(1)} `;
  });

  // Y gridlines with labels.
  let grid = '';
  for (let g = 0; g <= 4; g++) {
    const v = (maxDay / 4) * g;
    const y = padT + plotH - (v / maxDay) * plotH;
    grid += `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - 12}" y2="${y.toFixed(1)}" stroke="#e4ddd0" stroke-width="1"/>` +
      `<text x="${padL - 6}" y="${(y + 4).toFixed(1)}" text-anchor="end" font-size="11" fill="#7d8a86">$${Math.round(v)}</text>`;
  }
  let xlabels = '';
  for (let d = 1; d <= days.length; d += 5) {
    const cx = padL + (d - 1) * slot + slot / 2;
    xlabels += `<text x="${cx.toFixed(1)}" y="${H - 8}" text-anchor="middle" font-size="11" fill="#7d8a86">Nov ${d}</text>`;
  }

  return `<svg viewBox="0 0 ${W} ${H}" width="100%" role="img" aria-label="Daily spending in November, bars per day with a running total line">
    ${grid}
    ${bars}
    <polyline points="${linePts.trim()}" fill="none" stroke="#c98f2d" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
    ${xlabels}
    <text x="${padL}" y="${H - 8}" font-size="11" fill="#7d8a86"></text>
  </svg>`;
}
