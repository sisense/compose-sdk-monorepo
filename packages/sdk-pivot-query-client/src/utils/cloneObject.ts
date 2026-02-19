type StringArraysMap = { [s: string]: Array<string> };

type IncludeExcludeKeys = {
  commonIncludeKeys: Array<string>;
  commonExcludeKeys: Array<string>;
};

const REFERENCE_CLONE_TYPES = [Date, Error, RegExp, Promise];

function isReferenceClone(obj: any, types: Array<any> = REFERENCE_CLONE_TYPES) {
  return types.some((type) => obj instanceof type);
}

function hasMatchedItems(searchList: Array<string>, queryList: Array<string> = []) {
  let res = false;
  queryList.forEach((query) => {
    if (searchList.includes(query)) {
      res = true;
    }
  });
  return res;
}

function getParentKeys(
  // eslint-disable-next-line @typescript-eslint/default-param-last
  parentKeys: Array<string> = [],
  key: string,
  isArray: boolean,
): Array<string> {
  const res = [];

  if (isArray) {
    parentKeys.forEach((parentKey) => {
      res.push(`${parentKey}.$`);
    });
  }

  if (parentKeys.length) {
    parentKeys.forEach((parentKey) => {
      res.push(`${parentKey}.${key}`);
    });
  } else {
    res.push(key);
  }

  return res;
}

function isObject(obj: any) {
  return !(obj === null || typeof obj === 'undefined' || typeof obj !== 'object');
}

function isEmpty(value: any, excludeTypes: any) {
  if (isObject(value) && value) {
    if (Array.isArray(value)) {
      return !value.length;
    }
    if (isReferenceClone(value, excludeTypes)) {
      return false;
    }
    return !Object.keys(value).length;
  }
  if (value === undefined || value === null) {
    return true;
  }
  return false;
}

function removeLastChildKey(key = '') {
  const parts = key.split('.');
  if (parts.length > 1) {
    parts.pop();
    return parts.join('.');
  }
  return parts[0];
}

function shouldBeIncluded(
  includeKeys: Array<string>,
  excludeKeys: Array<string>,
  keysWithParent: Array<string>,
) {
  if (includeKeys.length) {
    return hasMatchedItems(includeKeys, keysWithParent);
  }
  if (excludeKeys.length) {
    return !hasMatchedItems(excludeKeys, keysWithParent);
  }
  return true;
}

function updateIncludeExcludeKeys(
  obj: any,
  include: Array<string> = [],
  exclude: Array<string> = [],
  parentKeys: Array<string> = [],
  includeKeys: StringArraysMap = {},
  excludeKeys: StringArraysMap = {},
  references: Array<any> = [],
  cachedResults: Array<IncludeExcludeKeys> = [],
): IncludeExcludeKeys {
  if (!isObject(obj)) {
    return {
      commonIncludeKeys: [],
      commonExcludeKeys: [],
    };
  }

  const index = references.indexOf(obj);
  if (index !== -1) {
    return cachedResults[index];
  }
  references.push(obj);

  const keys = Object.keys(obj);
  const isArray = Array.isArray(obj);

  let commonIncludeKeys: Array<string> = [];
  let commonExcludeKeys: Array<string> = [];

  const childCommonIncludeKeys: Array<string> = [];
  const childCommonExcludeKeys: Array<string> = [];

  keys.forEach((key) => {
    const value = obj[key];
    const keysWithParent = getParentKeys(parentKeys, key, isArray);
    const baseKeysWithParent = parentKeys[0] || '&';

    includeKeys[baseKeysWithParent] = includeKeys[baseKeysWithParent] || [];
    excludeKeys[baseKeysWithParent] = excludeKeys[baseKeysWithParent] || [];

    keysWithParent.forEach((keyWithParent) => {
      if ((include || []).includes(keyWithParent)) {
        includeKeys[baseKeysWithParent].push(keyWithParent);
        commonIncludeKeys.push(keyWithParent);
      }

      // push inserrt keys to parent in case property does not exist at all
      (include || []).forEach((includeKey) => {
        const includeKeyParent = removeLastChildKey(includeKey);
        if (
          `${includeKeyParent}.$` === baseKeysWithParent ||
          includeKeyParent === baseKeysWithParent
        ) {
          if (!includeKeys[baseKeysWithParent].includes(includeKey)) {
            includeKeys[baseKeysWithParent].push(includeKey);
          }
          if (!commonIncludeKeys.includes(includeKey)) {
            commonIncludeKeys.push(includeKey);
          }
        }
      });

      if ((exclude || []).includes(keyWithParent)) {
        excludeKeys[baseKeysWithParent].push(keyWithParent);
        commonExcludeKeys.push(keyWithParent);
      }
    });

    if (isObject(value)) {
      updateIncludeExcludeKeys(
        value,
        include,
        exclude,
        keysWithParent,
        includeKeys,
        excludeKeys,
        references,
        cachedResults,
      );
    }
  });

  if (isObject(obj)) {
    let baseArrayKeysWithParent = parentKeys[0] || '&';
    if (Array.isArray(obj)) {
      baseArrayKeysWithParent = `${baseArrayKeysWithParent}.$`;
    }

    includeKeys[baseArrayKeysWithParent] = (includeKeys[baseArrayKeysWithParent] || []).concat(
      childCommonIncludeKeys,
    );
    commonIncludeKeys = commonIncludeKeys.concat(childCommonIncludeKeys);

    excludeKeys[baseArrayKeysWithParent] = (excludeKeys[baseArrayKeysWithParent] || []).concat(
      childCommonExcludeKeys,
    );
    commonExcludeKeys = commonIncludeKeys.concat(childCommonExcludeKeys);
  }

  cachedResults.push({
    commonIncludeKeys,
    commonExcludeKeys,
  });

  return {
    commonIncludeKeys,
    commonExcludeKeys,
  };
}

