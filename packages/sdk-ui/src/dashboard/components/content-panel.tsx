import { getDividerStyle } from '@/dashboard/utils';
import { WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';
import styled from '@emotion/styled';
import { useThemeContext } from '@/theme-provider';
import { Widget } from '@/widgets/widget';
import isUndefined from 'lodash-es/isUndefined';
import isNumber from 'lodash-es/isNumber';

const SMALL_WIDTH = '600px';
const MEDIUM_WIDTH = '900px';

const GridContainer = styled.div<{ widths: number[] }>`
  display: grid;
  grid-template-columns: ${({ widths }) => widths.map((w) => `${w}%`).join(' ')};
  @container content-panel-container (max-width: ${SMALL_WIDTH}) {
    grid-template-columns: repeat(1, 1fr);
  }
  @container content-panel-container ((min-width: ${SMALL_WIDTH}) and (max-width: ${MEDIUM_WIDTH})) {
    grid-template-columns: ${({ widths }) =>
      widths.length > 1 ? 'repeat(2, 1fr)' : 'repeat(1, 1fr)'};
  }
`;

const Column = styled.div<{
  responsive?: boolean;
  colWidths: number[];
  dividerWidth: number;
  dividerColor: string;
}>`
  container-name: content-panel-column;
  container-type: ${({ responsive }) => (responsive ? 'inline-size' : 'unset')};
  &:not(:first-of-type) {
    border-left: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  }
  @container content-panel-container ((min-width: ${SMALL_WIDTH}) and (max-width: ${MEDIUM_WIDTH})) {
    &:last-of-type {
      grid-column-end: ${({ colWidths }) => (colWidths.length % 2 === 0 ? 'span 1' : 'span 2')};
    }
  }
  @container content-panel-container (max-width: ${SMALL_WIDTH}) {
    &:not(:first-of-type) {
      border-left: none;
    }
  }
`;

const Row = styled.div<{ widths: number[] }>`
  display: grid;
  grid-template-columns: ${({ widths }) => widths.map((w) => `${w}%`).join(' ')};
  @container content-panel-column (max-width: ${SMALL_WIDTH}) {
    grid-template-columns: repeat(1, 1fr);
  }
  @container content-panel-column ((min-width: ${SMALL_WIDTH}) and (max-width: ${MEDIUM_WIDTH})) {
    grid-template-columns: ${({ widths }) =>
      widths.length === 1 ? 'repeat(1, 1fr)' : 'repeat(2, 1fr)'};
  }
`;

const Subcell = styled.div<{
  responsive?: boolean;
  rowWidths: number[];
  height?: string | number;
  dividerWidth: number;
  dividerColor: string;
}>`
  border-bottom: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  &:not(:first-of-type) {
    border-left: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  }

  height: ${({ height }) =>
    isUndefined(height)
      ? 'auto'
      : isNumber(height)
      ? `calc(${height}px + 32px)`
      : `calc(${height} + 32px)`};
  @container ((min-width: ${SMALL_WIDTH}) and (max-width: ${MEDIUM_WIDTH})) {
    &:last-of-type {
      grid-column-end: ${({ rowWidths }) => (rowWidths.length % 2 === 0 ? 'span 1' : 'span 2')};
    }
  }
  @container (max-width: ${SMALL_WIDTH}) {
    &:not(:first-of-type) {
      border-left: none;
    }
  }
`;

/**
 * Props for the {@link ContentPanel} component.
 *
 * @internal
 */
export interface ContentPanelProps {
  /**
   * An object defining how the widgets should be laid out.
   */
  layout: WidgetsPanelLayout;

  /**
   * If true adjust layout based on available width of content panel.
   *
   * If not specified, the default value is `false`.
   *
   * @internal
   */
  responsive?: boolean;

  /**
   * A list of widget props to render.
   */
  widgets: WidgetProps[];
}

/**
 * A React component used for rendering a layout of widgets.
 *
 * @param props - {@link ContentPanelProps}
 * @internal
 */
export const ContentPanel = ({ layout, responsive, widgets }: ContentPanelProps) => {
  const { themeSettings } = useThemeContext();

  const colWidths = layout.columns.map((c) => c.widthPercentage);

  return (
    <GridContainer widths={colWidths}>
      {layout.columns.map((column, columnIndex) => (
        <Column
          key={columnIndex}
          colWidths={colWidths}
          responsive={responsive}
          dividerWidth={themeSettings.dashboard.dividerLineWidth}
          dividerColor={themeSettings.dashboard.dividerLineColor}
        >
          {column.rows?.map((row, cellIndex) => {
            const rowWidths = row.cells.map((sb) => sb.widthPercentage);
            return (
              <Row key={`${columnIndex},${cellIndex}`} widths={rowWidths}>
                {row.cells.map((subcell) => {
                  const widgetProps = widgets.find((w) => w.id === subcell.widgetId);
                  if (
                    widgetProps?.widgetType === 'pivot' &&
                    subcell.height &&
                    widgetProps?.styleOptions?.isAutoHeight
                  ) {
                    widgetProps.styleOptions.isAutoHeight = false;
                  }
                  return (
                    <Subcell
                      key={`${subcell.widgetId},${subcell.widthPercentage}`}
                      responsive={responsive}
                      rowWidths={rowWidths}
                      height={subcell.height}
                      dividerWidth={themeSettings.dashboard.dividerLineWidth}
                      dividerColor={themeSettings.dashboard.dividerLineColor}
                    >
                      {widgetProps && <Widget {...widgetProps} />}
                    </Subcell>
                  );
                })}
              </Row>
            );
          })}
        </Column>
      ))}
    </GridContainer>
  );
};
