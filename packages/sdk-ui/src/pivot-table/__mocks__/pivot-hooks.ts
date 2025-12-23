import { type PivotClient } from '@sisense/sdk-pivot-ui';
import { vi } from 'vitest';

import { createPivotClientMock } from './pivot-client-mock';

// Mock hooks
export const usePivotClientMock = vi.fn(() => createPivotClientMock());
export const usePivotBuilderMock = vi.fn((options: { pivotClient: PivotClient }) => {
  return options.pivotClient.preparePivotBuilder();
});
