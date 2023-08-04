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
import { writeTypescript } from '@sisense/sdk-modeling';
import { writeFileSync } from 'fs';
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

function writeFile(dataModel: DataModel, type: 'ts' | 'json', filename?: string) {
  return new Promise((resolve, reject) => {
    // setting default if filename is not provided
    filename = filename || `./${dataModel.name}.${type}`;
    // adding extension if not provided
    filename = path.extname(filename) ? filename : `${filename}.${type}`;

    try {
      console.log(`Writing '${filename}'... `);

      if (type === 'json') {
        writeFileSync(filename, JSON.stringify(dataModel, null, '    '), 'utf-8');
      } else if (type === 'ts') {
        writeTypescript(dataModel, { filename });
      } else {
        throw new Error(`Invalid file type: ${type}`);
      }
      console.log(`OK!\r\n`);
      resolve(true);
    } catch (err) {
      console.log(`Error writing file. Reason: ${err}\r\n`);
      reject();
    }
  });
}

export { getHttpClient, createDataModel, rewriteDataModel, writeFile };
