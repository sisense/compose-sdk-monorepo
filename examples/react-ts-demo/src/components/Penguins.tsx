/* eslint-disable max-lines-per-function */
import { Chart } from '@sisense/sdk-ui';
import * as DM from '../data-model/penguins';
import { filters, measures } from '@sisense/sdk-data';
import { Cell, Table, HeadRow, EmptyCell, Head, Row, RowHead, TableWrapper } from '../overStyle';
import { useState } from 'react';

export const Penguins = () => {
  const [showCode, setShowCode] = useState(false);

  const penguinMeasures = [
    measures.average(DM.penguins.BodyMass, 'Body Mass'),
    measures.average(DM.penguins.FlipperLength, 'Flipper Length'),
    measures.average(DM.penguins.CulmenDepth, 'Culmen Depth'),
    measures.average(DM.penguins.CulmenLength, 'Culmen Length'),
  ];
  const matrix = { x: penguinMeasures.map((m) => m.name), y: penguinMeasures.map((m) => m.name) };

  const activeFilters = [filters.members(DM.penguins.Sex, ['MALE', 'FEMALE'])];

  return (
    <div>
      <b>
        <h1>{'Scatter Plot Matrix of Penguin Featues'}</h1>
      </b>
      <input
        style={{
          marginRight: '10px',
          marginLeft: '10px',
        }}
        type="checkbox"
        id="showCode"
        name="showCode"
        value="Show Code"
        checked={showCode}
        onChange={() => setShowCode(!showCode)}
      ></input>
      {'What the heck is a Culmen?'}
      {showCode && <img src={'/penguin-culmen.png'}></img>}
      <TableWrapper>
        <Table>
          <tbody>
            <HeadRow>
              <EmptyCell />
              {matrix.x.map((name) => (
                <Head columns={4} key={name}>
                  {name}
                </Head>
              ))}
            </HeadRow>
            {matrix.x.map((measureX, indexX) => {
              return (
                <Row key={indexX}>
                  <RowHead key={measureX}>{measureX}</RowHead>
                  {matrix.y.map((measureY, indexY) => {
                    const scatterChartDataOptions = {
                      x: penguinMeasures[indexX],
                      y: penguinMeasures[indexY],
                      breakByPoint: DM.penguins.SampleNumber,
                      breakByColor: DM.penguins.Sex,
                    };

                    return (
                      <Cell key={`${measureX}_${measureY}`}>
                        <Chart
                          chartType={'scatter'}
                          dataSet={'Penguins'}
                          filters={activeFilters}
                          dataOptions={scatterChartDataOptions}
                          styleOptions={{}}
                          onDataPointClick={(point) => {
                            console.log(`${point.categoryValue}`);
                          }}
                        />
                      </Cell>
                    );
                  })}
                </Row>
              );
            })}
          </tbody>
        </Table>
      </TableWrapper>
    </div>
  );
};
