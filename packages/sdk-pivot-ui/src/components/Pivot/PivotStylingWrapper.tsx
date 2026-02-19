import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { OVERLAY_ROWS_PER_PAGE_SELECT } from '../PaginationPanel/classes';
import { TABLEGRID_DATA } from '../PivotTable/classes';
import { PIVOT_SELECTABLE_TABLE, PIVOT_WITH_BOTTOM_PADDING } from './classes';

export type PivotFillOptionsProps = {
  alternatingRows?: boolean;
  alternatingColumns?: boolean;
  columnsHeaders?: boolean;
  rowMembers?: boolean;
  totals?: boolean;
};

const DEFAULT_TEXT_COLOR = '#5B6372';
const DEFAULT_FILL_COLOR = 'rgba(244, 244, 244, 1)';
const DEFAULT_ADDITIONAL_FILL_COLOR = 'rgba(239, 239, 239, 1)';

export const PivotStylingWrapper = styled.div<{
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  fillColor?: string;
  additionalFillColor?: string;
  fillOptions?: PivotFillOptionsProps;
  navigationPrimaryColor?: string;
  navigationSecondaryColor?: string;
  selectionColor?: string;
}>`
  &,
  .table-grid {
    background-color: ${(props) => props.backgroundColor};
    font-family: ${(props) => props.fontFamily};
  }

  .table-grid__row > .table-grid__cell {
    color: ${(props) => props.textColor || DEFAULT_TEXT_COLOR};
  }

  ${(props) =>
    props.fillOptions?.alternatingRows &&
    css`
      .table-grid__cell--data.table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd:not(
          .table-grid__cell--row-user-type-subTotal
        ):not(.table-grid__cell--row-user-type-grandTotal):not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid__cell--rows.table-grid__cell--level-last.table-grid__cell--sibling-odd:not(
          .table-grid__cell--user-type-subTotal
        ):not(.table-grid__cell--user-type-grandTotal):not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid--bottom.table-grid--right
        .table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd:not(
          .table-grid__cell--row-user-type-subTotal
        ):not(.table-grid__cell--row-user-type-grandTotal):not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid--bottom.table-grid--left
        .table-grid__cell--level-last.table-grid__cell--sibling-odd:not(
          .table-grid__cell--user-type-subTotal
        ):not(.table-grid__cell--user-type-grandTotal):not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
    `}

  ${(props) =>
    props.fillOptions?.alternatingColumns &&
    css`
      .table-grid--bottom.table-grid--left .table-grid__column:nth-of-type(even),
      .table-grid--bottom.table-grid--right .table-grid__column:nth-of-type(even) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
    `}

  ${(props) =>
    props.fillOptions?.columnsHeaders &&
    css`
      .table-grid--top.table-grid--left
        .table-grid__cell:not(.table-grid__cell--drilled):not(.table-grid__cell--selected),
      .table-grid--top.table-grid--right
        .table-grid__cell:not(.table-grid__cell--drilled):not(.table-grid__cell--selected) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid__cell--corner.table-grid__cell:not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ),
      .table-grid__cell--columns.table-grid__cell:not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
    `}

  ${(props) =>
    props.fillOptions?.rowMembers &&
    css`
      .table-grid--bottom.table-grid--left
        .table-grid__cell:not(.table-grid__cell--drilled):not(.table-grid__cell--selected):not(
          .table-grid__cell--user-type-subTotal
        ):not(.table-grid__cell--user-type-grandTotal) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid__cell--rows.table-grid__cell:not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ):not(.table-grid__cell--user-type-subTotal):not(.table-grid__cell--user-type-grandTotal) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
    `}

  ${(props) =>
    props.fillOptions?.rowMembers &&
    css`
      .table-grid--bottom.table-grid--left
        .table-grid__cell:not(.table-grid__cell--drilled):not(.table-grid__cell--selected):not(
          .table-grid__cell--user-type-subTotal
        ):not(.table-grid__cell--user-type-grandTotal) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid__cell--rows.table-grid__cell:not(.table-grid__cell--drilled):not(
          .table-grid__cell--selected
        ):not(.table-grid__cell--user-type-subTotal):not(.table-grid__cell--user-type-grandTotal) {
        background-color: ${props.fillColor || DEFAULT_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
    `}

  ${(props) =>
    props.fillOptions?.totals &&
    css`
      .table-grid--bottom.table-grid--left .table-grid__cell--user-type-subTotal,
      .table-grid--bottom.table-grid--left .table-grid__cell--user-type-grandTotal {
        background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid--bottom.table-grid--right {
        .table-grid__cell--row-user-type-subTotal,
        .table-grid__cell--row-user-type-grandTotal,
        .table-grid__cell--col-user-type-subTotal,
        .table-grid__cell--col-user-type-grandTotal {
          background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
          color: ${props.textColor || DEFAULT_TEXT_COLOR};
        }
        .table-grid__cell--row-user-type-subTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd,
        .table-grid__cell--row-user-type-subTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-even,
        .table-grid__cell--row-user-type-grandTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd,
        .table-grid__cell--row-user-type-grandTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-even,
        .table-grid__cell--col-user-type-subTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd,
        .table-grid__cell--col-user-type-subTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-even,
        .table-grid__cell--col-user-type-grandTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd,
        .table-grid__cell--col-user-type-grandTotal.table-grid__cell.table-grid__cell--row-level-last.table-grid__cell--row-sibling-even {
          background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
          color: ${props.textColor || DEFAULT_TEXT_COLOR};
        }
        .table-grid__cell--row-user-type-subTotal.table-grid__cell--col-user-type-subTotal,
        .table-grid__cell--row-user-type-subTotal.table-grid__cell--col-user-type-grandTotal,
        .table-grid__cell--row-user-type-grandTotal.table-grid__cell--col-user-type-subTotal,
        .table-grid__cell--row-user-type-grandTotal.table-grid__cell--col-user-type-grandTotal {
          background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
          color: ${props.textColor || DEFAULT_TEXT_COLOR};
        }
      }
      .table-grid__cell--rows.table-grid__cell--user-type-subTotal,
      .table-grid__cell--rows.table-grid__cell--user-type-grandTotal {
        background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
      .table-grid__cell--data.table-grid__cell--row-user-type-subTotal,
      .table-grid__cell--data.table-grid__cell--row-user-type-grandTotal,
      .table-grid__cell--data.table-grid__cell--col-user-type-subTotal,
      .table-grid__cell--data.table-grid__cell--col-user-type-grandTotal {
        background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
        &.table-grid__cell {
          &.table-grid__cell--row-level-last.table-grid__cell--row-sibling-odd,
          &.table-grid__cell--row-level-last.table-grid__cell--row-sibling-even {
            background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
            color: ${props.textColor || DEFAULT_TEXT_COLOR};
          }
        }
      }
      .table-grid__cell--data.table-grid__cell--row-user-type-subTotal.table-grid__cell--col-user-type-subTotal,
      .table-grid__cell--data.table-grid__cell--row-user-type-subTotal.table-grid__cell--col-user-type-grandTotal,
      .table-grid__cell--data.table-grid__cell--row-user-type-grandTotal.table-grid__cell--col-user-type-subTotal,
      .table-grid__cell--data.table-grid__cell--row-user-type-grandTotal.table-grid__cell--col-user-type-grandTotal {
        background-color: ${props.additionalFillColor || DEFAULT_ADDITIONAL_FILL_COLOR};
        color: ${props.textColor || DEFAULT_TEXT_COLOR};
      }
    `}

  .MuiTablePagination-root {
    .MuiTypography-root,
    .MuiPaginationItem-root {
      font-family: ${(props) => props.fontFamily};
      color: ${(props) => props.navigationPrimaryColor};
    }
    .Mui-selected {
      border-color: ${(props) => props.navigationSecondaryColor};
    }
    .MuiSvgIcon-root {
      color: ${(props) => props.navigationSecondaryColor};
    }
  }

  .table-grid__cell--selected {
    background-color: ${(props) => props.selectionColor};
  }

  .${OVERLAY_ROWS_PER_PAGE_SELECT} {
    position: absolute;
    bottom: 11px;
    right: 12px;
    height: 30px;
    z-index: 2;
    opacity: 0.3;
    transition: opacity 0.3s ease;

    &:hover {
      opacity: 1;
    }
  }

  .${PIVOT_WITH_BOTTOM_PADDING} .${TABLEGRID_DATA} {
    padding-bottom: 40px;
  }

  .${PIVOT_SELECTABLE_TABLE}
    .table-grid__cell:not(.table-grid__cell--user-type-subTotal):hover:not(
      .table-grid__cell--col-user-type-subTotal
    ):hover:not(.table-grid__cell--user-type-measureTop):hover:not(
      .table-grid__cell--row-user-type-subTotal
    ):hover:not(.table-grid__cell--row-user-type-grandTotal):hover:not(
      .table-grid__cell--col-user-type-grandTotal
    ):hover:not(.table-grid__cell--user-type-grandTotal):hover:not(
      .table-grid__cell--user-type-corner
    ):hover {
    background-color: ${(props) => props.selectionColor};
  }
`;
