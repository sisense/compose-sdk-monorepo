/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable max-lines */
/* eslint-disable complexity */
import { useState } from 'react';
import * as DM from '../data-model/sample-ecommerce';
import { Chart, ChartProps } from '@sisense/sdk-ui';
import { measures, filters, Attribute, Measure, AggregationTypes } from '@sisense/sdk-data';
import { Container } from '../styles';

type ValueOf<Obj> = Obj[keyof Obj];

type AggregationTypesValue = ValueOf<typeof AggregationTypes>;

const getAggregationFn = (aggType: AggregationTypesValue) => {
  switch (aggType) {
    case AggregationTypes.Sum:
      return measures.sum;
    case AggregationTypes.Count:
      return measures.count;
    case AggregationTypes.CountDistinct:
      return measures.countDistinct;
    case AggregationTypes.Min:
      return measures.min;
    case AggregationTypes.Max:
      return measures.max;
    case AggregationTypes.Median:
      return measures.median;
    case AggregationTypes.Average:
      return measures.average;
    default:
      return measures.sum;
  }
};

enum FormulaFunctionNames {
  Contribution = 'Contribution',
  Growth = 'Growth',
  GrowthRate = 'GrowthRate',
  GrowthPastYear = 'GrowthPastYear',
  GrowthPastQuarter = 'GrowthPastQuarter',
  GrowthPastMonth = 'GrowthPastMonth',
  GrowthPastWeek = 'GrowthPastWeek',
  RunningSum = 'RunningSum',
  YearToDateSum = 'YearToDateSum',
  QuarterToDateSum = 'QuarterToDateSum',
  MonthToDateSum = 'MonthToDateSum',
  WeekToDateSum = 'WeekToDateSum',
  Difference = 'Difference',
  DiffPastYear = 'DiffPastYear',
  DiffPastQuarter = 'DiffPastQuarter',
  DiffPastMonth = 'DiffPastMonth',
  DiffPastWeek = 'DiffPastWeek',
  PastYear = 'PastYear',
  PastQuarter = 'PastQuarter',
  PastMonth = 'PastMonth',
  PastWeek = 'PastWeek',
  PastDay = 'PastDay',
}

const getFormulaFn = (formulaFnName: FormulaFunctionNames) => {
  switch (formulaFnName) {
    case FormulaFunctionNames.Contribution:
      return measures.contribution;
    case FormulaFunctionNames.Growth:
      return measures.growth;
    case FormulaFunctionNames.GrowthRate:
      return measures.growthRate;
    case FormulaFunctionNames.GrowthPastYear:
      return measures.growthPastYear;
    case FormulaFunctionNames.GrowthPastQuarter:
      return measures.growthPastQuarter;
    case FormulaFunctionNames.GrowthPastMonth:
      return measures.growthPastMonth;
    case FormulaFunctionNames.GrowthPastWeek:
      return measures.growthPastWeek;
    case FormulaFunctionNames.RunningSum:
      return measures.runningSum;
    case FormulaFunctionNames.YearToDateSum:
      return measures.yearToDateSum;
    case FormulaFunctionNames.QuarterToDateSum:
      return measures.quarterToDateSum;
    case FormulaFunctionNames.MonthToDateSum:
      return measures.monthToDateSum;
    case FormulaFunctionNames.WeekToDateSum:
      return measures.weekToDateSum;
    case FormulaFunctionNames.Difference:
      return measures.difference;
    case FormulaFunctionNames.DiffPastYear:
      return measures.diffPastYear;
    case FormulaFunctionNames.DiffPastQuarter:
      return measures.diffPastQuarter;
    case FormulaFunctionNames.DiffPastMonth:
      return measures.diffPastMonth;
    case FormulaFunctionNames.DiffPastWeek:
      return measures.diffPastWeek;
    case FormulaFunctionNames.PastYear:
      return measures.pastYear;
    case FormulaFunctionNames.PastQuarter:
      return measures.pastQuarter;
    case FormulaFunctionNames.PastMonth:
      return measures.pastMonth;
    case FormulaFunctionNames.PastWeek:
      return measures.pastWeek;
    case FormulaFunctionNames.PastDay:
      return measures.pastDay;
  }
};

