/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { DataSourceInfo } from '@ethings-os/sdk-data';
import { Writable } from 'stream';

import { dimensionalModelECommerce } from '../__mocks__/data-model-ecommerce.js';
import { writeJavascript, writeTypescript } from './writer.js';

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

let mockWriteStream = new WriteMemory();

vi.mock('fs', async () => {
  const originalModule = await vi.importActual<typeof import('fs')>('fs');

  // Mock named export 'createWriteStream'
  return {
    __esModule: true,
    ...originalModule,
    createWriteStream: vi.fn().mockImplementation(() => mockWriteStream),
  };
});

describe('writer', () => {
  beforeEach(() => {
    mockWriteStream = new WriteMemory();
  });
  describe('writeTypescript', () => {
    it('should generate data model file as TypeScript file', async () => {
      await writeTypescript(dimensionalModelECommerce, { filename: 'some-model' });
      const generatedCode = mockWriteStream.buffer;
      expect(generatedCode).toMatchSnapshot();
    });
    it('should generate data model file as TypeScript file (dataSource defined as DataSourceInfo)', async () => {
      const dataSourceInfo: DataSourceInfo = {
        title: dimensionalModelECommerce.dataSource,
        type: 'elasticube',
      };
      const model = {
        ...dimensionalModelECommerce,
        dataSource: dataSourceInfo,
      };
      await writeTypescript(model, { filename: 'some-model' });
      const generatedCode = mockWriteStream.buffer;
      expect(generatedCode).toMatchSnapshot();
    });
    it('should throw an error if filename is not specified', async () => {
      await expect(
        writeTypescript(dimensionalModelECommerce, {} as { filename: string }),
      ).rejects.toThrow('filename must be specified');
    });
  });

  describe('writeJavascript', () => {
    it('should generate JS and TS definition files', async () => {
      await writeJavascript(dimensionalModelECommerce, { filename: 'some-model' });
      // both .js and .d.ts files written to the same buffer
      const generatedCode = mockWriteStream.buffer;
      expect(generatedCode).toMatchSnapshot();
    });

    it('should throw an error if filename is not specified', async () => {
      await expect(
        writeJavascript(dimensionalModelECommerce, {} as { filename: string }),
      ).rejects.toThrow('filename must be specified');
    });
  });
});
