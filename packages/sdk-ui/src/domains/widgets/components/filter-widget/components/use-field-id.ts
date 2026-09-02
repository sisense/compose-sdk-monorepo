import { useState } from 'react';

import uniqueId from 'lodash-es/uniqueId';

/**
 * A stable id for wiring a label to its control.
 *
 * `useId` would be the natural choice but does not exist in React 17, which sdk-ui
 * still supports, so the id comes from `uniqueId` seeded once per mount instead.
 * @param provided - An id supplied by the caller, which wins when present
 * @returns The id to put on the control and in the label's `htmlFor`
 * @internal
 */
export function useFieldId(provided?: string): string {
  const [generated] = useState(() => uniqueId('csdk-fw-field-'));
  return provided ?? generated;
}
