import * as React from 'react';
import PivotTable from './PivotTable.js';
import { generateCorner, generateTree } from '../Demo/examples.js';
import { TreeService, TreeServiceI } from '../../tree-structure/index.js';
// import { ColumnWidthInput } from '../ColumnWidthInput/index.js';

type Props = {
  instantLoad: boolean;
  count: number;
  deep: number;
  width: number;
  height: number;
};

type State = {
  // tableSize: TableSize;
  // data: string[][];
  rowsTreeService?: TreeServiceI;
  columnsTreeService?: TreeServiceI;
  cornerTreeService?: TreeServiceI;
};

export class BasicPivotTableDemo extends React.PureComponent<Props, State> {
  pivotTable?: PivotTable;

  static defaultProps = {
    instantLoad: true,
    count: 5,
    deep: 2,
    width: 1200,
    height: 400,
  };

  constructor(props: Props) {
    super(props);
    const { instantLoad } = this.props;

    console.log('props', props);

    if (instantLoad) {
      this.state = this.initState(props);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    if (!this.props.instantLoad) {
      return;
    }
    // const changedProps = getChangedProps(this.props, nextProps);
    if (nextProps.count !== this.props.count || nextProps.deep !== this.props.deep) {
      const newState = this.initState(nextProps);
      this.setState(newState);
    }
  }

  componentDidMount() {
    console.log('componentDidMount', this.state);
    const { rowsTreeService, columnsTreeService, cornerTreeService } = this.state;
    this.pivotTable?.initialize(rowsTreeService, columnsTreeService, cornerTreeService);
  }

  componentWillUnmount(): void {
    this.pivotTable = undefined;
  }

  // eslint-disable-next-line class-methods-use-this
  initState(props: Props): State {
    const { count, deep } = props;

    // const tableSize = new TableSize();

    const rowsTree = generateTree(count, deep, 'Some test data ');
    const rowsTreeService = new TreeService(rowsTree, true);
    rowsTreeService.getGrid();

    const columnsTree = generateTree(count, deep);
    const columnsTreeService = new TreeService(columnsTree);
    columnsTreeService.getGrid();

    const cornerTree = generateCorner(deep);
    const cornerTreeService = new TreeService(cornerTree, false, deep);
    cornerTreeService.getGrid();

    // const data = generateData(count, count);

    return {
      // tableSize,
      // data,
      rowsTreeService,
      columnsTreeService,
      cornerTreeService,
    };
  }

  onLoad = () => {
    const newState = this.initState(this.props);
    this.setState(newState);
  };

  onClear = () => {
    // eslint-disable-next-line no-console
    console.log('onClear');
  };

  onDomReady = () => {
    // eslint-disable-next-line no-console
    console.log('onDomReady');
  };

  onTotalSizeChange = (height: number) => {
    // eslint-disable-next-line no-console
    console.log(height);
  };

  onUpdateColumnsWidth = ({ columnWidth }: { columnWidth: Array<any> }) => {
    // if (this.grid) this.grid.updateColumnWidth(columnWidth);
    // eslint-disable-next-line no-console
    console.log(columnWidth);
  };

  tableRef = (ref: PivotTable | null) => {
    if (ref) {
      this.pivotTable = ref;
    }
  };

  render() {
    const { width, height } = this.props;

    return (
      <div>
        {/*<div>*/}
        {/*  <button type="button" onClick={this.onLoad}>*/}
        {/*    Load*/}
        {/*  </button>*/}
        {/*  <button type="button" onClick={this.onClear}>*/}
        {/*    Clear*/}
        {/*  </button>*/}
        {/*</div>*/}
        {/*<ColumnWidthInput update={this.onUpdateColumnsWidth} />*/}
        <PivotTable
          ref={this.tableRef}
          width={width}
          height={height}
          scrollBarsMargin={10}
          onDomReady={this.onDomReady}
          onTotalSizeChange={this.onTotalSizeChange}
          // TODO: replace stub value with something meaningful
          onSortingSettingsChanged={() => {}}
        />
      </div>
    );
  }
}

export default BasicPivotTableDemo;
