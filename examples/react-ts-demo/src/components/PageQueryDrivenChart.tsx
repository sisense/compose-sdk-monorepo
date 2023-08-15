/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import {
  Chart,
  ColumnChart,
  ExecuteQuery,
  PolarChart,
  Table as ComposeTable,
} from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { TableComponent } from './common/Table';
import { useAttributeMeasureTypeToolbar } from './hooks';
import { Cell, Table, Row, TableWrapper } from '../overStyle';
import { useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';
import Prism from 'prismjs';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import 'prismjs/themes/prism.css'; //Example style, you can use another
import { filters as filtersList } from '@sisense/sdk-data';

export const CodeEditor = (props: { code: string }) => {
  const [code, setCode] = useState(`${props.code}`);
  return (
    <Editor
      value={code}
      onValueChange={(newCode) => setCode(newCode)}
      highlight={(codeToHighlight) =>
        Prism.highlight(codeToHighlight, Prism.languages.javascript, 'js')
      }
      padding={10}
      style={{
        fontFamily: '"Fira code", "Fira Mono", monospace',
        fontSize: 14,
      }}
    />
  );
};

const top10CategoriesByRevenue = filtersList.topRanking(
  DM.Category.Category,
  DM.Measures.SumRevenue,
  10,
);
const top10CategoriesByRevenueStr = `filters.topRanking(DM.Category.Category,
                                       DM.Measures.SumRevenue,
                                       10)`;

export const PageQueryDrivenChart = () => {
  const [showCode, setShowCode] = useState(false);
  const [top10Filter, setTop10Filter] = useState(false);

  const filters = useMemo(() => (top10Filter ? [top10CategoriesByRevenue] : []), [top10Filter]);

  const { attribute, aggedMeasure, chartType, toolbar } = useAttributeMeasureTypeToolbar();

  return (
    <>
      <br />
      <b>
        <h1>{'Charts created in code and data queried from Sisense Instance (Elasticube)'}</h1>
      </b>
      {toolbar}
      <div
        style={{
          marginLeft: '20px',
        }}
      >
        <input
          style={{
            marginRight: '10px',
          }}
          type="checkbox"
          id="top10Filter"
          name="top10Filter"
          value="Top 10 Categories by Revenue"
          checked={top10Filter}
          onChange={() => setTop10Filter(!top10Filter)}
        ></input>
        {'Top 10 Categories by Revenue'}
      </div>
      <div
        style={{
          marginLeft: '20px',
        }}
      >
        <input
          style={{
            marginRight: '10px',
          }}
          type="checkbox"
          id="showCode"
          name="showCode"
          value="Show Code"
          checked={showCode}
          onChange={() => setShowCode(!showCode)}
        ></input>
        {'Show Code'}
      </div>
      <TableWrapper>
        <Table>
          <tbody>
            {showCode && (
              <Row
                style={{
                  fontSize: 'smaller',
                  fontFamily: 'courier',
                  marginBottom: '20px',
                }}
              >
                <Cell>
                  <div
                    style={{
                      textAlign: 'left',
                      border: '1px solid black',
                      background: '#EEEEEE',
                      marginBottom: '10px',
                    }}
                  >
                    <CodeEditor
                      code={`        <ExecuteQuery
          dimensions={[DM.Commerce.${attribute.name}]}
          measures={[measures.sum(DM.Commerce.${
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (aggedMeasure as any).attribute.name
          })]}
          filters={[${top10Filter ? top10CategoriesByRevenueStr : ''}]}
        >
          {(data) => {
            if (data && data.rows) {
              return <ThirdPartyComponent data={data} />;
            }
          }}
        </ExecuteQuery>

        `}
                    />
                  </div>
                </Cell>
                <Cell>
                  <div
                    style={{
                      textAlign: 'left',
                      border: '1px solid black',
                      background: '#EEEEEE',
                      marginBottom: '10px',
                      paddingRight: '5px',
                    }}
                  >
                    <CodeEditor
                      code={`        <Chart
          chartType={'${chartType}'}
          dataSet={DM.DataSource}
          dataOptions={{
            category: [DM.Commerce.${attribute.name}],
            value: [measures.sum(DM.Commerce.${aggedMeasure.attribute.name})],
            breakBy: [],
          }}
          filters={[${top10Filter ? top10CategoriesByRevenueStr : ''}]}
          styleOptions={styleOptions}
          onDataPointClick= {(point) => { console.log('clicked'); }}
        />`}
                    />
                  </div>
                </Cell>
              </Row>
            )}
            <Row>
              <Cell style={{ verticalAlign: 'top' }}>
                <ExecuteQuery dimensions={[attribute]} measures={[aggedMeasure]} filters={filters}>
                  {(data) => {
                    if (data && data.rows) {
                      return <TableComponent data={data} />;
                    }
                  }}
                </ExecuteQuery>
              </Cell>
              <Cell>
                <Chart
                  dataSet={DM.DataSource}
                  chartType={chartType}
                  filters={filters}
                  dataOptions={{
                    category: [attribute],
                    value: [aggedMeasure],
                    breakBy: [],
                  }}
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
                  }}
                />
              </Cell>
            </Row>
            <Row>
              <Cell>
                <PolarChart
                  dataSet={DM.DataSource}
                  filters={filters}
                  dataOptions={{
                    category: [attribute],
                    value: [aggedMeasure],
                    breakBy: [DM.Commerce.Gender],
                  }}
                  styleOptions={{
                    subtype: 'polar/area',
                  }}
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
                  }}
                />
              </Cell>
              <Cell>
                <ColumnChart
                  dataSet={DM.DataSource}
                  filters={filters}
                  dataOptions={{
                    category: [attribute],
                    value: [aggedMeasure],
                    breakBy: [DM.Commerce.Gender],
                  }}
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
                  }}
                />
              </Cell>
            </Row>
            <Row>
              <Cell>
                <ComposeTable
                  dataSet={DM.DataSource}
                  dataOptions={{
                    columns: [attribute],
                  }}
                />
              </Cell>
            </Row>
          </tbody>
        </Table>
      </TableWrapper>
    </>
  );
};
