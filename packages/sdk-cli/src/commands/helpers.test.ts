import { DataModel, DataSourceField } from '@sisense/sdk-data';
import { writeJavascript, writeTypescript } from '@sisense/sdk-modeling';
import { HttpClient } from '@sisense/sdk-rest-client';
import { Mocked } from 'vitest';

import {
  dataSourceSchemaECommerce,
  dimensionalModelECommerce,
  dimensionalModelECommerceWithFieldDescriptions,
  fieldsECommerce,
} from '../__mocks__/data-model-ecommerce.js';
import { dimensionalModelOrdersDB, fieldsOrdersDB } from '../__mocks__/data-model-orders-db.js';
import { dataSources } from '../__mocks__/data-sources.js';
import {
  addDescriptionToFields,
  createDataModel,
  FilePathInfo,
  getFilePathInfo,
  getHttpClient,
  isSupportedOutputFile,
  rewriteDataModel,
  writeFile,
} from './helpers.js';

vi.mock('@sisense/sdk-modeling', () => ({
  writeTypescript: vi.fn(),
  writeJavascript: vi.fn(),
}));

describe('helpers', () => {
  describe('createDataModel', () => {
    let httpClient: Mocked<HttpClient>;
    const consoleLogSpy = vi.spyOn(console, 'log');

    beforeEach(() => {
      // Initialize the httpClient and queryApi for each test
      httpClient = {
        url: 'http://test.sisense.com',
        post: vi.fn(),
        get: vi.fn(),
      } as unknown as Mocked<HttpClient>;

      consoleLogSpy.mockClear();
    });

    afterEach(() => {
      vi.clearAllMocks();
    });

    it('createDataModel helper is a function', () => {
      expect(createDataModel).toBeDefined();
      expect(typeof createDataModel === 'function').toBe(true);
    });

    it('should create data model', async () => {
      httpClient.get
        .mockResolvedValueOnce(dataSources)
        .mockResolvedValueOnce(dataSourceSchemaECommerce);
      httpClient.post.mockResolvedValue(fieldsECommerce.metadata);
      const dataModel = await createDataModel(httpClient, 'Sample ECommerce');
      expect(dataModel).toEqual(dimensionalModelECommerceWithFieldDescriptions);
    });

    it('should throw error and suggestion for similar data source title', async () => {
      httpClient.get.mockResolvedValue(dataSources);
      httpClient.post.mockResolvedValue(undefined); // required for error reporting
      const dataModel = createDataModel(httpClient, 'Sample ECommerc');

      // Assert
      await expect(dataModel).rejects.toBeUndefined();
      expect(consoleLogSpy).toHaveBeenLastCalledWith(
        `Error fetching metadata. Reason: Error: Data source 'Sample ECommerc' not found. Did you mean 'Sample ECommerce'?\r\n`,
      );
    });

    it('should handle empty schema', async () => {
      httpClient.get.mockResolvedValueOnce(dataSources).mockResolvedValueOnce(undefined);
      httpClient.post.mockResolvedValue(fieldsECommerce.metadata);
      const dataModel = await createDataModel(httpClient, 'Sample ECommerce');
      expect(dataModel.name).toEqual(fieldsECommerce.name);
    });
  });

  describe('getHttpClient', () => {
    const fakeUsername = 'username';
    const fakePassword = 'password';
    const fakeDeploymentUrl = 'https://10.0.0.1';

    it('should return HttpClient', () => {
      const httpClient = getHttpClient({
        url: fakeDeploymentUrl,
        username: fakeUsername,
        password: fakePassword,
      });
      expect(httpClient).toBeInstanceOf(HttpClient);
    });

    it('should throw error', () => {
      expect(() => {
        getHttpClient({ url: fakeDeploymentUrl });
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

  describe('addDescriptionToFields', () => {
    it('should add descriptions to fields based on schema data', () => {
      const fields = [
        { table: 'Table1', column: 'Column1' },
        { table: 'Table2', column: 'Column2' },
      ] as DataSourceField[];

      const datasets = [
        {
          schema: {
            tables: [
              {
                name: 'Table1',
                columns: [{ name: 'Column1', description: 'Description1' }],
              },
              {
                name: 'Table2',
                columns: [{ name: 'Column2', description: 'Description2' }],
              },
            ],
          },
        },
      ];

      const expectedResult = [
        { table: 'Table1', column: 'Column1', description: 'Description1' },
        { table: 'Table2', column: 'Column2', description: 'Description2' },
      ];

      expect(addDescriptionToFields(fields, datasets)).toEqual(expectedResult);
    });
  });
});
