import { createContext, useContext } from 'react';
import { ClientApplication } from '../app/client-application';
import { TrackingEventDetails } from '@sisense/sdk-tracking';
import { SisenseContextProviderProps } from '..';

export type SisenseContextPayload = {
  isInitialized: boolean;
  app?: ClientApplication;
  tracking: {
    enabled: boolean;
    packageName: string;
    onTrackingEvent?: (payload: TrackingEventDetails) => void;
  };
  errorBoundary: {
    showErrorBox: boolean;
    onError?: SisenseContextProviderProps['onError'];
  };
};

export const SisenseContext = createContext<SisenseContextPayload>({
  isInitialized: false,
  tracking: {
    enabled: true,
    packageName: 'sdk-ui',
  },
  errorBoundary: {
    showErrorBox: true,
  },
});

export const useSisenseContext = () => useContext(SisenseContext);
