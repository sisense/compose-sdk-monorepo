import React, { useEffect, useMemo, useState } from 'react';

import { JaqlRequest } from '@sisense/sdk-pivot-query-client';

import { EVENT_PIVOT_ELEMENT_CHANGE } from '../builders';
import { PivotClient } from '../pivot-client';

export interface PivotBuilderDemoProps {
  jaql: JaqlRequest;
  pivotClient: PivotClient;
}
export function PivotBuilderDemo(pivotBuilderDemoProps: PivotBuilderDemoProps) {
  const { jaql, pivotClient } = pivotBuilderDemoProps;
  const [pivotElement, setPivotElement] = useState<React.ReactElement | null>(null);

  const props = useMemo(() => {
    return {
      width: 900,
      height: 650,
      fontFamily: 'Comic Sans MS',
      isPaginated: true,
      itemsPerPage: 25,
      isAutoHeight: false,
    };
  }, []);
  const pivotBuilder = pivotClient.preparePivotBuilder();

  useEffect(() => {
    if (jaql) {
      pivotBuilder.render(props);
      pivotBuilder.updateJaql(jaql);
    }
    return () => {
      // cleanup if needed
    };
  }, [jaql, pivotBuilder, props]);

  useEffect(() => {
    pivotBuilder.on(EVENT_PIVOT_ELEMENT_CHANGE, setPivotElement);
    return () => {
      pivotBuilder.off(EVENT_PIVOT_ELEMENT_CHANGE, setPivotElement);
    };
  }, [pivotBuilder]);

  return pivotElement;
}
