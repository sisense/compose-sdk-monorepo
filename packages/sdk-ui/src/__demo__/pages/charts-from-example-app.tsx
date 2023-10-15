import React from 'react';
import { exampleData } from '../example-data';
import { ScatterChart } from '../../scatter-chart';

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
        onDataPointClick={(point) => {
          console.log(point.x);
        }}
      />
    </>
  );
}
