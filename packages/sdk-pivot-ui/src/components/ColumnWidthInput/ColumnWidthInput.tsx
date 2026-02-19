import * as React from 'react';

type Props = {
  update: Function;
};
type State = {
  columnWidth: Array<any>;
};

export class ColumnWidthInput extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    this.state = {
      columnWidth: [], // eslint-disable-line react/no-unused-state
    };
  }

  setColumnWidth(event: any) {
    const { value } = event.target;

    let columnWidth: Array<any> = [];

    try {
      columnWidth = JSON.parse(value);
      this.setState(() => ({ columnWidth }));
    } catch (e) {
      // eslint-disable-next-line no-console
      console.warn('Wrong predefined width data!', e);
    }
  }

  render() {
    const { update } = this.props;

    return (
      <div>
        <div>Update column width</div>
        <div>
          <textarea onChange={(event) => this.setColumnWidth(event)} />
        </div>
        <button type="button" onClick={() => update(this.state)}>
          Update width
        </button>
      </div>
    );
  }
}

export default ColumnWidthInput;
