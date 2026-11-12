export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "GoatCounter Dashboard",
    alias: "GoatCounter.Dashboard",
    type: "dashboard",
    js: () => import("./dashboard.element.js"),
    weight: 5,
    meta: {
      label: "Analytics",
      pathname: "analytics",
    },
    conditions: [
      {
        alias: "Umb.Condition.SectionAlias",
        match: "Umb.Section.Content",
      },
    ],
  },
];
