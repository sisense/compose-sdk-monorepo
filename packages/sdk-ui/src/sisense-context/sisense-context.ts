import { createContext, useContext } from 'react';
import { ClientApplication } from '../app/client-application';

export type SisenseContextPayload = {
  isInitialized: boolean;
  app?: ClientApplication;
  tracking: {
    enabled: boolean;
    packageName: string;
  };
};

export const SisenseContext = createContext<SisenseContextPayload>({
  isInitialized: false,
  tracking: {
    enabled: true,
    packageName: 'sdk-ui',
  },
});

export const useSisenseContext = () => useContext(SisenseContext);
