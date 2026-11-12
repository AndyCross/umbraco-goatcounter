import { LitElement, css, html, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { getSummary, type SummaryModel } from "../api/index.js";
import { dayChart, fmt, ranked, shortDay } from "../shared/chart.js";
import { gcStyles } from "../shared/styles.js";

const PERIODS = [7, 30, 90];

@customElement("goatcounter-dashboard")
export class GoatCounterDashboardElement extends UmbElementMixin(LitElement) {
  @state() private _days = 30;
  @state() private _loading = true;
  @state() private _data?: SummaryModel;

  connectedCallback() {
    super.connectedCallback();
    this.#load();
  }

  async #load() {
    this._loading = true;
    const { data } = await tryExecute(this, getSummary({ query: { days: this._days } }));
    this._data = data;
    this._loading = false;
  }

  #setPeriod(days: number) {
    if (days === this._days) return;
    this._days = days;
    this.#load();
  }

  #pageLink = (path: string) => (path.startsWith("/") ? path : undefined);
  #refLink = (name: string) => (/^https?:\/\//.test(name) ? name : undefined);

  render() {
    const d = this._data;
    return html`
      <div class="gc-bar">
        <uui-button-group>
          ${PERIODS.map((p) => html`<uui-button label="Last ${p} days" look=${p === this._days ? "primary" : "outline"} @click=${() => this.#setPeriod(p)}>${p} days</uui-button>`)}
        </uui-button-group>
        ${d?.siteUrl ? html`<a class="gc-open" href=${d.siteUrl} target="_blank" rel="noopener">Open GoatCounter</a>` : nothing}
      </div>
      ${this._loading && !d ? html`<uui-loader-bar></uui-loader-bar>` : nothing}
      ${d && (!d.configured || d.message) ? html`<uui-box headline="GoatCounter"><p class="gc-empty">${d.message}</p></uui-box>` : nothing}
      ${d && d.configured && !d.message ? this.#stats(d) : nothing}
    `;
  }

  #stats(d: SummaryModel) {
    const busiest = d.days.reduce((a, b) => (b.count > a.count ? b : a), d.days[0] ?? { day: d.end, count: 0 });
    const perDay = d.days.length ? Math.round(d.total / d.days.length) : 0;
    return html`
      <div class="tiles" style=${this._loading ? "opacity:.5" : ""}>
        <uui-box><div class="gc-figure">${fmt(d.total)}</div><div class="gc-label">views, ${shortDay(d.start)} to ${shortDay(d.end)}</div></uui-box>
        <uui-box><div class="gc-figure">${fmt(perDay)}</div><div class="gc-label">a day on average</div></uui-box>
        <uui-box><div class="gc-figure">${fmt(busiest.count)}</div><div class="gc-label">on the busiest day, ${shortDay(busiest.day)}</div></uui-box>
        <uui-box>
          <div class="gc-figure">${d.countingPageViews ? "On" : "Off"}</div>
          <div class="gc-label">${d.countingPageViews ? "first-party counting through this site" : "first-party counting (GoatCounter:CountPageViews)"}</div>
        </uui-box>
      </div>
      <uui-box headline="Views per day">${dayChart(d.days)}</uui-box>
      <div class="cols">
        <uui-box headline="Most viewed pages">${ranked(d.pages.map((p) => ({ name: p.path, count: p.count })), "No views in this period.", this.#pageLink)}</uui-box>
        <uui-box headline="Where visitors came from">${ranked(d.referrers.map((r) => ({ name: r.name || "Direct or unknown", count: r.count })), "No referrers recorded.", this.#refLink)}</uui-box>
      </div>
      <div class="cols four">
        <uui-box headline="Countries">${ranked(d.locations)}</uui-box>
        <uui-box headline="Browsers">${ranked(d.browsers)}</uui-box>
        <uui-box headline="Systems">${ranked(d.systems)}</uui-box>
        <uui-box headline="Screen sizes">${ranked(d.sizes)}</uui-box>
      </div>
    `;
  }

  static styles = [
    gcStyles,
    css`
      :host { display: block; padding: var(--uui-size-layout-1); }
      uui-box { margin-bottom: var(--uui-size-layout-1); }
      .tiles { display: grid; grid-template-columns: repeat(auto-fit, minmax(13rem, 1fr)); gap: var(--uui-size-layout-1); }
      .tiles uui-box, .cols uui-box { margin-bottom: 0; }
      .tiles, .cols { margin-bottom: var(--uui-size-layout-1); }
      .cols { display: grid; grid-template-columns: repeat(auto-fit, minmax(24rem, 1fr)); gap: var(--uui-size-layout-1); align-items: start; }
      .cols.four { grid-template-columns: repeat(auto-fit, minmax(15rem, 1fr)); }
      .gc-open { color: var(--uui-color-interactive); }
    `,
  ];
}

export default GoatCounterDashboardElement;

declare global {
  interface HTMLElementTagNameMap {
    "goatcounter-dashboard": GoatCounterDashboardElement;
  }
}
