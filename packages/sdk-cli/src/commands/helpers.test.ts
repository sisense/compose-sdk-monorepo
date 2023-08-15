import {
  createDataModel,
  FilePathInfo,
  getFilePathInfo,
  getHttpClient,
  isSupportedOutputFile,
  rewriteDataModel,
  writeFile,
} from './helpers.js';
import { fieldsECommerce, dimensionalModelECommerce } from '../__mocks__/dataModelECommerce.js';
import { fieldsOrdersDB, dimensionalModelOrdersDB } from '../__mocks__/dataModelOrdersDB.js';
import { HttpClient } from '@sisense/sdk-rest-client';
import { DataModel } from '@sisense/sdk-data';
import { writeJavascript, writeTypescript } from '@sisense/sdk-modeling';

vi.mock('@sisense/sdk-modeling', () => ({
  writeTypescript: vi.fn(),
  writeJavascript: vi.fn(),
}));

describe('helpers', () => {
  describe('createDataModel', () => {
    it('createDataModel helper is a function', () => {
      expect(createDataModel).toBeDefined();
      expect(typeof createDataModel === 'function').toBe(true);
    });
  });

  describe('getHttpClient', () => {
    const fakeUsername = 'username';
    const fakePassword = 'password';
    const fakeDeploymentUrl = '10.0.0.1';

    it('should return HttpClient', () => {
      const httpClient = getHttpClient(
        fakeDeploymentUrl,
        fakeUsername,
        fakePassword,
        undefined,
        undefined,
      );
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it('should throw error', () => {
      expect(() => {
        getHttpClient(fakeDeploymentUrl, undefined, undefined, undefined, undefined);
      }).toThrow();
    });
  });

  describe('rewriteDataModel', () => {
    it('should clean and group simple data model', () => {
      expect(rewriteDataModel(fieldsECommerce)).toEqual(dimensionalModelECommerce);
    });

    it('should clean and group complex data model', () => {
      expect(rewriteDataModel(fieldsOrdersDB)).toEqual(dimensionalModelOrdersDB);
    });
  });
  describe('writeFile', () => {
    const fakeDataModel = { name: 'fakeDataModel' } as DataModel;

    describe('writing TypeScript', () => {
      it("should call 'writeTypescript' function with filename without extension", async () => {
        await writeFile(fakeDataModel, { baseName: 'MyDataModel', dir: '.', extension: '.ts' });
        expect(writeTypescript).toHaveBeenCalledWith(expect.anything(), {
          filename: 'MyDataModel',
          dir: '.',
        });
      });
    });

    describe('writing JavaScript', () => {
      it("should call 'writeJavascript' function with filename and dir", async () => {
        await writeFile(fakeDataModel, {
          baseName: 'MyDataModel',
          dir: '../js-project',
          extension: '.js',
        });
        expect(writeJavascript).toHaveBeenCalledWith(expect.anything(), {
          filename: 'MyDataModel',
          dir: '../js-project',
        });
      });
    });
  });

  describe('getFilePathInfo', () => {
    it('should return default file path info when no filePath is provided', () => {
      const result = getFilePathInfo({
        defaultFileExtension: '.ts',
        defaultBaseName: 'defaultFile',
      });

      expect(result).toEqual({
        dir: '.',
        baseName: 'defaultFile',
        extension: '.ts',
      });
    });

    it('should correctly parse the provided filePath', () => {
      const result = getFilePathInfo({
        filePath: '/path/to/customFile.js',
        defaultFileExtension: '.ts',
        defaultBaseName: 'defaultFile',
      });

      expect(result).toEqual({
        dir: '/path/to',
        baseName: 'customFile',
        extension: '.js',
      });
    });

    it('should correctly parse the provided filePath with no extension', () => {
      const result = getFilePathInfo({
        filePath: '/path/to/customFile',
        defaultFileExtension: '.ts',
        defaultBaseName: 'defaultFile',
      });

      expect(result).toEqual({
        dir: '/path/to',
        baseName: 'customFile',
        extension: '.ts',
      });
    });
  });

  describe('isSupportedOutputFile', () => {
    it('should return true for supported file extensions', () => {
      const filePathInfo: FilePathInfo = {
        dir: '.',
        baseName: 'file',
        extension: '.ts',
      };

      const result = isSupportedOutputFile(filePathInfo);

      expect(result).toBe(true);
    });

    it('should return false for unsupported file extensions', () => {
      const filePathInfo: FilePathInfo = {
        dir: '.',
        baseName: 'file',
        extension: '.json',
      };

      const result = isSupportedOutputFile(filePathInfo);

      expect(result).toBe(false);
    });
  });
});
