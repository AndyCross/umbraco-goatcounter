import { css } from "@umbraco-cms/backoffice/external/lit";

export const gcStyles = css`
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
