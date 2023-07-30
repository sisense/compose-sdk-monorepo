/* eslint-disable jest/no-mocks-import */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createDataModel, getHttpClient, rewriteDataModel, writeFile } from './helpers';
import { fieldsECommerce, dimensionalModelECommerce } from '../__mocks__/dataModelECommerce';
import { fieldsOrdersDB, dimensionalModelOrdersDB } from '../__mocks__/dataModelOrdersDB';
import { HttpClient } from '@sisense/sdk-rest-client';
import fs from 'fs';
import { DataModel } from '@sisense/sdk-data';
import { writeTypescript } from '@sisense/sdk-modeling';

jest.mock('@sisense/sdk-modeling', () => ({
  writeTypescript: jest.fn(),
}));

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

  describe('writeFile', () => {
    fs.writeFileSync = jest.fn();

    const fakeDataModel = { name: 'fakeDataModel' } as DataModel;

    describe('json type', () => {
      it("should generate a filename if it's not provided for", () => {
        writeFile(fakeDataModel, 'json');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          './fakeDataModel.json',
          expect.anything(),
          expect.anything(),
        );
      });

      it('should generate a file extension if not provided', () => {
        writeFile(fakeDataModel, 'json', './no-extension-file');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          './no-extension-file.json',
          expect.anything(),
          expect.anything(),
        );
      });

      it('should not add file extension if one is provided', () => {
        writeFile(fakeDataModel, 'json', './file.txt');
        expect(fs.writeFileSync).toHaveBeenCalledWith(
          './file.txt',
          expect.anything(),
          expect.anything(),
        );
      });
    });

    describe('ts type', () => {
      it("should generate a filename if it's not provided for", () => {
        writeFile(fakeDataModel, 'ts');
        expect(writeTypescript).toHaveBeenCalledWith(expect.anything(), {
          filename: './fakeDataModel.ts',
        });
      });

      it('should generate a file extension if not provided', () => {
        writeFile(fakeDataModel, 'ts', './no-extension-file');
        expect(writeTypescript).toHaveBeenCalledWith(expect.anything(), {
          filename: './no-extension-file.ts',
        });
      });

      it('should not add file extension if one is provided', () => {
        writeFile(fakeDataModel, 'ts', './file.txt');
        expect(writeTypescript).toHaveBeenCalledWith(expect.anything(), {
          filename: './file.txt',
        });
      });
    });
  });
});
