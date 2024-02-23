**Paging Demo**

```js
const { Demo } = require('../Demo');
const SisenseSocket = require('../../data-load/sockets').SisenseSocket;
const SisenseDataLoadService = require('../../data-load').SisenseDataLoadService;
const DataService = require('../../data-handling').DataService;
const LayoutDemo = require('./LayoutDemo').LayoutDemo;

const classes = `sisense-pivot--merged-last-level-rows
sisense-pivot--alternating-rows_ sisense-pivot--alternating-columns_
sisense-pivot--columns-headers_ sisense-pivot--row-members_
`.trim();

let socket = null;
let dataService = null;

const loadServiceCreator = () => {
  if (!socket) {
    socket = new SisenseSocket('http://localhost:8456/pivot2');
  }
  return new SisenseDataLoadService(socket);
};

<Demo
  show={false}
  inputsCount={3}
  textAreasCount={6}
  textArea-0-value={'A4'}
  textArea-0-descr="Format"
  textArea-0-width={100}
  textArea-0-height={40}
  textArea-1-value={'portrait'}
  textArea-1-descr="Orientation"
  textArea-1-width={100}
  textArea-1-height={40}
  textArea-2-value={'Default Title'}
  textArea-2-descr="Title Name"
  textArea-2-width={100}
  textArea-2-height={40}
  input-0-value={1}
  input-0-descr="Header"
  input-1-value={1}
  input-1-descr="Footer"
  input-2-value={1}
  input-2-descr="Border width"
  textArea-3-value={classes}
  textArea-3-descr="Classes"
  textArea-3-width="900"
  textArea-3-height="60"
  textArea-4-value={'medium'}
  textArea-4-descr="header's text size"
  textArea-4-width={100}
  textArea-4-height={40}
  textArea-5-value={'flex-start'}
  textArea-5-descr="Header's text position"
  textArea-5-width={100}
  textArea-5-height={40}
>
  {({ inputs, textAreas }) => {
    const format = textAreas[0].value;
    const orientation = textAreas[1].value;
    const isHeaderDisplayed = inputs[0].value > 0;
    const isFooterDisplayed = inputs[1].value > 0;
    const titleName = textAreas[2].value;
    const borderWidth = inputs[2].value;
    const className = textAreas[3].value;
    const size = textAreas[4].value;
    const position = textAreas[5].value;
    const loadService = loadServiceCreator();

    return (
      <LayoutDemo
        loadService={loadService}
        format={format}
        orientation={orientation}
        isHeaderDisplayed={isHeaderDisplayed}
        isFooterDisplayed={isFooterDisplayed}
        titleName={titleName}
        borderWidth={borderWidth}
        size={size}
        position={position}
        className={className}
      />
    );
  }}
</Demo>;
```
