import EventEmitter from 'events';
import { TreeNode } from '../tree-structure/index.js';
import { treeNode } from '../tree-structure/utils/index.js';
import { Jaql, JaqlPanel, JaqlRequest } from '../data-load/types.js';
import { v4 as uuid } from 'uuid';

/**
 * @param {Function} emitter - instance of EventEmitter (node-events)
 * @param {string} methodNameCallEvent - name of custom event
 * @returns {void}
 */
export const emitterCallHandle = (
  emitter: EventEmitter,
  methodNameCallEvent: string,
): Promise<string> =>
  new Promise((res) => {
    emitter.once(methodNameCallEvent, () => {
      res(methodNameCallEvent);
    });
  });
/**
 *
 * @returns {Array} - returns callback listener and dispatcher (node events library)
 */
export const initEventEmitter = (): {
  awaitForCall: (methodName: string) => Promise<string>;
  emitCall: (methodName: string) => void;
} => {
  const emitter = new EventEmitter();
  const awaitForCall = (methodName: string) => emitterCallHandle(emitter, methodName);
  const emitCall = (methodName: string) => {
    emitter.emit(methodName);
  };
  return { awaitForCall, emitCall };
};

export const getNodeProp = (item: any, propName: string, list: Array<any> = []): Array<any> => {
  if (!item) {
    return list;
  }
  let children: Array<TreeNode> = [];

  if (Array.isArray(item)) {
    children = item;
  } else {
    children = treeNode.getChildren(item);
    list.push(item[propName]);
  }

  if (children && children.length) {
    children.forEach((child: Record<string, any>) => {
      getNodeProp(child, propName, list);
    });
  }
  return list;
};

export const getNodeNames = (item: any, list: string[] = []): string[] =>
  getNodeProp(item, 'value', list);

export const getNodeIndexes = (item: any, list: string[] = []): string[] =>
  getNodeProp(item, 'index', list);

export const createTypedPanel = (
  type: string,
  jaqlIndex = 0,
  additionalJaqlProps: Record<any, any> = {},
  additionalPanelProps: Record<any, any> = {},
) => {
  const title = `${type}-${jaqlIndex}`;
  const jaql: Jaql = {
    title,
    datatype: 'datatype',
    dim: `[${title}]`,
    ...additionalJaqlProps,
  };
  return {
    panel: type,
    field: { index: jaqlIndex, id: title },
    jaql,
    ...additionalPanelProps,
  };
};

export const createTypedPanels = (
  type: string,
  count: number,
  startIndex = 0,
  additionalJaqlProps: Record<string, any> = {},
) =>
  Array.from(Array(count - startIndex)).map((item, index): JaqlPanel => {
    const jaqlIndex = index + startIndex;
    const title = `${type}-${jaqlIndex}`;
    const jaql: Jaql = {
      title,
      datatype: 'datatype',
      dim: `[${title}]`,
      ...additionalJaqlProps,
    };
    return {
      panel: type,
      field: { index: jaqlIndex, id: title },
      jaql,
    };
  });

export const createTestJaql = (
  rows?: Array<JaqlPanel>,
  columns?: Array<JaqlPanel>,
  measures?: Array<JaqlPanel>,
  scope?: Array<JaqlPanel>,
  additionalJaqlProps: Record<string, any> = {},
): JaqlRequest => {
  let metadata: Array<JaqlPanel> = [];
  if (rows) {
    metadata = metadata.concat(rows);
  }
  if (columns) {
    metadata = metadata.concat(columns);
  }
  if (measures) {
    metadata = metadata.concat(measures);
  }
  if (scope) {
    metadata = metadata.concat(scope);
  }

  return {
    queryGuid: uuid(),
    metadata,
    grandTotals: {
      title: 'Grand total',
    },
    ...additionalJaqlProps,
  };
};

export const delay = (time = 0, resolveValue?: any, rejectValue?: any): Promise<any> =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (typeof rejectValue !== 'undefined') {
        reject(rejectValue);
      } else {
        resolve(resolveValue);
      }
    }, time);
  });
