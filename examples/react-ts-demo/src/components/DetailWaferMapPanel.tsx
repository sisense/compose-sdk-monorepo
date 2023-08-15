/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-lines */
import { useCallback, useMemo } from 'react';
import { QueryResultData, filters, measures } from '@sisense/sdk-data';
import {
  BarChart,
  ExecuteQuery,
  LineChart,
  LineStyleOptions,
  StackableStyleOptions,
} from '@sisense/sdk-ui';
import * as Semi from '../data-model/semiconductor-data';
import { CellData, getColumnIndexMap } from './semiconductor/WaferMapGallery';
import { BinWaferMap, processResult } from './semiconductor/BinWaferMap';
import { TableWrapper, Table, Row, RowHead, Cell } from '../overStyle';
import { NumberFormatConfig } from '@sisense/sdk-ui';

const passFailMeasure = measures.average(Semi.wafer_sort_bin_data.PASS_FAIL);
const countMeasure = measures.count(Semi.wafer_sort_bin_data.SERIAL);

export const DetailWaferMapPanel = ({ cellData }: { cellData: CellData }) => {
  const lotNumber = useMemo(() => cellData.cells[cellData.columns.LOT].data, [cellData]);
  const waferNumber = useMemo(() => cellData.cells[cellData.columns.WAFER].data, [cellData]);

  const adjustBarChartOptions = useCallback((options: any) => {
    if (options.plotOptions?.series) {
      options.plotOptions.series.groupPadding = 0;
      options.plotOptions.series.pointPadding = 0;
      options.plotOptions.series.grouping = false;
    }
    return options;
  }, []);

  return (
    <ExecuteQuery
      key={`currentWafer`}
      dataSource="Semiconductor Data"
      dimensions={[
        Semi.wafer_sort_bin_data.DEVICE,
        Semi.wafer_sort_bin_data.LOT,
        Semi.wafer_sort_bin_data.WAFER,
        Semi.wafer_sort_yield_summary.YIELD,
        Semi.wafer_sort_bin_data.X_COORD,
        Semi.wafer_sort_bin_data.Y_COORD,
        Semi.wafer_sort_bin_data.BIN_NUMBER,
        Semi.sort_bins.BIN_NAME,
        Semi.wafer_sort_bin_data.SERIAL,
      ]}
      measures={[passFailMeasure, countMeasure]}
      filters={[
        filters.members(Semi.wafer_sort_bin_data.LOT, [`${lotNumber}`]),
        filters.members(Semi.wafer_sort_bin_data.WAFER, [`${waferNumber}`]),
      ]}
    >
      {(data) => {
        const infoData = { ...data, rows: [data.rows[0].slice(0, 4)] };

        const dataColumns = getColumnIndexMap(data);
        data.columns[dataColumns.X_COORD].type = 'number';
        data.columns[dataColumns.Y_COORD].type = 'number';

        const actualLotNumber = data.rows[0][dataColumns.LOT].data;
        const actualWaferNumber = data.rows[0][dataColumns.WAFER].data;
        const waferYield = data.rows[0][dataColumns.YIELD].data;
        const waferBinData = processResult(data);
        return (
          <div
            style={{
              display: 'flex-inline',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'clip',
            }}
          >
            <div
              style={{
                display: 'flex-inline',
                flexDirection: 'row',
                alignItems: 'stretch',
                overflow: 'clip',
              }}
            >
              <div
                style={{
                  display: 'inline-block',
                  width: '25%',
                }}
              >
                <InfoComponent data={infoData} style={{ paddingLeft: '50px' }} />
                <BarChart
                  dataSet={{
                    ...data,
                    rows: data.rows.filter((row) => row[dataColumns.BIN_NUMBER].data !== 1),
                  }}
                  dataOptions={{
                    category: [Semi.sort_bins.BIN_NAME],
                    value: [{ column: countMeasure, sortType: 'sortDesc' }],
                    breakBy: [Semi.wafer_sort_bin_data.BIN_NUMBER],
                    seriesToColorMap,
                  }}
                  styleOptions={binParetChartStyle}
                  onBeforeRender={adjustBarChartOptions}
                />
              </div>
              <div
                style={{
                  alignItems: 'center',
                  paddingLeft: '100px',
                  width: '75%',
                  display: 'inline-block',
                }}
              >
                <BinWaferMap
                  title={`Wafer ${actualLotNumber}-${actualWaferNumber}: ${waferYield}%`}
                  waferBinData={waferBinData}
                  height={600}
                  width={600}
                />
              </div>
            </div>
            <div
              style={{
                width: '80%',
                margin: 'auto',
                padding: '10px',
              }}
            >
              <LineChart
                dataSet={data}
                dataOptions={{
                  category: [Semi.wafer_sort_bin_data.X_COORD],
                  value: [
                    {
                      column: passFailMeasure,
                      numberFormatConfig: {
                        ...defaultNumberFormat,
                        name: 'Percent',
                      },
                    },
                  ],
                  breakBy: [],
                }}
                styleOptions={xCoordLineChartStyle}
              />
            </div>
            <div
              style={{
                width: '80%',
                margin: 'auto',
                padding: '10px',
              }}
            >
              <LineChart
                dataSet={data}
                dataOptions={{
                  category: [Semi.wafer_sort_bin_data.Y_COORD],
                  value: [
                    {
                      column: passFailMeasure,
                      numberFormatConfig: {
                        ...defaultNumberFormat,
                        name: 'Percent',
                      },
                    },
                  ],
                  breakBy: [],
                }}
                styleOptions={yCoordLineChartStyle}
              />
            </div>
          </div>
        );
      }}
    </ExecuteQuery>
  );
};

