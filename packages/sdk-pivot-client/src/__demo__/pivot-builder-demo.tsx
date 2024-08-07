import { PivotClient } from '../pivot-client';
import { JaqlRequest } from '../data-load/types';
import React, { useEffect, useMemo, useRef } from 'react';

export interface PivotBuilderDemoProps {
  jaql: JaqlRequest;
  pivotClient: PivotClient;
}
export function PivotBuilderDemo(pivotBuilderDemoProps: PivotBuilderDemoProps) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const { jaql, pivotClient } = pivotBuilderDemoProps;

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
    if (nodeRef.current && jaql) {
      pivotBuilder.render(nodeRef.current, props);
      pivotBuilder.updateJaql(jaql);
    }
    return () => {
      // cleanup if needed
    };
  }, [jaql, pivotBuilder, props]);

  return <div ref={nodeRef} />;
}
