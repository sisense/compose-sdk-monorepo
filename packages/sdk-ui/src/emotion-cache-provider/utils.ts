/**
 * Retrieves the nonce value from the <meta> tag in the document head.
 */
export function getNonceFromMetaTag(): string | undefined {
  return (
    document.head.querySelector('meta[property="csp-nonce"]')?.getAttribute('content') ?? undefined
  );
}
