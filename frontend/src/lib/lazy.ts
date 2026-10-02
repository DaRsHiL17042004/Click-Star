import { lazy, type ComponentType } from "react";

/**
 * React.lazy that recovers from stale chunks after a deploy: if a dynamic
 * import fails, reload the page once to pick up the new asset manifest.
 */
export function lazyWithRetry<T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) { // eslint-disable-line @typescript-eslint/no-explicit-any
  return lazy(async () => {
    try {
      const m = await factory();
      sessionFlag(false);
      return m;
    } catch (err) {
      if (!sessionFlag()) {
        sessionFlag(true);
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    }
  });
}

let reloaded = false;
function sessionFlag(set?: boolean) {
  try {
    if (set === undefined) return window.sessionStorage.getItem("cs-chunk-reload") === "1" || reloaded;
    reloaded = set;
    if (set) window.sessionStorage.setItem("cs-chunk-reload", "1");
    else window.sessionStorage.removeItem("cs-chunk-reload");
  } catch {
    if (set !== undefined) reloaded = set;
  }
  return reloaded;
}
