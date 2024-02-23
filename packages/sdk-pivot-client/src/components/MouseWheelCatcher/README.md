Default scroll

```js
const { Demo } = require('../Demo');
const { getText } = require('../Demo/examples');

<Demo inputsCount={0} input-0-value={100} input-0-descr="Rows">
  {({ inputs }) => {
    const data = getText(50);
    const style = {
      display: 'inline-block',
      width: 450,
      height: 600,
      overflow: 'auto',
    };
    let leftDiv;
    let rightDiv;

    const leftDivRef = (ref) => {
      leftDiv = ref;
    };

    const rightDivRef = (ref) => {
      rightDiv = ref;
    };

    const handleScroll = (event, dir) => {
      event.preventDefault();

      if (rightDiv) {
        const { scrollTop } = rightDiv;
        const newScrollTop = scrollTop - dir * 30;

        if (leftDiv) {
          leftDiv.scrollTop = newScrollTop;
        }

        if (rightDiv) {
          rightDiv.scrollTop = newScrollTop;
        }
      }
    };

    return (
      <MouseWheelCatcher onMouseScroll={handleScroll}>
        <div ref={leftDivRef} className="scroll-elem left" style={style}>
          {data}
        </div>
        <div ref={rightDivRef} className="scroll-elem right" style={style}>
          {data}
        </div>
      </MouseWheelCatcher>
    );
  }}
</Demo>;
```

Custom scroll

```js
const { Demo } = require('../Demo');
const { getText } = require('../Demo/examples');
const { findDOMNode } = require('react-dom');
const { CustomScroll } = require('../CustomScroll');

<Demo inputsCount={0} input-0-value={100} input-0-descr="Rows">
  {({ inputs }) => {
    // const rows = inputs[0].value;
    const data = getText(50);
    const style = {
      display: 'inline-block',
      width: 450,
      height: 600,
      overflow: 'hidden',
    };
    let leftDiv;
    let rightDiv;

    const leftDivRef = (ref) => {
      leftDiv = findDOMNode(ref);
    };

    const rightDivRef = (ref) => {
      rightDiv = findDOMNode(ref);
    };

    const handleScroll = (event, dir) => {
      event.preventDefault();

      if (rightDiv) {
        const scrollChildElem = rightDiv.firstChild;
        const { scrollTop } = scrollChildElem;
        const newScrollTop = scrollTop - dir * 30;

        if (leftDiv) {
          leftDiv.firstChild.scrollTop = newScrollTop;
        }

        if (rightDiv) {
          rightDiv.firstChild.scrollTop = newScrollTop;
        }
      }
    };

    return (
      <MouseWheelCatcher onMouseScroll={handleScroll}>
        <CustomScroll ref={leftDivRef} className="scroll-elem left" style={style}>
          {data}
        </CustomScroll>
        <CustomScroll ref={rightDivRef} className="scroll-elem right" style={style}>
          {data}
        </CustomScroll>
      </MouseWheelCatcher>
    );
  }}
</Demo>;
```
