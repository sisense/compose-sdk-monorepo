/* eslint-disable max-lines-per-function */
import { Chart, MemberFilterTile } from '@sisense/sdk-ui';
import { useCallback, useMemo, useState } from 'react';
import { useDateFormatInput, useDateLevelToolbar } from './hooks';
import { Column, Filter, filters, measures } from '@sisense/sdk-data';
import type { CartesianChartDataOptions, StyledColumn } from '@sisense/sdk-ui';
import * as DM from '../data-model/sample-ecommerce';

export const PageBlogArticle = () => {
  const { activeLevel: dateLevelForX } = useDateLevelToolbar();
  const { dateFormat: dateFormatForX } = useDateFormatInput();

  const [yearFilter, setYearFilter] = useState<Filter | null>(null);
  const [genderFilter, setGenderFilter] = useState<Filter | null>(null);

  const yearFilterOnClick = useCallback((text: string | null) => {
    if (!text) {
      setYearFilter(null);
      return;
    }
    setYearFilter(filters.members(DM.Commerce.Date.Years, [text]));
  }, []);

  // accumulate only filters with sub selection
  const activeFilters = useMemo<Filter[]>(() => {
    return [yearFilter, genderFilter, filters.greaterThan(DM.Commerce.Revenue, 0)].filter(
      (f) => !!f,
    ) as Filter[];
  }, [yearFilter, genderFilter]);

  const xDateDimension: StyledColumn = useMemo(() => {
    const xDateLevel: Column = DM.Commerce.Date[dateLevelForX] as Column;
    return {
      // name: xDateLevel.name,
      // type: xDateLevel.type,
      column: xDateLevel,
      dateFormat: dateFormatForX,
    };
  }, [dateLevelForX, dateFormatForX]);

  const measure = measures.sum(DM.Commerce.Revenue);
  const quantity = measures.sum(DM.Commerce.Quantity);

  const dataOptions: CartesianChartDataOptions = useMemo(() => {
    return {
      category: [xDateDimension],
      value: [measure],
      breakBy: [DM.Commerce.AgeRange],
    };
  }, [xDateDimension, measure]);

  const h2Style = { margin: '2rem 0', fontSize: '2rem' };
  const pStyle = { margin: '1rem 0' };

  return (
    <article
      style={{
        padding: '2rem',
        backgroundColor: '#f9f9f9',
        width: '764px',
        maxWidth: '100%',
        margin: '0 auto',
      }}
    >
      <h1 style={{ textAlign: 'center', margin: '2rem 0', fontSize: '3rem' }}>
        Data Analysis Article
      </h1>
      <p style={pStyle}>
        This is article demonstration of how the Data Analysis components can contribute to the
        content. It includes a variety of charts and graphs that are used to visualize data, with a
        narrative that provides interpretation of the data.
      </p>
      <section style={{ margin: '2rem 0' }}>
        <h2 style={h2Style}>Quantity by Year based on gender</h2>
        <Chart
          chartType={'bar'}
          dataSet={DM.DataSource}
          dataOptions={{
            category: [xDateDimension],
            value: [quantity],
            breakBy: [DM.Commerce.Gender],
          }}
        />{' '}
        <p style={pStyle}>
          The bar chart above illustrates the quantity by year generated based on gender. It clearly
          shows the distribution of quantity among different years and genders
        </p>
      </section>
      <section style={{ margin: '2rem 0' }}>
        <h2 style={h2Style}>Revenue broken by Gender </h2>
        <Chart
          chartType={'line'}
          dataSet={DM.DataSource}
          dataOptions={{
            category: [xDateDimension],
            value: [measure],
            breakBy: [DM.Commerce.Gender],
          }}
        />
        <p style={pStyle}>
          The line chart above represents the revenue generated over the years. It demonstrates the
          growth trend, with revenue steadily increasing from 2021 to 2023. This data indicates a
          positive business trajectory and potential for future growth.
        </p>
      </section>
      <section style={{ margin: '2rem 0' }}>
        <h2 style={h2Style}>Revenue by Year and Gender with filtering </h2>
        <div style={{ display: 'flex' }}>
          <div style={{ marginRight: '16px' }}>
            <MemberFilterTile
              title={'Filter by year'}
              attribute={DM.Commerce.Date.Years}
              filter={yearFilter}
              onChange={setYearFilter}
            />
          </div>
          <div>
            <MemberFilterTile
              title={'Gender'}
              attribute={DM.Commerce.Gender}
              filter={genderFilter}
              onChange={setGenderFilter}
            />
          </div>
        </div>
        <hr style={{ margin: 16 }} />
        <Chart
          chartType={'column'}
          dataSet={DM.DataSource}
          filters={activeFilters}
          dataOptions={dataOptions}
          onDataPointClick={(point) => {
            yearFilterOnClick(`${point.categoryValue}`);
          }}
        />
        <p style={pStyle}>
          The column chart above showcases the revenue generated based on different year and gender.
          It helps visualize how revenue is distributed across specific gender. This data can be
          used to identify profitable year and gender and tailor marketing strategies accordingly
          with the possibility to filter the data.
        </p>
      </section>
    </article>
  );
};
