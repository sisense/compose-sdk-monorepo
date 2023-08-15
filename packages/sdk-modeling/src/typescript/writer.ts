/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { createWriteStream } from 'fs';
import path from 'path';

import {
  BaseMeasure,
  DimensionalDataModel,
  Dimension,
  DateDimension,
  MetadataTypes,
  Element,
  MeasureTemplate,
} from '@sisense/sdk-data';

import { BaseMeasureWriter, MeasureTemplateWriter } from './writers/measures.js';

import { DimensionWriter, DateDimensionWriter } from './writers/dimensions.js';

import { BaseWriter, NEWLINE, indent } from './writers/base.js';
import { createInMemoryDuplexStream } from './utils/create-in-memory-duplex-stream.js';
import { compileTsCode } from './utils/compile-ts-code.js';

function getWriter(item: Element): BaseWriter<any> {
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

  const writers: BaseWriter<any>[] = [];
  for (let i = 0; i < dm.metadata.length; i++) {
    writers.push(getWriter(dm.metadata[i]));
  }

  // writing imports
  const datamodule = config.datamodule || '@sisense/sdk-data';
  stream.write(`import {\
${NEWLINE}${indent(1)}Dimension,\
${NEWLINE}${indent(1)}DateDimension,\
${NEWLINE}${indent(1)}Attribute,\
${NEWLINE}${indent(1)}createAttribute,\
${NEWLINE}${indent(1)}createDateDimension,\
${NEWLINE}${indent(1)}createDimension,${NEWLINE}} from '${datamodule}';${NEWLINE}${NEWLINE}`);

  stream.write(`export const DataSource = '${dm.dataSource}';${NEWLINE}`);

  for (let i = 0; i < writers.length; i++) {
    stream.write(NEWLINE);
    writers[i].write(stream, 0);
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
  tsCodeStream.pipe(fileStream);
  fillStreamWithTsCode(tsCodeStream, json, config);
  tsCodeStream.end();

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
  const { jsCode, typeDefs } = compileTsCode(tsCode);
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
