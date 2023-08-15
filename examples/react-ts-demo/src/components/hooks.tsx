/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { useMemo, useState } from 'react';
import * as DM from '../data-model/sample-ecommerce';
import { filters, Filter, measures, Cell, DateLevels } from '@sisense/sdk-data';
import { Button, Container, Input } from '../styles';
import { ChartType } from '@sisense/sdk-ui';
import { ExecuteQuery } from '@sisense/sdk-ui';

const CARTESIAN_CHART_TYPES = ['line', 'area', 'bar', 'column', 'polar'] as const;

const DATE_LEVEL_LIST: string[] = DateLevels.all;
export const useDateLevelToolbar = () => {
  const [activeLevel, setActiveLevel] = useState<(typeof DATE_LEVEL_LIST)[number]>('Years');

  const toolbar = (
    <Container padding={'3px'} wrap={'wrap'}>
      <h3>Select date level:</h3>
      {DATE_LEVEL_LIST.map((level) => {
        return (
          <Button
            key={level}
            active={activeLevel === level}
            onClick={() => {
              setActiveLevel(level);
            }}
          >
            {level}
          </Button>
        );
      })}
    </Container>
  );
  return { activeLevel, toolbar };
};

export const useDateFormatInput = () => {
  const [dateFormat, setDateFormat] = useState<string>('');

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    setDateFormat(event.target.value);
  }

  const toolbar = (
    <Container padding={'3px'}>
      <h3>Optional date format:</h3>
      <Input
        type="text"
        placeholder="Example: yyyy-MM-dd HH:mm:ss"
        value={dateFormat}
        onChange={handleInputChange}
      ></Input>
    </Container>
  );

  return { dateFormat, toolbar };
};

export const useFiltersToolbar = () => {
  const [activeYear, setActiveYear] = useState<string | null>(null);

  const activeFilters: Filter[] = useMemo(
    () => (activeYear ? [filters.members(DM.Commerce.Date.Years, [activeYear])] : []),
    [activeYear],
  );

  const toolbar = (
    <>
      <Container padding={'3px'}>
        <h3>Filter by year:</h3>
        <ExecuteQuery dimensions={[DM.Commerce.Date.Years]}>
          {(data) =>
            data.rows.map((r) => {
              const year = r[0].data;
              return (
                <Button
                  key={year}
                  active={activeYear === year}
                  onClick={() => {
                    setActiveYear(year);
                  }}
                >
                  {year.substring(0, 4)}
                </Button>
              );
            })
          }
        </ExecuteQuery>
        <Button active={activeYear === null} onClick={() => setActiveYear(null)}>
          All
        </Button>
      </Container>
    </>
  );

  return { activeFilters, toolbar };
};

export const useAttributeMeasureTypeToolbar = () => {
  const [attribute, setAttribute] = useState(DM.Commerce.AgeRange);
  const [measure, setMeasure] = useState(DM.Commerce.Revenue);
  const aggedMeasure = useMemo(() => measures.sum(measure), [measure]);

  const [chartType, setChartType] = useState<ChartType>('column');

  const toolbar = (
    <Container align={'center'} padding={'20px'}>
      <h3>Measure</h3>
      {[DM.Commerce.Revenue, DM.Commerce.Quantity, DM.Commerce.Cost].map((m) => (
        <Button
          key={m.name}
          active={measure === m}
          onClick={() => {
            setMeasure(m);
          }}
        >
          {m.name}
        </Button>
      ))}
      <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <h3>X-axis</h3>
      {[DM.Commerce.AgeRange, DM.Category.Category, DM.Commerce.Gender].map((d) => (
        <Button
          key={d.name}
          active={attribute === d}
          onClick={() => {
            setAttribute(d);
          }}
        >
          {d.name}
        </Button>
      ))}
      <div>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>
      <h3> Chart Type</h3>
      {CARTESIAN_CHART_TYPES.map((type) => {
        return (
          <Button
            active={type === chartType}
            key={type}
            onClick={() => {
              setChartType(type);
            }}
          >
            {type}
          </Button>
        );
      })}
      <br />
    </Container>
  );

  return { attribute, aggedMeasure, chartType, toolbar };
};

interface Props {
  title: string;
  selectedMember: string;
  members: Cell[];
  onChange: (member: string | null) => void;
}
export const SingleSelectMemberToolbar = ({ title, selectedMember, members, onChange }: Props) => {
  return (
    <>
      <Container padding={'3px'}>
        <h3>{title}:</h3>
        {members.map((member) => {
          return (
            <div key={member.data}>
              <Button
                key={member.data}
                active={selectedMember === member.data}
                onClick={() => {
                  onChange(member.data);
                }}
              >
                {member.text}
              </Button>
            </div>
          );
        })}
      </Container>
    </>
  );
};

interface Props {
  title: string;
  selectedMember: string;
  members: Cell[];
  onChange: (member: string | null) => void;
}
export const SingleSelectMemberFilter = ({ title, selectedMember, members, onChange }: Props) => {
  return (
    <>
      <Container padding={'3px'}>
        <h3>{title}:</h3>
        {members.map((member) => {
          return (
            <div key={member.data}>
              <Button
                key={member.data}
                active={selectedMember === member.data}
                onClick={() => {
                  onChange(member.data);
                }}
              >
                {member.text}
              </Button>
            </div>
          );
        })}
        <Button
          key={title}
          active={selectedMember === null}
          onClick={() => {
            onChange(null);
          }}
        >
          All
        </Button>
      </Container>
    </>
  );
};
