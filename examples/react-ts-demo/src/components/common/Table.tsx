import { Cell, Table, HeadRow, EmptyCell, Head, Row, RowHead, TableWrapper } from '../../overStyle';
import { QueryResultData } from '@sisense/sdk-data';

export const TableComponent = ({ data, limit }: { data: QueryResultData; limit?: number }) => {
  return (
    <TableWrapper mheight={'392px'}>
      <Table>
        <tbody>
          <HeadRow>
            <EmptyCell> </EmptyCell>
            {data.columns.map((cat, index) => (
              <Head key={index}>{cat.name}</Head>
            ))}
          </HeadRow>
          {data &&
            data.rows.slice(0, limit).map((row, i) => (
              <Row key={`${i}row`} id={`${i}row`}>
                <RowHead>{i + 1}</RowHead>
                {row.map((cell, rowIndex: number) => {
                  return (
                    <Cell key={`${cell.text}${rowIndex}`} id={`${cell.text}${rowIndex}`}>
                      <p>{cell.text}</p>
                    </Cell>
                  );
                })}
              </Row>
            ))}
        </tbody>
      </Table>
    </TableWrapper>
  );
};
