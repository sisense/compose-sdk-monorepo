/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { measures as measureFactory, filters as filterFactory } from '@sisense/sdk-data';
import * as DM from '../sample-ecommerce-autogenerated';
import * as Ecom from '../sample-ecommerce-autogenerated';
import { ColumnChart } from '../../components/column-chart';
import { useEffect, useMemo, useState } from 'react';
import { useExecuteQuery } from '../../components/query-execution';

const dataOptions = {
  category: [DM.Category.Category],
  value: [measureFactory.sum(Ecom.Commerce.Revenue)],
  breakBy: [DM.Commerce.Gender],
};

const valueList = ['Male', 'Female'];

export const SubChart = ({ value }: { value: string }) => {
  const dimensions = useMemo(() => [...dataOptions.breakBy, ...dataOptions.category], []);

  const filterList = [];
  // needed two filters to cause issue
  filterList.push(filterFactory.members(DM.Category.Category, ['Cell Phones']));
  filterList.push(filterFactory.members(DM.Commerce.Gender, [value]));

  const { data } = useExecuteQuery({
    measures: dataOptions.value,
    dimensions: dimensions,
    filters: filterList,
  });

  return (
    <div className="csdk-h-fit">
      {`RENDERING: ${value}`}
      <ColumnChart dataSet={data} dataOptions={dataOptions} />
    </div>
  );
};

export const ChartFilterCycle = () => {
  const [filterIndex, setFilterIndex] = useState(0);

  useEffect(() => {
    if (filterIndex > 20) return;
    setTimeout(() => setFilterIndex(filterIndex + 1), 5000);
  }, [filterIndex]);

  return <SubChart value={valueList[filterIndex % 2]} />;
};
