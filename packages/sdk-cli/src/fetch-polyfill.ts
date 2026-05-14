// Polyfill global fetch for Node.js < 18 which does not have it natively.
// node-fetch v3 avoids the deprecated built-in `punycode` module that v2 pulled in via whatwg-url.
if (typeof globalThis.fetch === 'undefined') {
  const nodeFetch = await import('node-fetch');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- polyfill assignment to global
  const g = globalThis as any;
  g.fetch = nodeFetch.default;
  g.Headers = nodeFetch.Headers;
  g.Request = nodeFetch.Request;
  g.Response = nodeFetch.Response;
}
