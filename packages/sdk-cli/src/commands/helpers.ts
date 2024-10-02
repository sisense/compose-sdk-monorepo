import {
  HttpClient,
  getAuthenticator,
  isBearerAuthenticator,
  isWatAuthenticator,
} from '@sisense/sdk-rest-client';
import { DataModel, MetadataTypes } from '@sisense/sdk-data';
import { writeTypescript, writeJavascript } from '@sisense/sdk-modeling';
import path from 'path';
import levenshtein from 'js-levenshtein';
import {
  DataSourceField,
  DataSourceMetadata,
  DimensionalQueryClient,
  QueryClient,
} from '@sisense/sdk-query-client';
import { PKG_VERSION } from '../package-version.js';
import { trackCliError } from '@sisense/sdk-tracking';
import { DataSourceSchemaDataset } from '../types.js';

type HttpClientConfig = {
  url: string;
  username?: string;
  password?: string;
  token?: string;
  wat?: string;
};

function getHttpClient({ url, username, password, token, wat }: HttpClientConfig) {
  const auth = getAuthenticator({ url, username, password, token, wat });
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
          isWatAuthenticator(httpClient.auth) || isBearerAuthenticator(httpClient.auth)
            ? 'Double-check your token'
            : 'Wrong credentials'
        }.\r\n`,
      );
    }
    console.log('OK!\r\n');
  } catch (err) {
    console.log(`Error connecting to ${httpClient.url}. \r\n${err}\r\n`);
    throw err;
  }
};

async function retrieveDataSource(
  queryClient: QueryClient,
  dataSourceTitle: string,
): Promise<DataSourceMetadata> {
  console.log('Getting data source... ');
  const dataSourceList = await queryClient.getDataSourceList();

  let minDistance = Number.MAX_SAFE_INTEGER;
  let minDistanceDataSource: DataSourceMetadata = {
    title: dataSourceTitle,
    live: false,
    fullname: '',
  };

  dataSourceList.forEach((dataSource) => {
    const title = dataSource.title;
    const fullName = dataSource.fullname;

    if (title === dataSourceTitle || dataSourceTitle === fullName) {
      minDistanceDataSource = dataSource;
      minDistance = 0;
    } else {
      // get the most matching data source by comparing levenshtein distance on the title
      const distance = levenshtein(dataSourceTitle, title);
      if (distance < minDistance) {
        minDistance = distance;
        minDistanceDataSource = dataSource;
      }
    }
  });

  if (minDistance === 0) {
    console.log('OK!\r\n');
    return minDistanceDataSource;
  }

  throw new Error(
    `Data source '${dataSourceTitle}' not found. ${
      minDistance <= 3 ? `Did you mean '${minDistanceDataSource.title}'?` : ''
    }`,
  );
}

async function retrieveDataFields(
  queryClient: QueryClient,
  dataSourceTitle: string,
): Promise<DataSourceField[]> {
  console.log('Getting fields... ');

  const fields = await queryClient.getDataSourceFields(dataSourceTitle);

  try {
    // get the schema of the data source to add descriptions to the fields
    const dataSourceSchema = await queryClient.getDataSourceSchema(dataSourceTitle);
    return dataSourceSchema?.datasets
      ? addDescriptionToFields(fields, dataSourceSchema.datasets as DataSourceSchemaDataset[])
      : fields;
  } catch (error) {
    if ((error as { status: string }).status === '404' && fields.length) {
      return fields;
    }
    if ((error as { status: string }).status === '403') {
      // the caller may not have permission to access this data source
      console.log(
        `Note: Field descriptions are omitted from the data model due to restricted role of your account`,
      );
    } else {
      throw error;
    }
  } finally {
    console.log('OK!\r\n');
  }

  return fields;
}

function combineDataSourceAndDataFields(
  dataSource: DataSourceMetadata,
  dataFields: DataSourceField[],
) {
  return {
    name: dataSource.title,
    dataSource: {
      title: dataSource.title,
      type: dataSource.live ? 'live' : 'elasticube',
    },
    metadata: dataFields,
  };
}

/**
 * Create a data model for a Sisense data source
 */
async function createDataModel(
  httpClient: HttpClient,
  dataSourceTitle: string,
): Promise<DataModel> {
  const queryClient = new DimensionalQueryClient(httpClient);

  try {
    const dataSource = await retrieveDataSource(queryClient, dataSourceTitle);

    const dataFields = await retrieveDataFields(queryClient, dataSource.fullname);

    const rawDataModel = combineDataSourceAndDataFields(dataSource, dataFields);

    return rewriteDataModel(rawDataModel);
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
        description: item.description,
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

/**
 * Add 'description' property from datasource schema columns to datasource fields
 */
export function addDescriptionToFields(
  fields: DataSourceField[],
  datasets: DataSourceSchemaDataset[],
): DataSourceField[] {
  const schemaDataDescriptionsMap = datasets.reduce((map, dataset) => {
    dataset.schema.tables.forEach((table) => {
      map[table.name] = {};
      table.columns.forEach((column) => {
        map[table.name][column.name] = column.description;
      });
    });
    return map;
  }, {});

  return fields.map((field) => ({
    ...field,
    description: schemaDataDescriptionsMap[field.table]?.[field.column] || '',
  }));
}

export {
  getHttpClient,
  createDataModel,
  rewriteDataModel,
  writeFile,
  getFilePathInfo,
  isSupportedOutputFile,
};
