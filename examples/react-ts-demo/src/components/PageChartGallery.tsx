/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import {
  AreaChart,
  BarChart,
  ColumnChart,
  FunnelChart,
  LineChart,
  PieChart,
  PolarChart,
  IndicatorChart,
  IndicatorChartProps,
  ThemeProvider,
  ThemeSettings,
} from '@sisense/sdk-ui';
import { useMemo, useState } from 'react';
import { Cell, Table, Row, TableWrapper } from '../overStyle';
import { SingleSelectMemberToolbar } from './hooks';
import type { IndicatorStyleOptions } from '@sisense/sdk-ui';
import { CodeEditor } from './PageQueryDrivenChart';

const years = {
  name: 'Years',
  type: 'date',
};
const group = {
  name: 'Group',
  type: 'string',
};
const quantity = {
  column: { name: 'Quantity', aggregation: 'sum', title: 'Total Quantity' },
  // Series Styles
  showOnRightAxis: false,
};
const units = {
  column: { name: 'Units', aggregation: 'sum', title: 'Sum Units' },
  // Series Styles
  showOnRightAxis: true,
  color: '#0000FF',
};

const commerceData = {
  columns: [
    { name: 'Years', type: 'date' },
    { name: 'Group', type: 'string' },
    { name: 'Quantity', type: 'number' },
    { name: 'Units', type: 'number' },
  ],
  rows: [
    ['2009', 'A', 6781, 10],
    ['2009', 'B', 5500, 15],
    ['2010', 'A', 4471, 70],
    ['2011', 'B', 1812, 50],
    ['2012', 'B', 5001, 60],
    ['2013', 'A', 2045, 40],
    ['2014', 'B', 3010, 90],
    ['2015', 'A', 5447, 80],
    ['2016', 'B', 4242, 70],
    ['2017', 'B', 936, 20],
  ],
};

const stage = {
  name: 'Stage',
  type: 'string',
};
const uniqueUsers = {
  name: 'Unique Users',
  aggregation: 'sum',
};

const salesFunnelData = {
  columns: [
    { name: 'Stage', type: 'string' },
    { name: 'Unique Users', type: 'number' },
  ],
  rows: [
    ['Website visits', 15654],
    ['Downloads', 4064],
    ['Requested price list', 1987],
    ['Invoice sent', 976],
    ['Finalized', 846],
  ],
};

const indicatorStyleOptions: IndicatorStyleOptions = {
  indicatorComponents: {
    title: {
      shouldBeShown: true,
      text: 'Total Quantity',
    },
    secondaryTitle: {
      text: 'Total Units',
    },
    ticks: {
      shouldBeShown: true,
    },
    labels: {
      shouldBeShown: true,
    },
  },
  subtype: 'indicator/numeric',
  numericSubtype: 'numericSimple',
  skin: 'vertical',
};

export const PageChartGallery = () => {
  const [showCode, setShowCode] = useState(false);
  const [theme, setTheme] = useState('ThemeOne');
  const themeSettings: ThemeSettings = useMemo(() => {
    if (theme === 'ThemeOne') {
      return {};
    } else {
      return {
        chart: {
          backgroundColor: '#333333',
          textColor: '#FFFFFF',
        },
        typography: {
          fontFamily: 'impact',
        },
      };
    }
  }, [theme]);

  const background = useMemo(() => {
    if (theme === 'ThemeOne') {
      return 'white';
    } else {
      return '#333333';
    }
  }, [theme]);

  const cartesianArgs = {
    dataSet: commerceData,
    dataOptions: {
      category: [years],
      value: [quantity, units],
      breakBy: [],
    },
  };

  const polarArgs = {
    dataSet: commerceData,
    dataOptions: {
      category: [years],
      value: [quantity],
      breakBy: [group],
    },
  };

  const pieArgs = {
    dataSet: commerceData,
    dataOptions: {
      category: [years],
      value: [quantity],
    },
  };

  const funnelArgs = {
    dataSet: salesFunnelData,
    dataOptions: {
      category: [stage],
      value: [uniqueUsers],
    },
  };

  const indicatorArgs: IndicatorChartProps = {
    dataSet: commerceData,
    dataOptions: {
      value: [quantity],
      secondary: [units],
    },
    styleOptions: indicatorStyleOptions,
  };

  return (
    <ThemeProvider theme={themeSettings}>
      <div>
        <br />

        <b>
          <h1>{'Charts and data created in code'}</h1>
        </b>

        <SingleSelectMemberToolbar
          title={'Choose a Theme'}
          members={[
            { text: 'Theme One', data: 'ThemeOne' },
            { text: 'Theme Two', data: 'ThemeTwo' },
          ]}
          selectedMember={theme}
          onChange={(member) => {
            setTheme(member || 'ThemeOne');
          }}
        />
        <br />
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
        {'Show Code'}
        <div style={{ background: background }}>
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
                          paddingRight: '5px',
                        }}
                      >
                        {' '}
                        <CodeEditor
                          code={`
    <Chart
      chartType={'line'}
      data={{
        columns: [
          { name: 'Years', type: 'date' },
          { name: 'Group', type: 'string' },
          { name: 'Quantity', type: 'number' },
          { name: 'Units', type: 'number' },
        ],
        rows: [
          ['2009', 'A', 6781, 10],
          ['2009', 'B', 5500, 15],
          ['2010', 'A', 4471, 70],
          ['2011', 'B', 1812, 50],
          ['2012', 'B', 5001, 60],
          ['2013', 'A', 2045, 40],
          ['2014', 'B', 3010, 90],
          ['2015', 'A', 5447, 80],
          ['2016', 'B', 4242, 70],
          ['2017', 'B', 936, 20],
        ],
      }}
      dataOptions={{
        category: [{name: 'Years', type: 'date'}],
        value: [{name: 'Quantity', aggregation: 'sum'}],
        breakBy: [],
      }}
      filters=[]
      styleOptions={styleOptions}
      onDataPointClick= {(point) => { console.log('clicked'); }}
    />
    `}
                        />
                      </div>
                    </Cell>
                  </Row>
                )}
                <Row>
                  <Cell>
                    <div style={{ width: '40vw' }}>
                      <LineChart {...cartesianArgs} />
                    </div>
                  </Cell>
                  <Cell>
                    <div style={{ width: '40vw' }}>
                      <AreaChart {...cartesianArgs} />
                    </div>
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <BarChart {...cartesianArgs} />
                  </Cell>
                  <Cell>
                    <ColumnChart {...cartesianArgs} />
                  </Cell>
                </Row>
                <Row>
                  <Cell>
                    <PieChart {...pieArgs} />
                  </Cell>
                  <Cell>
                    <FunnelChart {...funnelArgs} />
                  </Cell>
                </Row>
                <ThemeProvider theme={{ chart: { secondaryTextColor: 'gray' } }}>
                  <Row>
                    <Cell>
                      <PolarChart {...polarArgs} />
                    </Cell>
                    <Cell style={{ height: '300px' }}>
                      <IndicatorChart {...indicatorArgs} />
                    </Cell>
                  </Row>
                </ThemeProvider>
              </tbody>
            </Table>
          </TableWrapper>
        </div>
      </div>
    </ThemeProvider>
  );
};
