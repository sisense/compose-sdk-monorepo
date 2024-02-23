import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';
import * as mockGlobals from '@/__mocks__/data/mock-globals.json';
import * as mockPalettes from '@/__mocks__/data/mock-palettes.json';

export const mockUrl = 'http://fake-url';
export const mockToken = 'fake-token';
export const mockDashboardId = 'fake-dashboard-id';
export const mockWidgetId = 'fake-widget-id';

// Mock common calls made by SisenseContextProvider
const handlers = [
  http.get('*/api/globals', () => HttpResponse.json(mockGlobals)),
  http.get('*/api/palettes/*', () => HttpResponse.json(mockPalettes)),
];

export const server = setupServer(...handlers);

server.events.on('request:start', ({ request }) => {
  console.log('MSW intercepted:', request.method, request.url);
});
