import React, { ReactNode, useMemo } from 'react';

import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';

import { getNonceFromMetaTag } from './utils';

/**
 * Creates an Emotion cache only if a nonce is present in the DOM.
 * This cache will be used to inject styles in a way that is compatible with Content Security Policy (CSP).
 * If no nonce is found, the function returns null, meaning no cache will be created.
 */
const createEmotionCacheIfNeeded = () => {
  const nonce = getNonceFromMetaTag();

  if (!nonce) {
    return null; // Don't create the cache if there's no nonce
  }

  return createCache({
    key: 'css',
    nonce,
  });
};

export interface EmotionCacheProviderProps {
  children: ReactNode;
}

/**
 * A provider component that uses the Emotion cache, but only creates one if a nonce is found in the DOM.
 * This ensures that styles are injected in a way that is compliant with CSP if necessary.
 * If no nonce is found, it simply renders the children without the CacheProvider.
 */
export const EmotionCacheProvider: React.FC<EmotionCacheProviderProps> = ({ children }) => {
  const emotionCache = useMemo(() => createEmotionCacheIfNeeded(), []);

  if (!emotionCache) {
    return <>{children}</>;
  }

  return <CacheProvider value={emotionCache}>{children}</CacheProvider>;
};
