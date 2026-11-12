import { LitElement as w, nothing as h, html as s, css as x, state as _, customElement as C } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin as E } from "@umbraco-cms/backoffice/element-api";
import { tryExecute as D } from "@umbraco-cms/backoffice/resources";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT as O } from "@umbraco-cms/backoffice/document";
import { f as P, s as y, d as S, b as M, a as T } from "./styles-CBQ0AQa0.js";
var G = Object.defineProperty, V = Object.getOwnPropertyDescriptor, $ = (t) => {
  throw TypeError(t);
}, d = (t, e, a, r) => {
  for (var i = r > 1 ? void 0 : r ? V(e, a) : e, l = t.length - 1, c; l >= 0; l--)
    (c = t[l]) && (i = (r ? c(e, a, i) : c(i)) || i);
  return r && i && G(e, a, i), i;
}, m = (t, e, a) => e.has(t) || $("Cannot " + a), g = (t, e, a) => (m(t, e, "read from private field"), e.get(t)), f = (t, e, a) => e.has(t) ? $("Cannot add the same private member more than once") : e instanceof WeakSet ? e.add(t) : e.set(t, a), W = (t, e, a, r) => (m(t, e, "write to private field"), e.set(t, a), a), p = (t, e, a) => (m(t, e, "access private method"), a), n, u, v, b;
const q = [7, 30, 90];
let o = class extends E(w) {
  constructor() {
    super(), f(this, u), this._days = 30, this._loading = !0, f(this, n), this.consumeContext(O, (t) => {
      this.observe(t?.unique, (e) => {
        W(this, n, e ?? void 0), p(this, u, v).call(this);
      }, "_unique");
    });
  }
  render() {
    const t = this._data;
    return s`
      <div class="gc-bar">
        <uui-button-group>
          ${q.map((e) => s`<uui-button label="Last ${e} days" look=${e === this._days ? "primary" : "outline"} @click=${() => p(this, u, b).call(this, e)}>${e} days</uui-button>`)}
        </uui-button-group>
      </div>
      ${this._loading && !t ? s`<uui-loader-bar></uui-loader-bar>` : h}
      ${t?.message ? s`<uui-box><p class="gc-empty">${t.message}</p></uui-box>` : h}
      ${t && !t.message ? s`<uui-box style=${this._loading ? "opacity:.5" : ""}>
              <div class="gc-figure">${P(t.total)}</div>
              <div class="gc-label">${t.total === 1 ? "view" : "views"}, ${y(t.start)} to ${y(t.end)}</div>
            </uui-box>
            <uui-box headline="Views per day">${S(t.days)}</uui-box>
            <uui-box headline="Counted under">
              ${t.paths.length ? s`<ul class="paths">${t.paths.map((e) => s`<li><code>${e}</code></li>`)}</ul>` : s`<p class="gc-empty">This page has no address.</p>`}
            </uui-box>` : h}
    `;
  }
};
n = /* @__PURE__ */ new WeakMap();
u = /* @__PURE__ */ new WeakSet();
v = async function() {
  if (!g(this, n)) return;
  this._loading = !0;
  const { data: t } = await D(this, M({ path: { id: g(this, n) }, query: { days: this._days } }));
  this._data = t, this._loading = !1;
};
b = function(t) {
  t !== this._days && (this._days = t, p(this, u, v).call(this));
};
o.styles = [
  T,
  x`
      :host { display: block; padding: var(--uui-size-layout-1); }
      uui-box { margin-bottom: var(--uui-size-layout-1); }
      .paths { margin: 0; padding-left: 1.2rem; }
    `
];
d([
  _()
], o.prototype, "_days", 2);
d([
  _()
], o.prototype, "_loading", 2);
d([
  _()
], o.prototype, "_data", 2);
o = d([
  C("goatcounter-document-views")
], o);
const I = o;
export {
  o as GoatCounterDocumentViewsElement,
  I as default
};
//# sourceMappingURL=document-views.element-BW7wstyD.js.map
