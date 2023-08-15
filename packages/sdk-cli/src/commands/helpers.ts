/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  HttpClient,
  getAuthenticator,
  WatAuthenticator,
  BearerAuthenticator,
} from '@sisense/sdk-rest-client';
import { DataModel, MetadataTypes } from '@sisense/sdk-data';
import { writeTypescript, writeJavascript } from '@sisense/sdk-modeling';
import path from 'path';
import { DimensionalQueryClient } from '@sisense/sdk-query-client';
import { PKG_VERSION } from '../package-version.js';
import { trackCliError } from '@sisense/sdk-common';

function getHttpClient(
  url: string,
  username?: string,
  password?: string,
  token?: string,
  wat?: string,
): HttpClient {
  const auth = getAuthenticator(url, username, password, token, wat, false);
  if (!auth) {
    throw new Error('Invalid authentication method');
  }
  return new HttpClient(url, auth, 'sdk-cli' + (PKG_VERSION ? `-${PKG_VERSION}` : ''));
}

export const handleHttpClientLogin = async (httpClient: HttpClient) => {
  console.log('Logging in... ');

  try {
    const isLoggedIn = await httpClient.login();
    if (!isLoggedIn) {
      console.log(
        `Failed. ${
          httpClient.auth instanceof WatAuthenticator ||
          httpClient.auth instanceof BearerAuthenticator
            ? 'Double-check your token'
            : 'Wrong credentials'
        }.\r\n`,
      );
    }
    console.log('OK!\r\n');
    console.log('Getting fields... ');
  } catch (err) {
    console.log(`Error connecting to ${httpClient.url}. \r\n${err}\r\n`);
    return Promise.reject();
  }

  return Promise.resolve();
};

/**
 * Create a data model for a Sisense data source
 */
async function createDataModel(httpClient: HttpClient, dataSource: string): Promise<DataModel> {
  const queryClient = new DimensionalQueryClient(httpClient);

  try {
    return await queryClient.getDataSourceFields(dataSource).then((fields) => {
      console.log('OK!\r\n');
      const dataModel = {
        name: dataSource,
        dataSource: dataSource,
        metadata: fields,
      };

      return rewriteDataModel(dataModel);
    });
  } catch (err) {
    trackCliError(
      {
        packageVersion: PKG_VERSION,
        component: 'createDataModel',
        error: err as Error | string,
      },
      httpClient,
    ).catch(() => {});
    console.log(`Error fetching metadata. Reason: ${err}\r\n`);
    return Promise.reject();
  }
}

function rewriteDataModel(dataModel: any): DataModel {
  console.log(`Cleaning metadata... `);
  dataModel.metadata = (dataModel.metadata as any[])
    .filter((item) => !item.dimensionTable)
    .map((item) => {
      const result = {
        name: item.title,
        expression: item.id,
        type: MetadataTypes.Dimension,
        group: undefined,
      };

      result.group = item.table;

      switch (item.dimtype) {
        case 'text':
          result.type = MetadataTypes.TextAttribute;
          break;

        case 'numeric':
          result.type = MetadataTypes.NumericAttribute;
          break;

        case 'datetime':
          result.type = MetadataTypes.DateDimension;
          break;
      }

      return result;
    });

  console.log('OK!\r\n');

  console.log(`Grouping metadata... `);
  const grouped = dataModel.metadata.reduce((r: any, a: any) => {
    if (!r[a.group]) {
      r[a.group] = {
        name: a.group,
        type: MetadataTypes.Dimension,
        dimensions: [],
        attributes: [],
      };
    }

    // If the field is date, model it as a date dimension
    // otherwise, model the field as a dimension attribute.
    if (a.type === MetadataTypes.DateDimension) {
      r[a.group].dimensions.push(a);
    } else {
      r[a.group].attributes.push(a);
    }

    delete a.group;

    return r;
  }, {});

  dataModel.metadata = Object.values(grouped);

  console.log('OK!\r\n');

  return dataModel;
}

async function writeFile(dataModel: DataModel, outputFilePathInfo: SupportedOutputFilePathInfo) {
  const { dir, baseName, extension } = outputFilePathInfo;
  try {
    console.log(`Writing '${getFullFilePath(outputFilePathInfo)}'...`);
    if (extension === '.ts') {
      await writeTypescript(dataModel, { filename: baseName, dir });
    } else if (extension === '.js') {
      await writeJavascript(dataModel, { filename: baseName, dir });
      // Currently, we don't allow writing JSON files. Can be uncommented in the future to enable supporting JSON.
      // } else if (extension === '.json') {
      //   writeFileSync(outputFileName, JSON.stringify(dataModel, null, '    '), 'utf-8');
      // }
    }
    console.log(`OK!\r\n`);
  } catch (err) {
    console.log(`Error writing file. Reason: ${err}\r\n`);
    throw err;
  }
}

export type FilePathInfo = { dir: string; baseName: string; extension: string };

/**
 * Gets the directory, base name, and extension of a file path.
 * If the file path is not provided, the default values are used.
 */
function getFilePathInfo({
  filePath,
  defaultBaseName,
  defaultFileExtension,
}: {
  filePath?: string;
  defaultFileExtension: SupportedOutputFileExtension;
  defaultBaseName: string;
}): FilePathInfo {
  const dir = filePath ? path.dirname(filePath) : '.';
  const extension = filePath ? getExtension(filePath, defaultFileExtension) : defaultFileExtension;
  const baseName = filePath ? path.basename(filePath, extension) : defaultBaseName;
  return { dir, baseName, extension };
}

function getExtension(filePath: string, defaultFileExtension: string): string {
  const extname = path.extname(filePath);
  if (extname === '') {
    return defaultFileExtension;
  } else {
    return extname;
  }
}

function getFullFilePath(filePathInfo: FilePathInfo) {
  return path.join(filePathInfo.dir, filePathInfo.baseName + filePathInfo.extension);
}

export type SupportedOutputFileExtension = '.ts' | '.js';
export type SupportedOutputFilePathInfo = FilePathInfo & {
  extension: SupportedOutputFileExtension;
};

function isSupportedOutputFile(
  filePathInfo: FilePathInfo,
): filePathInfo is SupportedOutputFilePathInfo {
  return ['.ts', '.js'].includes(filePathInfo.extension);
}

export {
  getHttpClient,
  createDataModel,
  rewriteDataModel,
  writeFile,
  getFilePathInfo,
  isSupportedOutputFile,
};
