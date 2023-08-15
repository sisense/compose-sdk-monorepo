/* eslint-disable @typescript-eslint/no-throw-literal */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
import { createWriteStream } from 'fs';

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

export function write(json: any, config: any) {
  if (!config.filename) {
    throw new Error('filename must be specified');
  }

  // generating a dimensional data model from the input json
  const dm = DimensionalDataModel.fromConfig(json);

  const writers: BaseWriter<any>[] = [];
  for (let i = 0; i < dm.metadata.length; i++) {
    writers.push(getWriter(dm.metadata[i]));
  }

  const stream = createWriteStream(config.filename, { encoding: 'utf-8' });

  //
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

  // close the stream
  stream.end();
}
