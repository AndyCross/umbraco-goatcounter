import { html, svg, nothing } from "@umbraco-cms/backoffice/external/lit";
import type { DayCount, NamedCount } from "../api/index.js";

const number = new Intl.NumberFormat();
export const fmt = (n: number) => number.format(n);

export const shortDay = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString(undefined, { day: "numeric", month: "short", timeZone: "UTC" });

/** Views per day as columns. One series, so no legend; each column carries its date and count as a tooltip. */
export function dayChart(days: Array<DayCount>, height = 180) {
  if (!days.length) return nothing;
  const width = 800, left = 40, bottom = 22, top = 8;
  const max = Math.max(1, ...days.map((d) => d.count));
  // A round step (1, 2 or 5 times a power of ten) that gives about four gridlines.
  const raw = max / 4, pow = Math.pow(10, Math.floor(Math.log10(Math.max(raw, 1))));
  const step = Math.max(1, [1, 2, 5, 10].find((m) => m * pow >= raw)! * pow);
  const ceil = Math.ceil(max / step) * step;
  const plotH = height - top - bottom, plotW = width - left - 8;
  const band = plotW / days.length, bar = Math.max(1, Math.min(28, band * 0.7));
  const y = (v: number) => top + plotH - (v / ceil) * plotH;
  const ticks = Array.from({ length: Math.round(ceil / step) + 1 }, (_, i) => i * step);
  const every = Math.ceil(days.length / 8);
  return html`<svg class="gc-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Views per day">
    ${ticks.map((t) => svg`<line x1=${left} x2=${width - 8} y1=${y(t)} y2=${y(t)} class="grid"></line>
      <text x=${left - 6} y=${y(t) + 4} text-anchor="end" class="axis">${fmt(t)}</text>`)}
    ${days.map((d, i) => svg`<rect x=${left + i * band + (band - bar) / 2} y=${y(d.count)} width=${bar} height=${Math.max(0, y(0) - y(d.count))} rx="1" class="bar">
        <title>${shortDay(d.day)}: ${fmt(d.count)} ${d.count === 1 ? "view" : "views"}</title></rect>
      ${i % every === 0 ? svg`<text x=${left + i * band + band / 2} y=${height - 6} text-anchor="middle" class="axis">${shortDay(d.day)}</text>` : nothing}`)}
  </svg>`;
}

/** A ranked list with a bar behind each count, scaled to the largest. */
export function ranked(rows: Array<NamedCount>, empty = "Nothing recorded.", link?: (name: string) => string | undefined) {
  if (!rows.length) return html`<p class="gc-empty">${empty}</p>`;
  const max = Math.max(1, ...rows.map((r) => r.count));
  return html`<ol class="gc-ranked">
    ${rows.map((r) => {
      const href = link?.(r.name);
      return html`<li>
        <span class="gc-name" title=${r.name}>${href ? html`<a href=${href} target="_blank" rel="noopener">${r.name}</a>` : r.name}</span>
        <span class="gc-meter"><i style="width:${(r.count / max) * 100}%"></i></span>
        <span class="gc-count">${fmt(r.count)}</span>
      </li>`;
    })}
  </ol>`;
}
