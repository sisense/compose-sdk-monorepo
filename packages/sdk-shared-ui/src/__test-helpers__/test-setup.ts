import { vi } from 'vitest';

// Mock ResizeObserver for tests since it's not available in jsdom
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));
