import { Table } from '../table/table';
import { TableStyleOptions } from '../types';

export default {
  title: 'Table/Table',
  component: Table,
  argTypes: {},
};

const col1 = { name: 'AgeRange', type: 'string' };
const col2 = { name: 'Cost', type: 'number' };
const col3 = { name: 'Links', type: 'string' };
const col4 = { name: 'Lorem', type: 'string' };

const lorem =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

const dataSet = {
  columns: [col1, col2, col3, col4],
  rows: [
    ['0-18', 1000, '<a href="https://www.google.com/" target="_blank">GOOGLE</a>', lorem],
    ['19-28', 19.123, '<a href="https://www.sisense.com/" target="_blank">Sisense</a>', lorem],
    ['29-35', 125, '<a href="https://www.google.com/" target="_blank">GOOGLE</a>', lorem],
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

export const WithEmptyRows = () => (
  <Table dataSet={{ ...dataSet, rows: [] }} dataOptions={dataOptions} styleOptions={styleOptions} />
);

export const WithHtmlLinks = () => (
  <Table
    dataSet={dataSet}
    dataOptions={{ columns: [{ column: col3, isHtml: true }] }}
    styleOptions={styleOptions}
  />
);

export const WithCroppedTextInTooltip = () => (
  <Table dataSet={dataSet} dataOptions={{ columns: [col4] }} />
);
