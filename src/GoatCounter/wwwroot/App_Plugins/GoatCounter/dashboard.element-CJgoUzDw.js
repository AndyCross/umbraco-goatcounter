import { LitElement as E, nothing as l, html as u, css as D, state as b, customElement as P } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as O } from "@umbraco-cms/backoffice/element-api";
import { tryExecute as z } from "@umbraco-cms/backoffice/resources";
import { g as G, f as p, s as v, d as S, r, a as M } from "./styles-CBQ0AQa0.js";
var W = Object.defineProperty, L = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, d = (t, e, a, i) => {
  for (var s = i > 1 ? void 0 : i ? L(e, a) : e, h = t.length - 1, g; h >= 0; h--)
    (g = t[h]) && (s = (i ? g(e, a, s) : g(s)) || s);
  return i && s && W(e, a, s), s;
}, w = (t, e, a) => e.has(t) || $("Cannot " + a), x = (t, e, a) => (w(t, e, "read from private field"), a ? a.call(t) : e.get(t)), m = (t, e, a) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), c = (t, e, a) => (w(t, e, "access private method"), a), n, y, C, f, _, k;
const V = [7, 30, 90];
let o = class extends O(E) {
  constructor() {
    super(...arguments), m(this, n), this._days = 30, this._loading = !0, m(this, f, (t) => t.startsWith("/") ? t : void 0), m(this, _, (t) => /^https?:\/\//.test(t) ? t : void 0);
  }
  connectedCallback() {
    super.connectedCallback(), c(this, n, y).call(this);
  }
  render() {
    const t = this._data;
    return u`
      <div class="gc-bar">
        <uui-button-group>
          ${V.map((e) => u`<uui-button label="Last ${e} days" look=${e === this._days ? "primary" : "outline"} @click=${() => c(this, n, C).call(this, e)}>${e} days</uui-button>`)}
        </uui-button-group>
        ${t?.siteUrl ? u`<a class="gc-open" href=${t.siteUrl} target="_blank" rel="noopener">Open GoatCounter</a>` : l}
      </div>
      ${this._loading && !t ? u`<uui-loader-bar></uui-loader-bar>` : l}
      ${t && (!t.configured || t.message) ? u`<uui-box headline="GoatCounter"><p class="gc-empty">${t.message}</p></uui-box>` : l}
      ${t && t.configured && !t.message ? c(this, n, k).call(this, t) : l}
    `;
  }
};
n = /* @__PURE__ */ new WeakSet();
y = async function() {
  this._loading = !0;
  const { data: t } = await z(this, G({ query: { days: this._days } }));
  this._data = t, this._loading = !1;
};
C = function(t) {
  t !== this._days && (this._days = t, c(this, n, y).call(this));
};
f = /* @__PURE__ */ new WeakMap();
_ = /* @__PURE__ */ new WeakMap();
k = function(t) {
  const e = t.days.reduce((i, s) => s.count > i.count ? s : i, t.days[0] ?? { day: t.end, count: 0 }), a = t.days.length ? Math.round(t.total / t.days.length) : 0;
  return u`
      <div class="tiles" style=${this._loading ? "opacity:.5" : ""}>
        <uui-box><div class="gc-figure">${p(t.total)}</div><div class="gc-label">views, ${v(t.start)} to ${v(t.end)}</div></uui-box>
        <uui-box><div class="gc-figure">${p(a)}</div><div class="gc-label">a day on average</div></uui-box>
        <uui-box><div class="gc-figure">${p(e.count)}</div><div class="gc-label">on the busiest day, ${v(e.day)}</div></uui-box>
        <uui-box>
          <div class="gc-figure">${t.countingPageViews ? "On" : "Off"}</div>
          <div class="gc-label">${t.countingPageViews ? "first-party counting through this site" : "first-party counting (GoatCounter:CountPageViews)"}</div>
        </uui-box>
      </div>
      <uui-box headline="Views per day">${S(t.days)}</uui-box>
      <div class="cols">
        <uui-box headline="Most viewed pages">${r(t.pages.map((i) => ({ name: i.path, count: i.count })), "No views in this period.", x(this, f))}</uui-box>
        <uui-box headline="Where visitors came from">${r(t.referrers.map((i) => ({ name: i.name || "Direct or unknown", count: i.count })), "No referrers recorded.", x(this, _))}</uui-box>
      </div>
      <div class="cols four">
        <uui-box headline="Countries">${r(t.locations)}</uui-box>
        <uui-box headline="Browsers">${r(t.browsers)}</uui-box>
        <uui-box headline="Systems">${r(t.systems)}</uui-box>
        <uui-box headline="Screen sizes">${r(t.sizes)}</uui-box>
      </div>
    `;
};
o.styles = [
  M,
  D`
      :host { display: block; padding: var(--uui-size-layout-1); }
      uui-box { margin-bottom: var(--uui-size-layout-1); }
      .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: var(--uui-size-layout-1); }
      .tiles uui-box, .cols uui-box { margin-bottom: 0; }
      .tiles, .cols { margin-bottom: var(--uui-size-layout-1); }
      .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr)); gap: var(--uui-size-layout-1); align-items: start; }
      .cols.four { grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
      .gc-open { color: var(--uui-color-interactive); }
    `
];
d([
  b()
], o.prototype, "_days", 2);
d([
  b()
], o.prototype, "_loading", 2);
d([
  b()
], o.prototype, "_data", 2);
o = d([
  P("goatcounter-dashboard")
], o);
const B = o;
export {
  o as GoatCounterDashboardElement,
  B as default
};
//# sourceMappingURL=dashboard.element-CJgoUzDw.js.map