const getDataOptions = (measure: Measure) => {
  return {
    category: [DM.Commerce.Date.Years],
    value: [measure],
    breakBy: [DM.Commerce.AgeRange],
  };
};

const AggSelect = (props: {
  value: AggregationTypesValue;
  onChange: (value: AggregationTypesValue) => void;
}) => {
  return (
    <select value={props.value} onChange={(ev) => props.onChange(ev.target.value)}>
      {Object.keys(AggregationTypes).map((aggKey) => (
        <option key={aggKey} value={AggregationTypes[aggKey as keyof typeof AggregationTypes]}>
          {aggKey}
        </option>
      ))}
    </select>
  );
};

const DemoChart = (props: Partial<ChartProps> & { title?: string }) => (
  <div
    style={{
      textAlign: 'center',
      border: '1px solid #eee',
      borderRadius: '3px',
      margin: '0 0 5px 5px',
    }}
  >
    <code>{props.title}</code>
    <div
      style={{
        width: 600,
        height: 400,
      }}
    >
      <Chart chartType={'column'} dataSet={DM.DataSource} dataOptions={props.dataOptions!} />
    </div>
  </div>
);

const AggregationsSection = () => {
  const [aggType, setAggType] = useState<AggregationTypesValue>(AggregationTypes.Sum);
  const aggregationFn = getAggregationFn(aggType);
  const measure = aggregationFn(DM.Commerce.Cost);
  const dataOptions = getDataOptions(measure);

  return (
    <>
      <h3>Measure with aggregation</h3>
      <span style={{ marginLeft: '20px' }}>Aggregation: </span>
      <AggSelect value={aggType} onChange={setAggType}></AggSelect>
      <Container style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
        <DemoChart title={measure.name} dataOptions={dataOptions} />
      </Container>
    </>
  );
};

const SingleOperandFormulaFunctionsSection = () => {
  const [aggType, setAggType] = useState<AggregationTypesValue>(AggregationTypes.Sum);
  const [formulaFnName, setFormulaFnName] = useState<FormulaFunctionNames>(
    FormulaFunctionNames.Growth,
  );
  const aggregationFn = getAggregationFn(aggType);
  const formulaFn = getFormulaFn(formulaFnName);
  const measure = formulaFn(aggregationFn(DM.Commerce.Cost));
  const dataOptions = getDataOptions(measure);
  return (
    <>
      <h3>Measure with formula unary function</h3>
      <span style={{ marginLeft: '20px' }}>Aggregation: </span>
      <AggSelect value={aggType} onChange={setAggType}></AggSelect>
      <span style={{ marginLeft: '20px' }}>Function: </span>
      <select
        value={formulaFnName}
        onChange={(ev) => setFormulaFnName(ev.target.value as FormulaFunctionNames)}
      >
        {Object.values(FormulaFunctionNames).map((fnName) => (
          <option key={fnName} value={fnName}>
            {fnName}
          </option>
        ))}
      </select>
      <Container style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
        <DemoChart title={measure.jaql().jaql.formula} dataOptions={dataOptions} />
      </Container>
    </>
  );
};

enum OperandTypes {
  Number = 'Number',
  // eslint-disable-next-line @typescript-eslint/no-shadow
  Measure = 'Measure',
}

type Operand = {
  type: OperandTypes;
  number: number;
  measure: Attribute;
  aggType: AggregationTypesValue;
};

