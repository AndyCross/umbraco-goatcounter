export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "Goat Counter Entrypoint",
    alias: "GoatCounter.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