function applyIncludeExclude(
  obj: any,
  options?: {
    includeKeys?: Array<string> | undefined;
    includeKeysObj?: StringArraysMap | undefined;
    excludeKeys?: Array<string> | undefined;
    excludeKeysObj?: StringArraysMap | undefined;
    parentKeys?: Array<string>;
    excludeEmpty?: boolean;
    referenceClone?: Array<any>;
  },
  references: WeakMap<Record<string, any>, any> = new WeakMap(),
) {
  const {
    includeKeys,
    includeKeysObj,
    excludeKeys,
    excludeKeysObj,
    parentKeys = [],
    excludeEmpty,
    referenceClone,
  } = options || {};
  if (!isObject(obj) || isReferenceClone(obj, referenceClone)) {
    return obj;
  }
  if (references.has(obj)) {
    return references.get(obj);
  }

  const keys: Array<string> = Object.keys(obj);
  const isArray = Array.isArray(obj);
  const res: any = isArray ? [] : {};
  references.set(obj, res);

  const parentKey = parentKeys[0] || '&';
  const curIncludeKeys = (includeKeysObj || {})[parentKey] || [];
  const curExcludeKeys = (excludeKeysObj || {})[parentKey] || [];

  keys.forEach((key: string) => {
    const value = obj[key];
    let keysWithParent: Array<string> = [];
    let shouldBeAdded = true;
    if (includeKeys || excludeKeys) {
      shouldBeAdded = shouldBeIncluded(includeKeys || [], excludeKeys || [], [key]);
    } else if (includeKeysObj || excludeKeysObj) {
      keysWithParent = getParentKeys(parentKeys, key, isArray);
      shouldBeAdded = shouldBeIncluded(curIncludeKeys, curExcludeKeys, keysWithParent);
    }
    if (shouldBeAdded) {
      const clonedValue = applyIncludeExclude(
        value,
        {
          ...options,
          parentKeys: keysWithParent,
        },
        references,
      );
      if (!excludeEmpty || !isEmpty(clonedValue, referenceClone)) {
        if (isArray) {
          res.push(clonedValue);
        } else {
          res[key] = clonedValue;
        }
      }
    }
  });

  return res;
}

/**
 * Makes deep clone of the object with ability exclude some properties or include only specific ones
 * (includeKeys && excludeKeys) - simple key name comparison
 * (include && exclude) - with parent hierarchy support, example:
 * 'property1.deep_property2.deep_property3'
 * or for array:
 * 'arrayProperty.0' and 'arrayProperty.$.deep_property'
 *
 * @param {any} obj - object to clone
 * @param {object} [options] - additional behaviour options
 * @param {Array<string>} [options.include] - list of include properties keys
 * @param {Array<string>} [options.includeKeys] - list of include properties keys
 * @param {Array<string>} [options.exclude] - list of exclude properties keys
 * @param {Array<string>} [options.excludeKeys] - list of exclude properties keys
 * @param {boolean} [options.excludeEmpty] - defines if empty objects should be copied or not
 * @param {Array<any>} [options.referenceClone] - defines types which clone by reference
 * @returns {any} - cloned object
 */
export function cloneObject(
  obj: any,
  options?: {
    include?: Array<string> | undefined;
    includeKeys?: Array<string> | undefined;
    exclude?: Array<string> | undefined;
    excludeKeys?: Array<string> | undefined;
    excludeEmpty?: boolean;
    referenceClone?: Array<any>;
  },
): any {
  const { include, exclude, ...restOptions } = options || {};
  let includeKeysObj;
  let excludeKeysObj;

  if (include || exclude) {
    includeKeysObj = {};
    excludeKeysObj = {};
    updateIncludeExcludeKeys(obj, include, exclude, [], includeKeysObj, excludeKeysObj);
  }
  const applyOptions = {
    ...restOptions,
    includeKeysObj,
    excludeKeysObj,
  };
  return applyIncludeExclude(obj, applyOptions);
}
cloneObject.REFERENCE_CLONE_TYPES = REFERENCE_CLONE_TYPES;

export default cloneObject;
