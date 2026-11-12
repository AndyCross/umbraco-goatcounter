import { c as w } from "./client.gen-Cd7C8Os_.js";
import { nothing as $, svg as g, html as u, css as z } from "@umbraco-cms/backoffice/external/lit";
const I = (t) => (t.client ?? w).get({
  security: [{ scheme: "bearer", type: "http" }],
  url: "/umbraco/goatcounter/api/v1/document/{id}",
  ...t
}), N = (t) => (t?.client ?? w).get({
  security: [{ scheme: "bearer", type: "http" }],
  url: "/umbraco/goatcounter/api/v1/summary",
  ...t
}), D = new Intl.NumberFormat(), h = (t) => D.format(t), y = (t) => (/* @__PURE__ */ new Date(t + "T00:00:00Z")).toLocaleDateString(void 0, { day: "numeric", month: "short", timeZone: "UTC" });
function T(t, n = 180) {
  if (!t.length) return $;
  const c = 800, r = 40, a = 22, i = 8, p = Math.max(1, ...t.map((e) => e.count)), d = p / 4, x = Math.pow(10, Math.floor(Math.log10(Math.max(d, 1)))), m = Math.max(1, [1, 2, 5, 10].find((e) => e * x >= d) * x), f = Math.ceil(p / m) * m, b = n - i - a, l = (c - r - 8) / t.length, v = Math.max(1, Math.min(28, l * 0.7)), o = (e) => i + b - e / f * b, k = Array.from({ length: Math.round(f / m) + 1 }, (e, s) => s * m), M = Math.ceil(t.length / 8);
  return u`<svg class="gc-chart" viewBox="0 0 ${c} ${n}" role="img" aria-label="Views per day">
    ${k.map((e) => g`<line x1=${r} x2=${c - 8} y1=${o(e)} y2=${o(e)} class="grid"></line>
      <text x=${r - 6} y=${o(e) + 4} text-anchor="end" class="axis">${h(e)}</text>`)}
    ${t.map((e, s) => g`<rect x=${r + s * l + (l - v) / 2} y=${o(e.count)} width=${v} height=${Math.max(0, o(0) - o(e.count))} rx="1" class="bar">
        <title>${y(e.day)}: ${h(e.count)} ${e.count === 1 ? "view" : "views"}</title></rect>
      ${s % M === 0 ? g`<text x=${r + s * l + l / 2} y=${n - 6} text-anchor="middle" class="axis">${y(e.day)}</text>` : $}`)}
  </svg>`;
}
function W(t, n = "Nothing recorded.", c) {
  if (!t.length) return u`<p class="gc-empty">${n}</p>`;
  const r = Math.max(1, ...t.map((a) => a.count));
  return u`<ol class="gc-ranked">
    ${t.map((a) => {
    const i = c?.(a.name);
    return u`<li>
        <span class="gc-name" title=${a.name}>${i ? u`<a href=${i} target="_blank" rel="noopener">${a.name}</a>` : a.name}</span>
        <span class="gc-meter"><i style="width:${a.count / r * 100}%"></i></span>
        <span class="gc-count">${h(a.count)}</span>
      </li>`;
  })}
  </ol>`;
}
const Z = z`
  .gc-chart { display: block; width: 100%; height: auto; }
  .gc-chart .bar { fill: var(--uui-color-interactive, #1b264f); }
  .gc-chart .bar:hover { fill: var(--uui-color-interactive-emphasis, #3544b1); }
  .gc-chart .grid { stroke: var(--uui-color-divider, #e9e9eb); stroke-width: 1; }
  .gc-chart .axis { fill: var(--uui-color-text-alt, #68676b); font-size: 11px; font-family: inherit; }
  .gc-ranked { list-style: none; margin: 0; padding: 0; }
  .gc-ranked li { display: grid; grid-template-columns: minmax(0, 1fr) 6rem 3.5rem; gap: var(--uui-size-space-4); align-items: center; padding: 6px 0; border-bottom: 1px solid var(--uui-color-divider, #e9e9eb); }
  .gc-ranked li:last-child { border-bottom: 0; }
  .gc-name { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .gc-name a { color: var(--uui-color-interactive); text-decoration: none; }
  .gc-name a:hover { text-decoration: underline; }
  .gc-meter { height: 6px; background: var(--uui-color-surface-alt, #f3f3f5); border-radius: 3px; overflow: hidden; }
  .gc-meter i { display: block; height: 100%; background: var(--uui-color-interactive, #1b264f); border-radius: 3px; }
  .gc-count { text-align: right; font-variant-numeric: tabular-nums; }
  .gc-empty { color: var(--uui-color-text-alt); margin: 0; }
  .gc-figure { font-size: 2.5rem; line-height: 1.1; font-weight: 700; font-variant-numeric: tabular-nums; }
  .gc-label { color: var(--uui-color-text-alt); font-size: var(--uui-type-small-size, 12px); }
  .gc-bar { display: flex; flex-wrap: wrap; gap: var(--uui-size-space-4); align-items: center; justify-content: space-between; margin-bottom: var(--uui-size-space-5); }
`;
export {
  Z as a,
  I as b,
  T as d,
  h as f,
  N as g,
  W as r,
  y as s
};
//# sourceMappingURL=styles-CBQ0AQa0.js.map
