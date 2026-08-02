// SSR-only polyfills for the React on Rails Pro Node renderer.
//
// MapLibre GL constructs `new AbortController()` while it initializes its tile /
// glyph / in-flight-dependency request managers. That code runs during the
// server render of every map-bearing page (browse, host map, listing detail,
// home). The RORP node-renderer's vm sandbox does not reliably expose the
// `AbortController` global, so those renders throw `AbortController is not
// defined` and kill the worker — intermittently, since the map is a lazy chunk
// and isn't always pulled into a given SSR pass.
//
// SSR never actually issues those network requests (there is no live map on the
// server), so a minimal no-op shim is sufficient. The browser bundle keeps using
// the real DOM AbortController. Only installed when the runtime lacks one, so a
// context that already provides the native class is left untouched.
if (typeof globalThis.AbortController === 'undefined') {
  class AbortSignalShim {
    constructor() {
      this.aborted = false;
      this.reason = undefined;
    }

    addEventListener() {}

    removeEventListener() {}

    dispatchEvent() {
      return false;
    }

    throwIfAborted() {}
  }

  if (typeof globalThis.AbortSignal === 'undefined') {
    globalThis.AbortSignal = AbortSignalShim;
  }

  globalThis.AbortController = class AbortController {
    constructor() {
      this.signal = new globalThis.AbortSignal();
    }

    abort(reason) {
      this.signal.aborted = true;
      this.signal.reason = reason;
    }
  };
}
