/* eslint-disable jest/no-mocks-import */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { write } from './writer';
import {
  dimensionalModelECommerce,
  generatedModelECommerce,
} from '../__mocks__/dataModelECommerce';
import { Writable } from 'stream';

// A class for mocking fs.createWriteStream.
// It writes content to a buffer instead of to a file
// Adapted from https://bensmithgall.com/blog/jest-mock-trick
class WriteMemory extends Writable {
  buffer: string;

  constructor() {
    super();
    this.buffer = '';
  }

  _write(chunk: any, encoding: BufferEncoding, next: any) {
    this.buffer += chunk;
    next();
  }

  reset() {
    this.buffer = '';
  }
}

const mockWriteStream = new WriteMemory();

jest.mock('fs', () => {
  const originalModule = jest.requireActual('fs');

  // Mock named export 'createWriteStream'
  return {
    __esModule: true,
    ...originalModule,
    createWriteStream: jest.fn().mockImplementation(() => {
      mockWriteStream.reset();
      return mockWriteStream;
    }),
  };
});

describe('write', () => {
  it('should generate data model file', () => {
    write(dimensionalModelECommerce, { filename: 'NonExistent.ts' });
    expect(mockWriteStream.buffer).toEqual(generatedModelECommerce);
  });
});
