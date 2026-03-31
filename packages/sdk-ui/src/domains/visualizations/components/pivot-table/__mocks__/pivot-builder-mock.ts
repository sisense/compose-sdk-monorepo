import React from 'react';

// Mock of PivotBuilder class
export class PivotBuilderMock {
  private listeners: Record<string, Array<(...args: any[]) => void>> = {};

  defaultPageSize = 50;

  pageSize = 50;

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

  render() {
    // Mock render method - creates a placeholder pivot body inside the real region wrapper
    const mockElement = React.createElement(
      'div',
      { 'data-testid': 'mock-pivot-element' },
      'Mocked Pivot Table',
    );
    setTimeout(() => {
      this.emit('pivotElementChange', mockElement);
    }, 0);
  }

  updateJaql() {
    // Mock updateJaql method
    setTimeout(() => {
      this.emit('queryStart');
      // Simulate query end with empty metadata for empty results
      setTimeout(() => {
        this.emit('queryEnd', { cellsMetadata: null });
      }, 10);
    }, 0);
  }

  updateDataService() {
    // Mock updateDataService method
  }

  updatePageSize(pageSize: number) {
    this.pageSize = pageSize;
  }

  destroy() {
    // Mock destroy method
    this.listeners = {};
  }
}
