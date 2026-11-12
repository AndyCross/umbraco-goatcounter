export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "GoatCounter Document Views",
    alias: "GoatCounter.WorkspaceView.DocumentViews",
    type: "workspaceView",
    js: () => import("./document-views.element.js"),
    weight: 10,
    meta: {
      label: "Views",
      pathname: "views",
      icon: "icon-chart-curve",
    },
    conditions: [
      {
        alias: "Umb.Condition.WorkspaceAlias",
        match: "Umb.Workspace.Document",
      },
    ],
  },
];
