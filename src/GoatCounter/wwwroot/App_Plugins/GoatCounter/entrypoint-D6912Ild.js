import { UMB_AUTH_CONTEXT as a } from "@umbraco-cms/backoffice/auth";
import { c as i } from "./client.gen-Cd7C8Os_.js";
const l = async (e, s) => {
  const o = await e.getContext(a);
  if (!o) {
    console.warn("UMB_AUTH_CONTEXT not available — extension API client will not be authenticated");
    return;
  }
  const t = o;
  if (typeof t.configureClient == "function")
    t.configureClient(i);
  else {
    const n = t.getOpenApiConfiguration();
    i.setConfig({ auth: n.token, baseUrl: n.base, credentials: n.credentials });
  }
}, f = (e, s) => {
};
export {
  l as onInit,
  f as onUnload
};
//# sourceMappingURL=entrypoint-D6912Ild.js.map
