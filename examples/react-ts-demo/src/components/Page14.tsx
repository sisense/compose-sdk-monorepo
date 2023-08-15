/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { ColumnChart, MemberFilterTile } from '@sisense/sdk-ui';
import * as DM from '../data-model/reservations';
import { Cell, Table, Row, TableWrapper } from '../overStyle';
import { useState, useMemo } from 'react';
import { measures, Filter } from '@sisense/sdk-data';
import { StackableStyleOptions } from '@sisense/sdk-ui';

export const Page14 = () => {
  const [resoDateFilter, setResoDateFilter] = useState<Filter | null>(null);
  const [shiftFilter, setShiftFilter] = useState<Filter | null>(null);
  const [walkInFilter, setWalkInFilter] = useState<Filter | null>(null);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [resoDateFilter, shiftFilter, walkInFilter].filter((f) => !!f) as Filter[];
  }, [resoDateFilter, shiftFilter, walkInFilter]);

  return (
    <>
      <br />
      <b>
        <h1>{'Restaurant Shift Overview'}</h1>
      </b>
      <TableWrapper>
        <Table>
          <tbody>
            <Row>
              <Cell>
                <MemberFilterTile
                  title={'Filter by Date'}
                  dataSource="reservations"
                  attribute={DM.reservationscsv.ReservationDatetime.AggMinutesRoundTo15}
                  filter={resoDateFilter}
                  onChange={setResoDateFilter}
                />
              </Cell>
              <Cell>
                <MemberFilterTile
                  title={'Filter by Shift'}
                  dataSource="reservations"
                  attribute={DM.reservationscsv.Shift}
                  filter={shiftFilter}
                  onChange={setShiftFilter}
                />
              </Cell>
              <Cell>
                <MemberFilterTile
                  title={'Filter by walk-in'}
                  dataSource="reservations"
                  attribute={DM.reservationscsv.WalkIn}
                  filter={walkInFilter}
                  onChange={setWalkInFilter}
                />
              </Cell>
            </Row>
          </tbody>
        </Table>
      </TableWrapper>
      <TableWrapper>
        <Table>
          <tbody>
            <Row
              style={{
                fontSize: 'smaller',
                fontFamily: 'courier',
                marginBottom: '20px',
              }}
            >
              <Cell>
                <div style={{ width: '40vw' }}>{'Covers by Time'}</div>
                <ColumnChart
                  dataSet={DM.DataSource}
                  filters={activeFilters}
                  dataOptions={{
                    category: [
                      {
                        column: DM.reservationscsv.ReservationDatetime.AggMinutesRoundTo15,
                        continuous: true,
                      },
                    ],
                    value: [
                      measures.count(DM.reservationscsv.ReservationID, 'Total Reservations'),
                      measures.sum(DM.reservationscsv.PartySize, 'Total Covers'),
                    ],
                    breakBy: [],
                  }}
                  styleOptions={
                    {
                      subtype: 'column/stackedcolumn',
                      markers: {
                        enabled: true,
                      },
                      xAxis: {
                        title: {
                          enabled: true,
                          text: 'Time',
                        },
                      },
                      yAxis: {
                        labels: {
                          enabled: true,
                        },
                        title: {
                          enabled: true,
                          text: '# of Covers by Reservations',
                        },
                        max: 20,
                      },
                    } as StackableStyleOptions
                  }
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
                  }}
                />
              </Cell>
              <Cell>
                <div style={{ width: '40vw' }}>{'Split Reservations and Walk-ins'}</div>
                <ColumnChart
                  dataSet={DM.DataSource}
                  filters={activeFilters}
                  dataOptions={{
                    category: [
                      {
                        column: DM.reservationscsv.ReservationDatetime.AggMinutesRoundTo15,
                        continuous: true,
                      },
                    ],
                    value: [measures.sum(DM.reservationscsv.PartySize)],
                    breakBy: [DM.reservationscsv.WalkIn],
                  }}
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
                  }}
                />
              </Cell>
            </Row>
            <Row
              style={{
                fontSize: 'smaller',
                fontFamily: 'courier',
                marginBottom: '20px',
              }}
            >
              <Cell>
                <div style={{ width: '40vw' }}>{'Covers by Time & Reservation'}</div>
                <ColumnChart
                  dataSet={DM.DataSource}
                  filters={activeFilters}
                  dataOptions={{
                    category: [
                      {
                        column: DM.reservationscsv.ReservationDatetime.AggMinutesRoundTo15,
                        continuous: true,
                      },
                    ],
                    value: [measures.sum(DM.reservationscsv.PartySize)],
                    breakBy: [DM.reservationscsv.WalkIn, DM.reservationscsv.PartySize],
                  }}
                  styleOptions={
                    {
                      markers: {
                        enabled: true,
                      },
                      legend: {
                        enabled: false,
                      },
                      xAxis: {
                        title: {
                          enabled: true,
                          text: 'Time',
                        },
                      },
                      yAxis: {
                        labels: {
                          enabled: true,
                        },
                        title: {
                          enabled: true,
                          text: '# of Covers',
                        },
                        max: 20,
                      },
                    } as StackableStyleOptions
                  }
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
                  }}
                />
              </Cell>
              <Cell>
                <div style={{ width: '40vw' }}>{'Cumulative Total Party Size Over Time'}</div>
                <ColumnChart
                  dataSet={DM.DataSource}
                  filters={activeFilters}
                  dataOptions={{
                    category: [
                      {
                        column: DM.reservationscsv.ReservationDatetime.AggMinutesRoundTo15,
                        continuous: true,
                      },
                    ],
                    value: [measures.runningSum(measures.sum(DM.reservationscsv.PartySize))],
                    breakBy: [],
                  }}
                  onDataPointClick={(...args) => {
                    console.log('onDataPointClick', ...args);
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