const OperandSelector = (props: { operand: Operand; onChange: (operand: Operand) => void }) => {
  const { operand, onChange } = props;
  const measureItems = {
    Cost: DM.Commerce.Cost,
    Revenue: DM.Commerce.Revenue,
  };
  const getSelectedMeasureName = () => {
    return Object.entries(measureItems)
      .map(([name, measure]) => ({ name, measure }))
      .find(({ measure }) => measure === operand.measure)?.name;
  };
  return (
    <>
      <span style={{ marginLeft: '20px' }}>Type: </span>
      <select
        value={operand.type}
        onChange={(ev) => onChange({ ...operand, type: ev.target.value as OperandTypes })}
      >
        {Object.values(OperandTypes).map((type) => (
          <option key={type} value={type}>
            {type}
          </option>
        ))}
      </select>
      {operand.type === OperandTypes.Number && (
        <>
          <span style={{ marginLeft: '20px' }}>Value: </span>
          <input
            style={{
              height: '38px',
              borderRadius: '10px',
              backgroundColor: '#efefef',
              borderBottom: '2px solid #9c27b0',
              width: '80px',
              textAlign: 'right',
            }}
            type="number"
            value={operand.number}
            onChange={(ev) => onChange({ ...operand, number: parseFloat(ev.target.value) })}
          />
        </>
      )}
      {operand.type === OperandTypes.Measure && (
        <>
          <span style={{ marginLeft: '20px' }}>Measure: </span>
          <select
            value={getSelectedMeasureName()}
            onChange={(ev) =>
              onChange({
                ...operand,
                measure: measureItems[ev.target.value as keyof typeof measureItems],
              })
            }
          >
            {Object.keys(measureItems).map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          <span style={{ marginLeft: '20px' }}>Aggregation: </span>
          <AggSelect
            value={operand.aggType}
            onChange={(aggType) => onChange({ ...operand, aggType })}
          ></AggSelect>
        </>
      )}
    </>
  );
};

enum ArithmeticFunctionsNames {
  Add = 'Add',
  Subtract = 'Subtract',
  Multiply = 'Multiply',
  Divide = 'Divide',
}

const getArithmeticFn = (fnName: ArithmeticFunctionsNames) => {
  switch (fnName) {
    case ArithmeticFunctionsNames.Add:
      return measures.add;
    case ArithmeticFunctionsNames.Subtract:
      return measures.subtract;
    case ArithmeticFunctionsNames.Multiply:
      return measures.multiply;
    case ArithmeticFunctionsNames.Divide:
      return measures.divide;
  }
};

const ArithmeticalFormulaFunctionsSection = () => {
  const [arithmeticFnName, setArithmeticFnName] = useState<ArithmeticFunctionsNames>(
    ArithmeticFunctionsNames.Subtract,
  );
  const [operand1, setOperand1] = useState<Operand>({
    type: OperandTypes.Measure,
    number: 1,
    measure: DM.Commerce.Revenue,
    aggType: AggregationTypes.Sum,
  });
  const [operand2, setOperand2] = useState<Operand>({
    type: OperandTypes.Number,
    number: 500000,
    measure: DM.Commerce.Cost,
    aggType: AggregationTypes.Sum,
  });
  const getOperandValue = (operand: Operand) => {
    if (operand.type === OperandTypes.Measure) {
      return getAggregationFn(operand.aggType)(operand.measure);
    }
    return operand.number;
  };
  const measure = getArithmeticFn(arithmeticFnName)(
    getOperandValue(operand1),
    getOperandValue(operand2),
  );
  const dataOptions = getDataOptions(measure);

  return (
    <>
      <h3>Measure with arithmetical formula binary function</h3>
      <span style={{ marginLeft: '20px' }}>Function: </span>
      <select
        value={arithmeticFnName}
        onChange={(ev) => setArithmeticFnName(ev.target.value as ArithmeticFunctionsNames)}
      >
        {Object.keys(ArithmeticFunctionsNames).map((measureName) => (
          <option key={measureName} value={measureName}>
            {measureName}
          </option>
        ))}
      </select>
      <div style={{ marginLeft: '20px' }}>
        <h4>Operand #1</h4>
        <OperandSelector operand={operand1} onChange={setOperand1}></OperandSelector>
        <h4>Operand #2</h4>
        <OperandSelector operand={operand2} onChange={setOperand2}></OperandSelector>
      </div>
      <Container style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
        <DemoChart title={measure.jaql().jaql.formula} dataOptions={dataOptions} />
      </Container>
    </>
  );
};

type RankingSortTypes = typeof measures.RankingSortTypes;
type RankingTypes = typeof measures.RankingTypes;

const RankFunctionSection = () => {
  const groupBySelectOptions = {
    None: [],
    'Age Range': [DM.Commerce.AgeRange],
    'Date.Years': [DM.Commerce.Date.Years],
  };
  const [sortOrder, setSortOrder] = useState<ValueOf<RankingSortTypes>>(
    measures.RankingSortTypes.Descending,
  );
  const [rankType, setRankType] = useState<ValueOf<RankingTypes>>(
    measures.RankingTypes.StandardCompetition,
  );
  const [aggType, setAggType] = useState<AggregationTypesValue>(AggregationTypes.Sum);
  const [groupByType, setGroupByType] = useState<keyof typeof groupBySelectOptions>('Age Range');
  const aggregationFn = getAggregationFn(aggType);
  const groupBy = groupBySelectOptions[groupByType];
  const measure = measures.rank(
    aggregationFn(DM.Commerce.Cost),
    undefined,
    sortOrder,
    rankType,
    groupBy,
  );
  const dataOptions = getDataOptions(measure);

  return (
    <>
      <h3>Measure with "Rank" formula function</h3>
      <span style={{ marginLeft: '20px' }}>Aggregation: </span>
      <AggSelect value={aggType} onChange={setAggType}></AggSelect>
      <span style={{ marginLeft: '20px' }}>Sort order: </span>
      <select value={sortOrder} onChange={(ev) => setSortOrder(ev.target.value)}>
        {Object.values(measures.RankingSortTypes).map((rankingSortOrder) => (
          <option key={rankingSortOrder} value={rankingSortOrder}>
            {rankingSortOrder}
          </option>
        ))}
      </select>
      <span style={{ marginLeft: '20px' }}>Rank type: </span>
      <select value={rankType} onChange={(ev) => setRankType(ev.target.value)}>
        {Object.keys(measures.RankingTypes).map((typeKey) => (
          <option key={typeKey} value={measures.RankingTypes[typeKey as keyof RankingTypes]}>
            {typeKey}
          </option>
        ))}
      </select>
      <span style={{ marginLeft: '20px' }}>Group By (Attributes): </span>
      <select
        value={groupByType}
        onChange={(ev) => setGroupByType(ev.target.value as keyof typeof groupBySelectOptions)}
      >
        {Object.keys(groupBySelectOptions).map((groupByTypeKey) => (
          <option key={groupByTypeKey} value={groupByTypeKey}>
            {groupByTypeKey}
          </option>
        ))}
      </select>
      <Container style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
        <DemoChart title={measure.jaql().jaql.formula} dataOptions={dataOptions} />
      </Container>
    </>
  );
};

const MeasuredValueSection = () => {
  const targetMeasure = measures.sum(DM.Commerce.Cost);
  const targetFilters = [filters.equals(DM.Country.Country, 'United States')];
  const measure = measures.measuredValue(targetMeasure, targetFilters);
  const dataOptions = getDataOptions(measure);

  return (
    <>
      <h3>Measure with conditions/filters ("Measured Value" feature)</h3>
      <Container style={{ padding: '10px 0', display: 'flex', justifyContent: 'center' }}>
        <DemoChart title="([sumCost],[Country equals 'United States'])" dataOptions={dataOptions} />
      </Container>
    </>
  );
};

export const Page11 = () => {
  return (
    <div style={{ marginLeft: '20px' }}>
      <br />
      <h1>
        <b>
          "Measures" configuring possibilities with different aggregations and formula functions
        </b>
      </h1>
      <br />
      <AggregationsSection></AggregationsSection>
      <SingleOperandFormulaFunctionsSection></SingleOperandFormulaFunctionsSection>
      <ArithmeticalFormulaFunctionsSection></ArithmeticalFormulaFunctionsSection>
      <RankFunctionSection></RankFunctionSection>
      <MeasuredValueSection></MeasuredValueSection>
    </div>
  );
};
