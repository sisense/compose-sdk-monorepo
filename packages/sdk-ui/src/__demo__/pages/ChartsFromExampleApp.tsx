import React from 'react';
import { exampleData } from '../exampleData';
import { ScatterChart } from '../../components/ScatterChart';

export function ChartsFromExampleApp() {
  return (
    <>
      <ScatterChart
        dataSet={exampleData.data}
        dataOptions={{
          x: exampleData.years,
          y: { name: 'Quantity' },
          breakByPoint: exampleData.group,
          size: exampleData.returns,
        }}
      />
    </>
  );
}
