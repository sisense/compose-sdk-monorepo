/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo, useState } from 'react';
import * as DM from '../data-model/sample-ecommerce';
import { ExecuteQuery } from '@sisense/sdk-ui';
import { measures } from '@sisense/sdk-data';
import Temperature from './common/Temperature';
import Circle from './common/Circle';
import { Button, Container } from '../styles';

export const Page8 = () => {
  const [date, setDate] = useState([DM.Commerce.Date.Years]);
  const [selectValue, setSelectValue] = useState<string>('Revenue');
  const rangeDates = ['Years', 'Months', 'Quarters', 'Days'];

  const measure = useMemo(() => {
    switch (selectValue) {
      case 'Cost':
        return measures.sum(DM.Commerce.Cost);
      case 'Quantity':
        return measures.count(DM.Commerce.Quantity);
      case 'Revenue':
      default:
        return measures.sum(DM.Commerce.Revenue);
    }
  }, [selectValue]);

  return (
    <div>
      <b>
        <h1>
          <br />
          {'Customer only uses ComposeSDK to query data - they create their own charts'}
        </h1>
      </b>
      <Container padding={'20px'} justify={'center'} align={'baseline'}>
        <select value={selectValue} onChange={(ev) => setSelectValue(ev.target.value)}>
          <option key={'Revenue'} value={'Revenue'}>
            Revenue
          </option>
          <option key={'Cost'} value={'Cost'}>
            Cost
          </option>
          <option key={'Quantity'} value={'Quantity'}>
            Quantity
          </option>
        </select>
        <Container padding={'20px'}>
          {rangeDates.map((range) => (
            <Button key={range} onClick={() => setDate([DM.Commerce.Date[range]])}>
              {range}
            </Button>
          ))}
        </Container>
      </Container>
      <ExecuteQuery dataSource={DM.DataSource} dimensions={date} measures={[measure]} filters={[]}>
        {(data) => {
          if (!data || !data.rows[0] || !data.rows[0][1]) {
            return;
          }

          const cellText = data.rows[0][1].text ?? data.rows[0][1].data.toString();

          return (
            <Container direction={'column'} justify={'center'} align={'center'}>
              <Temperature temp={Number(cellText.substring(0, 4))} scale={10000} />
              <Circle temp={Number(cellText.substring(0, 4))} />
            </Container>
          );
        }}
      </ExecuteQuery>
    </div>
  );
};
