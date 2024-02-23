```js
const { Demo } = require('../Demo');
const PaginationPanelDemo = require('./PaginationPanelDemo').PaginationPanelDemo;

<Demo
  show
  className="pagination-panel-demo"
  inputsCount={10}
  input-0-value={1000}
  input-0-descr="Items count"
  input-1-value={20}
  input-1-descr="Per page"
  input-2-value={7}
  input-2-descr="Visible pages"
  input-3-value={0}
  input-3-descr="Active page"
  input-4-value={0}
  input-4-descr="All loaded"
  input-5-value={1000}
  input-5-descr="Total count"
  input-6-value={0}
  input-6-descr="Limit reached"
  input-7-value={0}
  input-7-descr="Limit reached"
  input-8-value={0}
  input-8-descr="Columns count"
  input-9-value={0}
  input-9-descr="Columns total count"
>
  {({ inputs, holderWidth }) => {
    const itemsCount = parseInt(inputs[0].value);
    const pageSize = parseInt(inputs[1].value);
    const activePage = parseInt(inputs[3].value);
    const isAllDataLoaded = inputs[4].value > 0;
    const totalItemsCount = parseInt(inputs[5].value);
    const limitReached = inputs[6].value > 0;
    const limitCount = parseInt(inputs[7].value);
    const columnsCount = parseInt(inputs[8].value);
    const totalColumnsCount = parseInt(inputs[9].value);

    return (
      <div>
        Desktop:
        <PaginationPanelDemo
          itemsCount={itemsCount}
          totalItemsCount={totalItemsCount}
          columnsCount={columnsCount}
          totalColumnsCount={totalColumnsCount}
          pageSize={pageSize}
          activePage={activePage}
          isAllDataLoaded={isAllDataLoaded}
          holderWidth={holderWidth}
          limitReached={limitReached}
          limitCount={limitCount}
        />
        Mobile:
        <PaginationPanelDemo
          isMobile
          itemsCount={itemsCount}
          totalItemsCount={totalItemsCount}
          columnsCount={columnsCount}
          totalColumnsCount={totalColumnsCount}
          pageSize={pageSize}
          activePage={activePage}
          isAllDataLoaded={isAllDataLoaded}
          holderWidth={holderWidth}
          limitReached={limitReached}
          limitCount={limitCount}
        />
      </div>
    );
  }}
</Demo>;
```
