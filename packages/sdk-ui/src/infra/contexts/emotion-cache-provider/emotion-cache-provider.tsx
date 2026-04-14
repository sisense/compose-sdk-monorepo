import React, { createContext, ReactNode, useContext, useMemo } from 'react';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import { prefixer } from 'stylis';

import { createCssSelectorPrefixPlugin } from './stylis-plugins/css-selector-prefix-plugin';
import { getNonceFromMetaTag } from './utils';

/**
 * Internal context used to distinguish top-level from nested `EmotionCacheProvider`
 * instances and to track the active CSS selector prefix.
 */
const EmotionCacheContext = createContext<{ cssSelectorPrefix: string | undefined } | undefined>(
  undefined,
);

export interface EmotionCacheProviderProps {
  children: ReactNode;
  /**
   * An ancestor CSS selector (e.g. `'#sdk-scope'`) to prepend to every Emotion
   * CSS rule to increase specificity.
   *
   * When omitted (`undefined`), no prefix logic is applied.
   */
  cssSelectorPrefix?: string;
}

/**
 * Provides an Emotion cache to the component tree.  Handles two concerns:
 *
 * 1. **CSP nonce** — when a `<meta property="csp-nonce">` tag is present, a
 *    cache carrying that nonce is created so Emotion's `<style>` tags comply
 *    with Content Security Policy.
 *
 * 2. **CSS selector prefix** — when `cssSelectorPrefix` is provided, a Stylis
 *    plugin is installed that prepends the selector to every compiled CSS rule,
 *    increasing specificity so CSDK styles win over host-app overrides.
 *
 * The component is designed to be used at two levels:
 *
 * - **Top-level** (in `SisenseContextProvider`, no `cssSelectorPrefix` prop) —
 *   creates a nonce-only cache if needed and establishes the internal context
 *   so nested instances can detect they are not the first provider.
 *
 * - **Nested** (in `ThemeProvider`, with `cssSelectorPrefix` prop) — compares
 *   the requested prefix against the ancestor's value via `EmotionCacheContext`.
 *   A new cache is created only when the prefix has actually changed; otherwise
 *   children are rendered as-is, reusing the ancestor's cache.
 *
 * When a nested provider creates a cache (nonce is always included when present),
 * it also updates `EmotionCacheContext` so that further nested providers can
 * detect the new prefix value and avoid creating duplicate caches.
 */
export const EmotionCacheProvider: React.FC<EmotionCacheProviderProps> = ({
  children,
  cssSelectorPrefix,
}) => {
  const nonce = useMemo(() => getNonceFromMetaTag(), []);
  const parentContext = useContext(EmotionCacheContext);
  const isTopLevelProvider = !parentContext;
  const parentCssSelectorPrefix = parentContext?.cssSelectorPrefix;

  const emotionCache = useMemo(() => {
    const cssSelectorPrefixChanged = cssSelectorPrefix !== parentCssSelectorPrefix;

    if ((isTopLevelProvider && nonce) || cssSelectorPrefixChanged) {
      return createCache({
        key: 'css',
        ...(nonce && { nonce }),
        ...(cssSelectorPrefix && {
          stylisPlugins: [prefixer, createCssSelectorPrefixPlugin(cssSelectorPrefix)],
        }),
      });
    }

    return null;
  }, [isTopLevelProvider, cssSelectorPrefix, parentCssSelectorPrefix, nonce]);

  if (isTopLevelProvider || emotionCache) {
    return (
      <EmotionCacheContext.Provider value={{ cssSelectorPrefix: cssSelectorPrefix }}>
        {emotionCache ? (
          <CacheProvider value={emotionCache}>{children}</CacheProvider>
        ) : (
          <>{children}</>
        )}
      </EmotionCacheContext.Provider>
    );
  }

  return <>{children}</>;
};
