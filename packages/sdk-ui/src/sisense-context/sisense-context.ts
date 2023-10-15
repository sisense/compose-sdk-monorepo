import { createContext, useContext } from 'react';
import { ClientApplication } from '../app/client-application';

export type SisenseContextPayload = {
  isInitialized: boolean;
  app?: ClientApplication;
  enableTracking: boolean;
};

export const SisenseContext = createContext<SisenseContextPayload>({
  isInitialized: false,
  enableTracking: true,
});

export const useSisenseContext = () => useContext(SisenseContext);
