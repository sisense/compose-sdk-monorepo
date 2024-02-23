Pivot **Test** example

```js
const { Demo } = require('../Demo');
const PivotTableDemo = require('./PivotTableDemo').PivotTableDemo;

<Demo
  show={true}
  inputsCount={5}
  input-0-value={1}
  input-0-descr="Instant load"
  input-1-value={15}
  input-1-descr="Count"
  input-2-value={2}
  input-2-descr="Deep"
  input-3-value={900}
  input-3-descr="Width"
  input-4-value={400}
  input-4-descr="Height"
>
  {({ inputs, textAreas }) => {
    const instantLoad = inputs[0].value > 0;
    const count = inputs[1].value;
    const deep = inputs[2].value;
    const width = inputs[3].value;
    const height = inputs[4].value;

    return (
      <PivotTableDemo
        instantLoad={instantLoad}
        count={count}
        deep={deep}
        width={width}
        height={height}
      />
    );
  }}
</Demo>;
```
