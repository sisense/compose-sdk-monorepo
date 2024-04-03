import { SisenseContextProvider, SisenseContextProviderProps } from '@/index';
import { useSisenseContext } from '@/sisense-context/sisense-context';
import { sisenseContextProviderProps } from '@/__demo__/sisense-context-provider-props';
import { FormControlLabel, Paper, Switch } from '@mui/material';
import React from 'react';

export function withCachingSwitcher<T extends React.ComponentType<any>>(Component: T): T {
  const WrappedComponent = (props: React.ComponentProps<T>) => {
    const { app } = useSisenseContext();
    const isCacheAlreadyEnabled = app?.settings.queryCacheConfig?.enabled ?? false;
    const [shouldCacheBeEnabled, setShouldCacheBeEnabled] = React.useState(isCacheAlreadyEnabled);

    const sisenseContextProviderPropsWithEnabledCaching: SisenseContextProviderProps = {
      ...sisenseContextProviderProps,
      appConfig: {
        ...sisenseContextProviderProps.appConfig,
        queryCacheConfig: { enabled: shouldCacheBeEnabled },
      },
    };

    return (
      <div>
        <FormControlLabel
          control={
            <Switch
              checked={shouldCacheBeEnabled}
              onChange={(e) => setShouldCacheBeEnabled(e.target.checked)}
              name="cacheSwitch"
            />
          }
          label="Use caching"
        />
        <br />
        <Paper style={{ padding: '16px' }}>
          {shouldCacheBeEnabled ? (
            <SisenseContextProvider {...sisenseContextProviderPropsWithEnabledCaching}>
              <Component {...props} />
            </SisenseContextProvider>
          ) : (
            <Component {...props} />
          )}
        </Paper>
      </div>
    );
  };

  // Set the display name to the original component's name
  WrappedComponent.displayName = Component.displayName || Component.name;

  return WrappedComponent as T;
}
