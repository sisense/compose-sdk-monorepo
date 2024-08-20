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
};

export const SisenseContext = createContext<SisenseContextPayload>({
  isInitialized: false,
  tracking: {
    enabled: true,
    packageName: 'sdk-ui',
  },
});

export const useSisenseContext = () => useContext(SisenseContext);
