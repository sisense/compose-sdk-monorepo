import React from 'react';
import { Table } from '../components/Table/Table';
import { TableStyleOptions } from '../types';

export default {
  title: 'Table/Table',
  component: Table,
  argTypes: {},
};

const dataSet = {
  columns: [
    { name: 'AgeRange', type: 'string' },
    { name: 'Cost', type: 'number' },
  ],
  rows: [
    ['0-18', 1000],
    ['19-28', 19.123],
    ['29-35', 125],
  ],
};

const dataOptions = {
  columns: [
    { name: 'AgeRange', type: 'string' },
    { name: 'Cost', type: 'number' },
  ],
};

const styleOptions: TableStyleOptions = {
  headersColor: true,
  alternatingRowsColor: true,
  alternatingColumnsColor: false,
};

export const Default = () => (
  <Table dataSet={dataSet} dataOptions={dataOptions} styleOptions={styleOptions} />
);
