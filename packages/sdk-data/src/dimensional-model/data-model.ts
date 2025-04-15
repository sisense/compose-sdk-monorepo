/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { DataSource, DataSourceInfo } from '../interfaces.js';
import { TranslatableError } from '../translation/translatable-error.js';
import { DimensionalElement } from './base.js';
import { create } from './factory.js';
import { DataModel, Element } from './interfaces.js';

/**
 * @internal
 */
export class DimensionalDataModel implements DataModel {
  static fromConfig(config: any): DimensionalDataModel {
    if (config && !config.name) {
      throw new TranslatableError('errors.dataModel.noName');
    }

    if (config && !config.metadata) {
      throw new TranslatableError('errors.dataModel.noMetadata');
    }

    const metadata = new Array<Element>();

    for (let i = 0; i < config.metadata.length; i++) {
      metadata.push(<DimensionalElement>create(config.metadata[i]));
    }

    return new DimensionalDataModel(config.name, config.dataSource, metadata);
  }

  constructor(name: string, dataSource: DataSourceInfo, metadata: Element[]) {
    this.name = name;
    this.dataSource = dataSource;
    this.metadata = metadata;

    let key;
    for (let i = 0; i < metadata.length; i++) {
      key = metadata[i].name;

      if (this[metadata[i].name]) {
        key = `${key} (${Math.random()})`;
      }

      this[key] = metadata[i];
    }
  }

  readonly name: string;

  readonly dataSource: DataSource;

  readonly metadata: Element[];

  [propName: string]: any;
}
