import { createContext, useContext } from 'react';
import { ClientApplication } from '../app/client-application';
import { TrackingEventDetails } from '@sisense/sdk-tracking';

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