const xCoordLineChartStyle: LineStyleOptions = {
  xAxis: {
    title: {
      text: 'X Coordinate',
      enabled: true,
    },
  },
  yAxis: {
    title: {
      text: 'Yield',
      enabled: true,
    },
  },
  legend: {
    enabled: false,
  },
};

const yCoordLineChartStyle: LineStyleOptions = {
  xAxis: {
    title: {
      text: 'Y Coordinate',
      enabled: true,
    },
  },
  yAxis: {
    title: {
      text: 'Yield',
      enabled: true,
    },
  },
  legend: {
    enabled: false,
  },
};

const binParetChartStyle: StackableStyleOptions = {
  xAxis: {
    title: {
      text: 'Fail Bin Qty',
      enabled: true,
    },
  },
  legend: {
    enabled: false,
  },
};

const seriesToColorMap = {
  '1': '#00FF00',
  '2': '#A3FD86',
  '3': '#54B989',
  '4': '#610F59',
  '5': '#8F8436',
  '6': '#6C57A0',
  '7': '#23F4D8',
  '8': '#157441',
  '9': '#A8F6FA',
  '10': '#42415E',
  '11': '#B4CF17',
  '12': '#0A2C38',
  '13': '#D56E47',
  '14': '#9A9A09',
  '15': '#08FA69',
  '16': '#1562A3',
  '17': '#EBEB98',
  '18': '#7119C9',
  '19': '#427631',
  '20': '#962C31',
  '21': '#DB7242',
  '22': '#C15251',
  '23': '#1E1AF9',
  '24': '#4B4A08',
  '25': '#56DDE5',
  '26': '#FFFF00',
};

export const InfoComponent = ({
  data,
  limit,
  style,
}: {
  data: QueryResultData;
  limit?: number;
  style: React.CSSProperties;
}) => {
  return (
    <TableWrapper mheight={'392px'} style={style}>
      <Table>
        <tbody>
          {data &&
            data.rows[0].slice(0, limit).map((cell, i) => (
              <Row key={`${i}row`} id={`${i}row`} style={{ border: '1px solid lightGray' }}>
                <RowHead
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    textAlign: 'left',
                  }}
                >
                  {data.columns[i].name}
                </RowHead>
                <Cell
                  key={`${cell.text}${i}`}
                  id={`${cell.text}${i}`}
                  style={{
                    paddingLeft: '20px',
                    paddingRight: '20px',
                    textAlign: 'left',
                  }}
                >
                  <p>{cell.text}</p>
                </Cell>
              </Row>
            ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};

const defaultNumberFormat: NumberFormatConfig = {
  name: 'Numbers',
  decimalScale: 'auto',
  trillion: true,
  billion: true,
  million: true,
  kilo: true,
  thousandSeparator: true,
  prefix: true,
  symbol: '$',
};
