export const manifests: Array<UmbExtensionManifest> = [
  {
    name: "GoatCounter Entrypoint",
    alias: "GoatCounter.Entrypoint",
    type: "backofficeEntryPoint",
    js: () => import("./entrypoint.js"),
  },
];
