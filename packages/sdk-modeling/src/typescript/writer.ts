/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import {
  BaseMeasure,
  DateDimension,
  Dimension,
  DimensionalDataModel,
  Element,
  MeasureTemplate,
  MetadataTypes,
} from '@sisense/sdk-data';
import { createWriteStream } from 'fs';
import path from 'path';

import { compileTsCode } from './utils/compile-ts-code.js';
import { createInMemoryDuplexStream } from './utils/create-in-memory-duplex-stream.js';
import { formatCode } from './utils/format-code.js';
import { ElementWriter, NEWLINE } from './writers/base.js';
import { DataSourceWriter } from './writers/datasource.js';
import { DateDimensionWriter, DimensionWriter } from './writers/dimensions.js';
import { ImportsWriter } from './writers/imports.js';
import { Writer } from './writers/interfaces.js';
import { BaseMeasureWriter, MeasureTemplateWriter } from './writers/measures.js';

function getMetadataWriter(item: Element): ElementWriter<any> {
  if (MetadataTypes.isDateDimension(item.type)) {
    return new DateDimensionWriter(<DateDimension>item, false);
  } else if (MetadataTypes.isDimension(item.type)) {
    return new DimensionWriter(<Dimension>item, false);
  } else if (MetadataTypes.isMeasureTemplate(item)) {
    return new MeasureTemplateWriter(<MeasureTemplate>item, false);
  } else if (MetadataTypes.isCalculatedMeasure(item)) {
    throw 'not implemented'; //return new SCalculatedMeasure(<CalculatedMeasure>item);
  } else if (MetadataTypes.isBaseMeasure(item)) {
    return new BaseMeasureWriter(<BaseMeasure>item, false);
  }

  throw 'unsupported metadata type';
}

type WriteConfig = {
  filename: string;
  dir?: string;
  datamodule?: string;
};

function fillStreamWithTsCode(stream: NodeJS.WritableStream, json: any, config: WriteConfig) {
  // generating a dimensional data model from the input json
  const dm = DimensionalDataModel.fromConfig(json);

  const writers: Writer[] = [];
  writers.push(new ImportsWriter(dm.dataSource, config.datamodule));
  writers.push(new DataSourceWriter(dm.dataSource));
  for (const metadataItem of dm.metadata) {
    writers.push(getMetadataWriter(metadataItem));
  }

  for (const writer of writers) {
    stream.write(NEWLINE);
    writer.write(stream, 0);
    stream.write(NEWLINE);
  }
  return stream;
}

export async function writeTypescript(json: any, config: WriteConfig) {
  if (!config.filename) {
    throw new Error('filename must be specified');
  }
  const filePath = path.join(config.dir || '', `${config.filename}.ts`);
  const fileStream = createWriteStream(filePath, { encoding: 'utf-8' });
  const tsCodeStream = createInMemoryDuplexStream();
  fillStreamWithTsCode(tsCodeStream, json, config);
  tsCodeStream.end();
  const unformattedTsCode = tsCodeStream.getStringData();
  const tsCode = await formatCode(unformattedTsCode, 'ts');
  fileStream.write(tsCode);
  fileStream.end();

  return new Promise<void>((resolve) => {
    fileStream.on('finish', () => {
      resolve();
    });
  });
}

export async function writeJavascript(json: any, config: WriteConfig) {
  if (!config.filename) {
    throw new Error('filename must be specified');
  }
  const tsCodeStream = createInMemoryDuplexStream();
  const jsFilePath = path.join(config.dir || '', `${config.filename}.js`);
  const dtsFilePath = path.join(config.dir || '', `${config.filename}.d.ts`);
  const jsFileStream = createWriteStream(jsFilePath, { encoding: 'utf-8' });
  const dtsFileStream = createWriteStream(dtsFilePath, { encoding: 'utf-8' });
  fillStreamWithTsCode(tsCodeStream, json, config);
  tsCodeStream.end();
  const tsCode = tsCodeStream.getStringData();
  const { jsCode: unformattedJsCode, typeDefs: unformattedTypeDefs } = compileTsCode(tsCode);
  const [jsCode, typeDefs] = await Promise.all([
    formatCode(unformattedJsCode, 'js'),
    formatCode(unformattedTypeDefs, 'ts'),
  ]);
  jsFileStream.write(jsCode);
  dtsFileStream.write(typeDefs);

  jsFileStream.end();
  dtsFileStream.end();

  return Promise.all([
    new Promise<void>((resolve) => {
      jsFileStream.on('finish', () => {
        resolve();
      });
    }),
    new Promise<void>((resolve) => {
      dtsFileStream.on('finish', () => {
        resolve();
      });
    }),
  ]);
}
