// Shim for node-domexception in workerd/Cloudflare Workers runtime.
// DOMException is globally available in workerd, so the Node polyfill is unnecessary.
export default globalThis.DOMException;
