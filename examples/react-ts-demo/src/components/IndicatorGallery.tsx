/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable max-lines */
/* eslint-disable max-lines-per-function */
import { measures } from '@sisense/sdk-data';
import { ExecuteQuery, IndicatorChart, ThemeProvider } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';
import { Container } from '../styles';
import { IndicatorDataOptions, IndicatorStyleOptions } from '@sisense/sdk-ui';
import { TableWrapper, Table, Row, Cell } from '../overStyle';
import { useState, useMemo } from 'react';
import { SingleSelectMemberToolbar } from './hooks';

const basicIndicatorStyleOptions: Partial<IndicatorStyleOptions> = {
  indicatorComponents: {
    title: {
      shouldBeShown: true,
      text: 'Average Cost',
    },
    secondaryTitle: {
      text: 'Total Revenue',
    },
    ticks: {
      shouldBeShown: true,
    },
    labels: {
      shouldBeShown: true,
    },
  },
};

const simpleNumericVerticalStyleOptions: IndicatorStyleOptions = {
  ...basicIndicatorStyleOptions,
  subtype: 'indicator/numeric',
  numericSubtype: 'numericSimple',
  skin: 'vertical',
};

const simpleNumericHorizontalStyleOptions: IndicatorStyleOptions = {
  ...basicIndicatorStyleOptions,
  subtype: 'indicator/numeric',
  numericSubtype: 'numericSimple',
  skin: 'horizontal',
};

const barNumericStyleOptions: IndicatorStyleOptions = {
  ...basicIndicatorStyleOptions,
  subtype: 'indicator/numeric',
  numericSubtype: 'numericBar',
};

const thinGaugeStyleOptions: IndicatorStyleOptions = {
  ...basicIndicatorStyleOptions,
  subtype: 'indicator/gauge',
  skin: 2,
};

const thickGaugeStyleOptions: IndicatorStyleOptions = {
  ...basicIndicatorStyleOptions,
  subtype: 'indicator/gauge',
  skin: 1,
};

const indicatorDataOptions: IndicatorDataOptions = {
  value: [
    {
      name: 'avg Cost',
      aggregation: 'sum',
    },
  ],
  secondary: [
    {
      name: 'sum Revenue',
      aggregation: 'sum',
    },
  ],
  min: [{ name: 'min Cost' }],
  max: [{ name: 'max Cost' }],
};

type IndicatorStyleToRender = { options: IndicatorStyleOptions; title: string };
const allIndicatorStylesToRender: IndicatorStyleToRender[] = [
  {
    options: simpleNumericHorizontalStyleOptions,
    title: 'Simple numeric horizontal',
  },
  {
    options: simpleNumericVerticalStyleOptions,
    title: 'Simple numeric vertical',
  },
  {
    options: barNumericStyleOptions,
    title: 'Bar numeric',
  },
  {
    options: thinGaugeStyleOptions,
    title: 'Thin gauge',
  },
  {
    options: thickGaugeStyleOptions,
    title: 'Thick gauge',
  },
];

const CHARTS_PER_ROW = 3;

type GalleryTheme = 'light' | 'dark';
const WRONG_THEME_OID = 'wrong-theme-oid';
const LIGHT_THEME_OID = import.meta.env.VITE_APP_SISENSE_THEME_OID_LIGHT ?? WRONG_THEME_OID;
const DARK_THEME_OID = import.meta.env.VITE_APP_SISENSE_THEME_OID_DARK ?? WRONG_THEME_OID;
const IS_THEME_OIDS_PROVIDED =
  LIGHT_THEME_OID !== WRONG_THEME_OID && DARK_THEME_OID !== WRONG_THEME_OID;

export const IndicatorGallery = () => {
  const [theme, setTheme] = useState<GalleryTheme>('light');
  const themeSettings = useMemo(() => {
    if (theme === 'light') {
      return LIGHT_THEME_OID;
    } else {
      return DARK_THEME_OID;
    }
  }, [theme]);

  const background = useMemo(() => {
    if (theme === 'light') {
      return 'white';
    } else {
      return '#333333';
    }
  }, [theme]);
  return (
    <Container direction="column">
      <b>
        <h1>
          <br />
          {'All types of indicators fed by single ExecuteQuery result data'}
        </h1>
      </b>
      <SingleSelectMemberToolbar
        title={'Choose a Theme'}
        members={[
          { text: 'Light (System)', data: 'light' },
          { text: 'Dark (System)', data: 'dark' },
        ]}
        selectedMember={theme}
        onChange={(member) => {
          setTheme((member as GalleryTheme) || 'light');
        }}
      />
      <ExecuteQuery
        dimensions={[]}
        measures={[
          measures.average(DM.Commerce.Cost),
          measures.sum(DM.Commerce.Revenue),
          measures.min(DM.Commerce.Cost),
          measures.max(DM.Commerce.Cost),
        ]}
        filters={[]}
      >
        {(data) => {
          if (data && data.rows) {
            // reformat all indicator styles into rows with CHARTS_PER_ROW indicators per row
            const rowsToRender: IndicatorStyleToRender[][] = allIndicatorStylesToRender.reduce(
              (rows, currentStyle, i) => {
                if (i % CHARTS_PER_ROW === 0) {
                  rows.push([currentStyle]);
                } else {
                  rows[rows.length - 1].push(currentStyle);
                }
                return rows;
              },
              [] as IndicatorStyleToRender[][],
            );
            return (
              <ThemeProvider theme={themeSettings}>
                <TableWrapper style={{ background: background }}>
                  <Table>
                    <tbody>
                      {rowsToRender.map((rowToRender, index) => (
                        <Row key={index} style={{ display: 'flex' }}>
                          {rowToRender.map((indicatorStyleToRender) => {
                            return (
                              <Cell
                                style={{
                                  width: '400px',
                                  height: '400px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyItems: 'center',
                                  border: '1px solid black',
                                  flexDirection: 'column',
                                }}
                                key={indicatorStyleToRender.title}
                              >
                                <IndicatorChart
                                  dataSet={data}
                                  dataOptions={indicatorDataOptions}
                                  styleOptions={indicatorStyleToRender.options}
                                />
                                <p
                                  style={{
                                    marginTop: '40px',
                                    color: theme === 'light' ? 'black' : 'white',
                                  }}
                                >
                                  {indicatorStyleToRender.title}
                                </p>
                              </Cell>
                            );
                          })}
                        </Row>
                      ))}
                    </tbody>
                  </Table>
                </TableWrapper>
              </ThemeProvider>
            );
          }
        }}
      </ExecuteQuery>
      {!IS_THEME_OIDS_PROVIDED && (
        <span style={{ color: 'green', fontStyle: 'italic' }}>
          Specify `VITE_APP_SISENSE_THEME_OID_LIGHT` and `VITE_APP_SISENSE_THEME_OID_DARK` variables
          in your `.env.local` file
        </span>
      )}
    </Container>
  );
};
