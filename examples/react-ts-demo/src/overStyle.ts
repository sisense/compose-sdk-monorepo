import styled from 'styled-components';
const OverviewWrapper = styled.div`
  padding: 20px;
`;

const TextTitle = styled.h2`
  margin: 13px 0;
`;

interface TableWrapperProps {
  noshow?: boolean;
  mheight?: string;
}

const TableWrapper = styled.div<TableWrapperProps>`
  overflow-x: auto;
  max-height: ${(p) => p.mheight};
  display: ${(p) => (p.noshow ? 'none' : 'block')};
`;

const Table = styled.table`
  contain: strict;
`;

const Row = styled.tr`
  /* height: 200px; */
`;

const HeadRow = styled.tr``;

const Cell = styled.td`
  text-align: center;
  margin: 4px;
`;

interface HeadProps {
  columns?: number | string;
}
const Head = styled.th<HeadProps>`
  background-color: #eeeeee;
  text-align: center;
  height: 24px;
  min-width: ${(props) => (props.columns ? `calc((100vw - 160px) / ${props.columns})` : '200px')};
  border-bottom: 2px solid #dddddd;
  margin: 4px;
`;

const EmptyCell = styled.td`
  background-color: #eeeeee;
`;

const RowHead = styled.th`
  background-color: #eeeeee;
  width: 36px;
`;

const Indicator = styled.div`
  padding: 0 40px;
  text-align: left;
`;

interface ListProps {
  flex?: boolean;
  height?: string;
}
const List = styled.ul<ListProps>`
  display: ${(p) => p.flex && 'flex'};
  list-style-type: none;
  height: ${(p) => p.height};
`;

export {
  OverviewWrapper,
  Table,
  Row,
  HeadRow,
  Cell,
  Head,
  EmptyCell,
  RowHead,
  Indicator,
  List,
  TextTitle,
  TableWrapper,
};
