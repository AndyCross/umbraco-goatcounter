import { LitElement, css, html, customElement, state, nothing } from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { tryExecute } from "@umbraco-cms/backoffice/resources";
import { UMB_DOCUMENT_WORKSPACE_CONTEXT } from "@umbraco-cms/backoffice/document";
import { getDocumentById, type DocumentStatsModel } from "../api/index.js";
import { dayChart, fmt, shortDay } from "../shared/chart.js";
import { gcStyles } from "../shared/styles.js";

const PERIODS = [7, 30, 90];

/** A "Views" tab on every document: how often this page was viewed, from GoatCounter. */
@customElement("goatcounter-document-views")
export class GoatCounterDocumentViewsElement extends UmbElementMixin(LitElement) {
  @state() private _days = 30;
  @state() private _loading = true;
  @state() private _data?: DocumentStatsModel;
  #id?: string;

  constructor() {
    super();
    this.consumeContext(UMB_DOCUMENT_WORKSPACE_CONTEXT, (context) => {
      this.observe(context?.unique, (unique) => {
        this.#id = unique ?? undefined;
        this.#load();
      }, "_unique");
    });
  }

  async #load() {
    if (!this.#id) return;
    this._loading = true;
    const { data } = await tryExecute(this, getDocumentById({ path: { id: this.#id }, query: { days: this._days } }));
    this._data = data;
    this._loading = false;
  }

  #setPeriod(days: number) {
    if (days === this._days) return;
    this._days = days;
    this.#load();
  }

  render() {
    const d = this._data;
    return html`
      <div class="gc-bar">
        <uui-button-group>
          ${PERIODS.map((p) => html`<uui-button label="Last ${p} days" look=${p === this._days ? "primary" : "outline"} @click=${() => this.#setPeriod(p)}>${p} days</uui-button>`)}
        </uui-button-group>
      </div>
      ${this._loading && !d ? html`<uui-loader-bar></uui-loader-bar>` : nothing}
      ${d?.message ? html`<uui-box><p class="gc-empty">${d.message}</p></uui-box>` : nothing}
      ${d && !d.message
        ? html`<uui-box style=${this._loading ? "opacity:.5" : ""}>
              <div class="gc-figure">${fmt(d.total)}</div>
              <div class="gc-label">${d.total === 1 ? "view" : "views"}, ${shortDay(d.start)} to ${shortDay(d.end)}</div>
            </uui-box>
            <uui-box headline="Views per day">${dayChart(d.days)}</uui-box>
            <uui-box headline="Counted under">
              ${d.paths.length ? html`<ul class="paths">${d.paths.map((p) => html`<li><code>${p}</code></li>`)}</ul>` : html`<p class="gc-empty">This page has no address.</p>`}
            </uui-box>`
        : nothing}
    `;
  }

  static styles = [
    gcStyles,
    css`
      :host { display: block; padding: var(--uui-size-layout-1); }
      uui-box { margin-bottom: var(--uui-size-layout-1); }
      .paths { margin: 0; padding-left: 1.2rem; }
    `,
  ];
}

export default GoatCounterDocumentViewsElement;

declare global {
  interface HTMLElementTagNameMap {
    "goatcounter-document-views": GoatCounterDocumentViewsElement;
  }
}
