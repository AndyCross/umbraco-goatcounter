const t = [
  {
    name: "GoatCounter Entrypoint",
    alias: "GoatCounter.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint-D6912Ild.js")
  }
], a = [
  {
    name: "GoatCounter Dashboard",
    alias: "GoatCounter.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element-CJgoUzDw.js"),
    weight: 5,
    meta: {
      label: "Analytics",
      pathname: "analytics"
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content"
      }
    ]
  }
], o = [
  {
    name: "GoatCounter Document Views",
    alias: "GoatCounter.WorkspaceView.DocumentViews",
    type: "workspaceView",
    js: () => import("./document-views.element-BW7wstyD.js"),
    weight: 10,
    meta: {
      label: "Views",
      pathname: "views",
      icon: "icon-chart-curve"
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.Document"
      }
    ]
  }
], n = [
  ...t,
  ...a,
  ...o
];
export {
  n as manifests
};
//# sourceMappingURL=goat-counter.js.map
