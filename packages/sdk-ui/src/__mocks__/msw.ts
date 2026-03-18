import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

import * as mockAiSettings from '@/__mocks__/data/mock-ai-settings.json';
import * as mockGlobals from '@/__mocks__/data/mock-globals.json';
import * as mockPalettes from '@/__mocks__/data/mock-palettes.json';
import * as mockSystemSettings from '@/__mocks__/data/mock-system-settings.json';

export const mockUrl = 'http://fake-url/';
export const mockToken = 'fake-token';
export const mockDashboardId = 'fake-dashboard-id';
export const mockWidgetId = 'fake-widget-id';

const handlers = [
  // Mock common calls made by SisenseContextProvider
  http.get('*/api/globals', () => HttpResponse.json(mockGlobals)),
  http.get('*/api/palettes/*', () => HttpResponse.json(mockPalettes)),
  http.get('*/api/v1/settings/system', () => HttpResponse.json(mockSystemSettings)),
  http.get('*/api/v2/settings/ai', () => HttpResponse.json(mockAiSettings)),

  // Mock tracking calls
  http.post('*/api/activities', () => new HttpResponse()),
];

export const server = setupServer(...handlers);
