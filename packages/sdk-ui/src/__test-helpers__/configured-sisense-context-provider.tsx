import { mockToken, mockUrl } from '@/__mocks__/msw';
import { SisenseContextProviderProps } from '@/props';
import { SisenseContextProvider } from '@/sisense-context/sisense-context-provider';

const contextProviderProps: SisenseContextProviderProps = {
  url: mockUrl,
  token: mockToken,
  defaultDataSource: 'Sample ECommerce',
  appConfig: {
    queryCacheConfig: { enabled: false },
    trackingConfig: { enabled: false },
  },
};

export const ConfiguredSisenseContextProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  return <SisenseContextProvider {...contextProviderProps}>{children}</SisenseContextProvider>;
};
