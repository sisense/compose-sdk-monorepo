import {
  DimensionMetadata,
  DimensionTarget,
  DimensionOptions,
  MeasureOptions,
  MeasureMetadata,
  Metadata,
  Target,
  ValueTarget,
} from './types.js';
import { PluginsPanelFields } from '../../constants.js';

/**
 * Validate metadata by target type
 *
 * @param {DimensionTarget | ValueTarget} target - object of target rules
 * @param {Array<DimensionMetadata | MeasureMetadata>} metadata - Array of cell metadata
 * @param {DimensionOptions | MeasureOptions} options - array of fields to compare
 * @returns {boolean} validation result
 */
function fieldsComparator(
  target: DimensionTarget | ValueTarget,
  metadata: Array<DimensionMetadata | MeasureMetadata>,
  options: DimensionOptions | MeasureOptions,
) {
  if (!metadata || !metadata.length) {
    return false;
  }

  return metadata.some((metadataItem) => {
    let fieldsValid = true;

    if (options && options.fields && options.fields.length) {
      options.fields.forEach((field: string) => {
        if (target[field] !== undefined && metadataItem[field] === undefined) {
          fieldsValid = false;
        } else if (target[field] !== undefined && metadataItem[field] !== undefined) {
          if (Array.isArray(target[field])) {
            fieldsValid = fieldsValid && target[field].indexOf(metadataItem[field]) !== -1;
          } else {
            fieldsValid = fieldsValid && target[field] === metadataItem[field];
          }
        }
      });
    }
    return fieldsValid;
  });
}

/**
 * Validate metadata by target type
 *
 * @param {Array<string>} target - types of cells
 * @param {Array<string>} metadata - current cell type
 * @returns {boolean} validation result
 */
const isValidType = (target: Array<string>, metadata: Array<string> = []) => {
  let valid = false;
  if (!metadata || !metadata.length) {
    return false;
  }

  if (target.length === 0) {
    return true;
  }

  target.forEach((type) => {
    if (metadata.includes(type)) {
      valid = true;
    }
  });
  return valid;
};

/**
 * Validate metadata with target
 *
 * @param {DimensionTarget} target - target rows
 * @param {Array<DimensionMetadata>} dimMetadata - array of rows or columns in metadata
 * @returns {boolean} validation result
 */
const isValidDimension = (
  target: Array<DimensionTarget>,
  dimMetadata: Array<DimensionMetadata>,
) => {
  // validate by indexes || dimension & member || title

  let valid = true;

  if (!dimMetadata || !dimMetadata.length) {
    valid = false;
  } else {
    target.forEach((dimTarget: DimensionTarget) => {
      if (dimTarget.index) {
        const currentPanel = dimMetadata[dimMetadata.length - 1];
        valid =
          valid &&
          fieldsComparator(dimTarget, [currentPanel], { fields: [PluginsPanelFields.INDEX] });
      }

      if (dimTarget.dim) {
        dimTarget.name = dimTarget.dim;
        if (dimTarget.members) {
          dimTarget.member = dimTarget.members;
        }

        valid =
          valid &&
          fieldsComparator(dimTarget, dimMetadata, {
            fields: [PluginsPanelFields.NAME, PluginsPanelFields.MEMBER],
          });
      }

      if (dimTarget.title) {
        const currentPanel = dimMetadata[dimMetadata.length - 1];
        valid =
          valid &&
          fieldsComparator(dimTarget, [currentPanel], { fields: [PluginsPanelFields.TITLE] });
      }
    });
  }
  return valid;
};

/**
 * Validate metadata with target
 *
 * @param {ValueTarget} target - target rows
 * @param {MeasureMetadata} measureMetadata - array of rows or columns in metadata
 * @returns {boolean} validation result
 */
const isValidMeasure = (target: Array<ValueTarget>, measureMetadata: Array<MeasureMetadata>) => {
  // validate by indexes || dimension & member || title

  let valid = true;

  if (!measureMetadata || !measureMetadata.length) {
    valid = false;
  } else {
    target.forEach((measureTarget) => {
      if (measureTarget.index) {
        valid =
          valid &&
          fieldsComparator(measureTarget, measureMetadata, { fields: [PluginsPanelFields.INDEX] });
      }

      if (measureTarget.dim) {
        measureTarget.name = measureTarget.dim;
        valid =
          valid &&
          fieldsComparator(measureTarget, measureMetadata, {
            fields: [PluginsPanelFields.DIM, PluginsPanelFields.AGG],
          });
      }

      if (measureTarget.title) {
        valid =
          valid &&
          fieldsComparator(measureTarget, measureMetadata, { fields: [PluginsPanelFields.TITLE] });
      }
    });
  }
  return valid;
};

/**
 * Collect and return rows or columns group metadata
 *
 * @param {Target} target - target rows
 * @param {Metadata} metadata - array of rows in metadata
 * @returns {boolean} validation result
 */
export const validate = (target: Target, metadata: Metadata) => {
  let valid = true;

  if (target.type && valid) {
    valid = valid && isValidType(target.type, metadata.type);
  }

  if (target.rows && target.rows.length && valid) {
    const rows = metadata.rows ? metadata.rows : [];
    valid = valid && isValidDimension(target.rows, rows);
  }

  if (target.columns && valid) {
    const columns = metadata.columns ? metadata.columns : [];
    valid = valid && isValidDimension(target.columns, columns);
  }

  if (target.values && valid) {
    const measure = metadata.measure ? [metadata.measure] : [];
    valid = valid && isValidMeasure(target.values, measure);
  }

  return valid;
};

export default {
  validate,
};
