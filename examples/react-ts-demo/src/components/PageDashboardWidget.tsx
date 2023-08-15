/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable max-lines-per-function */
import { DashboardWidget, MemberFilterTile } from '@sisense/sdk-ui';
import { Cell, Table, Row, TableWrapper } from '../overStyle';
import { getEnvURL, getEnvWidgets } from '../App';
import { useState, useCallback, useMemo } from 'react';
import { Filter, filters } from '@sisense/sdk-data';
import * as DM from '../data-model/sample-ecommerce';

export const PageDashboardWidget = () => {
  const [widgetListStr, setWidgetList] = useState(getEnvWidgets());

  const getWidgets = useCallback(() => {
    if (!widgetListStr) return [];

    const dashboards = widgetListStr.split('|');
    return dashboards
      .map((dashWidgetsStr: string) => {
        const [dashId, widgetIdsStr] = dashWidgetsStr.split(':');
        if (!widgetIdsStr) return { Id: '' };
        const widgetIds = widgetIdsStr.split(',');
        return {
          Id: dashId.trim(),
          widgetIds: widgetIds.map((widgetId) => widgetId.trim()),
        };
      })
      .filter((d: any) => 'Id' in d);
  }, [widgetListStr]);

  const [yearFilter, setYearFilter] = useState<Filter | null>(
    filters.members(DM.Commerce.Date.Years, ['2013-01-01T00:00:00']),
  );

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [yearFilter].filter((f) => !!f) as Filter[];
  }, [yearFilter]);

  return (
    <>
      {getWidgets()[0] && (
        <b>
          <h1>
            <br />
            {'Widgets Rendered From a Dashboard based on Widget Id: '}
            <a
              style={{ alignContent: 'center', color: 'blue' }}
              href={`${getEnvURL()}app/main/dashboards/${getWidgets()[0].Id}`}
              target="_new"
            >
              {'Sample Ecommerce'}
            </a>
          </h1>
        </b>
      )}
      <br />
      <div style={{ display: 'inline-flex', flexDirection: 'row' }}>
        <MemberFilterTile
          title={'Year'}
          attribute={DM.Commerce.Date.Years}
          filter={yearFilter}
          onChange={setYearFilter}
        />
        <div
          style={{
            textAlign: 'left',
            padding: '50px',
          }}
        >
          <label>
            <div>
              {
                'Enter list of widgets: <dashboard id>:<widget id>,<widget id>|<dashboard id>:<widget id>,<widget id>'
              }
            </div>
            <input
              style={{ border: '1px solid gray' }}
              type="text"
              value={widgetListStr}
              size={Math.max(widgetListStr.length + 20, 90)}
              onChange={(e) => setWidgetList(e.target.value.trim())}
            />
          </label>
        </div>
      </div>
      <TableWrapper>
        <Table>
          <tbody>
            {getWidgets().map((dash: any, dashIndex: number) => {
              return (
                <Row key={dashIndex}>
                  {dash.widgetIds.map((widgetId: string, widgetIndex: number) => {
                    return (
                      <Cell key={`${dashIndex}-${widgetIndex}`}>
                        <div style={{ width: '40vw' }}>{`Widget ${dashIndex}-${widgetIndex}`}</div>
                        <DashboardWidget
                          widgetOid={widgetId}
                          dashboardOid={dash.Id}
                          filters={
                            widgetIndex === 0
                              ? activeFilters
                              : [
                                  ...activeFilters,
                                  filters.members(DM.Commerce.Gender, ['Male', 'Female']),
                                ]
                          }
                          highlights={[]}
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
    </>
  );
};
