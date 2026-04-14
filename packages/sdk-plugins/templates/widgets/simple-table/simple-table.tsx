import { useMemo } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { type CustomVisualization, useExecuteCustomWidgetQuery } from '@sisense/sdk-ui';

/**
 * A simple table visualization component for the simple-table custom widget.
 */
export const SimpleTable: CustomVisualization = (props) => {
  const { data, isLoading, isError } = useExecuteCustomWidgetQuery(props);

  const {
    headerBackgroundColor = '#1976d2',
    headerTextColor = '#ffffff',
    cellPadding = 12,
    fontSize = 14,
  } = props.styleOptions ?? {};

  const tableData = useMemo(() => {
    if (!data || data.rows.length === 0) return null;

    const columns = data.columns.map((col) => col.name);
    const rows = data.rows.map((row) =>
      row.map((cell: { data?: unknown; text?: string }) => cell.text ?? String(cell.data ?? '')),
    );

    return { columns, rows };
  }, [data]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ width: '100%', minHeight: 200 }}
      >
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (isError) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ width: '100%', minHeight: 200 }}
      >
        <Typography variant="body2" color="error">
          Error loading data
        </Typography>
      </Box>
    );
  }

  if (!tableData) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        sx={{ width: '100%', minHeight: 200 }}
      >
        <Typography variant="body2" color="textSecondary">
          No data available
        </Typography>
      </Box>
    );
  }

  return (
    <TableContainer
      sx={{ width: '100%', maxHeight: '100%', overflowY: 'auto' }}
      data-visual-test-id="simple-table-widget"
    >
      <Table size="small" aria-label="simple table">
        <TableHead>
          <TableRow>
            {tableData.columns.map((columnName, index) => (
              <TableCell
                key={index}
                sx={{
                  backgroundColor: headerBackgroundColor,
                  color: headerTextColor,
                  padding: `${cellPadding}px`,
                  fontSize,
                  fontWeight: 600,
                }}
              >
                {columnName}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {tableData.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
              {row.map((cellValue, cellIndex) => (
                <TableCell
                  key={cellIndex}
                  sx={{
                    padding: `${cellPadding}px`,
                    fontSize,
                  }}
                >
                  {cellValue}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};
