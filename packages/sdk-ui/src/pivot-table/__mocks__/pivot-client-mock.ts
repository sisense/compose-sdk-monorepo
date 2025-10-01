/* eslint-disable no-unused-vars */
/* eslint-disable sonarjs/no-identical-functions */
import React from 'react';
import { PivotClient } from '@ethings-os/sdk-pivot-client';

// Mock of PivotBuilder class
class MockPivotBuilder {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  off(eventName: string, callback: (...args: any[]) => void) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter((cb) => cb !== callback);
    }
  }

  emit(eventName: string, ...args: any[]) {
    if (this.listeners[eventName]) {
      this.listeners[eventName].forEach((callback) => callback(...args));
    }
  }

  render(props: any) {
    // Mock render method - does not actually render anything
    // Simulate emitting a proper React element instead of a string
    const mockElement = React.createElement(
      'div',
      { 'data-testid': 'mocked-pivot-table' },
      'Mocked Pivot Table',
    );
    setTimeout(() => {
      this.emit('pivotElementChange', mockElement);
    }, 0);
  }

  updateJaql(jaql: any) {
    // Mock updateJaql method
    setTimeout(() => {
      this.emit('queryStart');
      // Simulate query end with empty metadata
      setTimeout(() => {
        this.emit('queryEnd', { cellsMetadata: null });
      }, 10);
    }, 0);
  }

  updateDataService(dataService: any) {
    // Mock updateDataService method
  }

  destroy() {
    // Mock destroy method
    this.listeners = {};
  }
}

// Mock of DataService class
class MockDataService {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  on(eventName: string, callback: (...args: any[]) => void) {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }

  off(eventName: string, callback: (...args: any[]) => void) {
    if (this.listeners[eventName]) {
      this.listeners[eventName] = this.listeners[eventName].filter((cb) => cb !== callback);
    }
  }

  destroy() {
    // Mock destroy method
    this.listeners = {};
  }
}

// Create a mocked PivotClient
export const createMockPivotClient = () => {
  return {
    preparePivotBuilder: vi.fn(() => new MockPivotBuilder()),
    prepareDataService: vi.fn(() => new MockDataService()),
    queryData: vi.fn(),
    socketBuilder: {
      socket: {},
    },
  } as unknown as PivotClient;
};
