/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Chart, ExecuteQuery } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { filters, measures, Sort, QueryResultData } from '@sisense/sdk-data';
import { Cell, Table, HeadRow, EmptyCell, Head, Row, RowHead, TableWrapper } from '../overStyle';

const colors = [
  '#e6194b',
  '#3cb44b',
  '#ffe119',
  '#4363d8',
  '#f58231',
  '#911eb4',
  '#46f0f0',
  '#f032e6',
  '#bcf60c',
  '#fabebe',
  '#008080',
  '#e6beff',
  '#9a6324',
  '#fffac8',
  '#800000',
  '#aaffc3',
  '#808000',
  '#ffd8b1',
  '#000075',
  '#808080',
  '#000000',
];
const getRandomColor = () => {
  const randNum = Math.floor(Math.random() * colors.length);
  return colors[randNum];
};

// Create a 2D representation of values based off a set of query results.
const makeMatrix = (data: QueryResultData): { x: string[]; y: string[] } => {
  const distinctY = new Set<string>();
  const distinctX = new Set<string>();

  const res: { x: string[]; y: string[] } = {
    x: [],
    y: [],
  };

  data.rows.forEach((row) => {
    // This is similar to the "key" in a CategoricalXValues object
    const x = row
      .slice(0, -1)
      .map((r) => r.text ?? r.data.toString())
      .join(',');

    if (!distinctX.has(x)) {
      res.x.push(x);
    }
    distinctX.add(x);

    const y = row[row.length - 1].text ?? row[row.length - 1].data.toString();
    if (!distinctY.has(y)) {
      res.y.push(y);
    }
    distinctY.add(y);
  });

  return res;
};

export const Page7 = () => {
  return (
    <>
      <b>
        <h1>{'Flexibility will allow future advanced ComposeSDK capabilities'}</h1>
      </b>
      <ExecuteQuery
        dimensions={[
          DM.Commerce.Date.Months.sort(Sort.Ascending),
          DM.Commerce.Date.Years.sort(Sort.Ascending),
        ]}
      >
        {(data) => {
          const matrix = makeMatrix(data);

          const monthNumbers = matrix.x
            .map((datemonth: string) => new Date(datemonth).getMonth() + 1)
            .filter((monthNumber, index, allMonths) => allMonths.indexOf(monthNumber) === index)
            .sort((a, b) => a - b)
            .map((m) => `${m}`);

          const years = matrix.y.filter((year) => year !== '2009');
          return (
            <TableWrapper>
              <Table>
                <tbody>
                  <HeadRow>
                    <EmptyCell />
                    {years.map((year) => (
                      <Head columns={4} key={year}>
                        {year}
                      </Head>
                    ))}
                  </HeadRow>
                  {monthNumbers.map((monthNumber, i) => {
                    return (
                      <Row key={i}>
                        <RowHead key={monthNumber}>{monthNumber}</RowHead>
                        {years.map((year) => (
                          <Cell key={`${monthNumber}_${year}`}>
                            <Chart
                              chartType="column"
                              dataOptions={{
                                category: [DM.Commerce.Gender],
                                value: [
                                  {
                                    column: measures.count(DM.Commerce.Quantity),
                                    color: getRandomColor(),
                                  },
                                ],
                                breakBy: [],
                              }}
                              styleOptions={{ legend: { enabled: false } }}
                              filters={[
                                filters.members(DM.Commerce.Date.Months, [
                                  `${year}-${monthNumber.padStart(2, '0')}-01`,
                                ]),
                              ]}
                            />
                          </Cell>
                        ))}
                      </Row>
                    );
                  })}
                </tbody>
              </Table>
            </TableWrapper>
          );
        }}
      </ExecuteQuery>
    </>
  );
};
