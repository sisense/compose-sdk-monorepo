import { getDefaultWidgetsPanelLayout, getDividerStyle } from '@/dashboard/utils';
import { WidgetsPanelLayout } from '@/models';
import { WidgetProps } from '@/props';
import styled from '@emotion/styled';
import { useThemeContext } from '@/theme-provider';
import { useMemo } from 'react';
import { Widget } from '@/widgets/widget';

const Row = styled.div<{ widths: number[] }>`
  display: grid;
  grid-template-columns: ${({ widths }) => widths.map((w) => `${w}%`).join(' ')};
`;

const Column = styled.div<{
  dividerWidth: number;
  dividerColor: string;
}>`
  &:not(:first-of-type) {
    border-left: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  }
`;

const Subcell = styled.div<{
  height: string | number;
  dividerWidth: number;
  dividerColor: string;
}>`
  border-bottom: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  &:not(:first-of-type) {
    border-left: ${({ dividerWidth, dividerColor }) => getDividerStyle(dividerColor, dividerWidth)};
  }
  height: ${({ height }) => `calc(${height} + 32px)`};
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
  layout?: WidgetsPanelLayout;

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
export const ContentPanel = ({ layout, widgets }: ContentPanelProps) => {
  const { themeSettings } = useThemeContext();

  const updatedLayout = useMemo(() => {
    return layout ?? getDefaultWidgetsPanelLayout(widgets);
  }, [layout, widgets]);

  return (
    <Row widths={updatedLayout.columns.map((c) => c.widthPercentage)}>
      {updatedLayout.columns.map((column, columnIndex) => (
        <Column
          key={columnIndex}
          dividerWidth={themeSettings.dashboard.dividerLineWidth}
          dividerColor={themeSettings.dashboard.dividerLineColor}
        >
          {column.rows?.map((row, cellIndex) => (
            <Row
              key={`${columnIndex},${cellIndex}`}
              widths={row.cells.map((sb) => sb.widthPercentage)}
            >
              {row.cells.map((subcell) => {
                const widgetProps = widgets.find((w) => w.id === subcell.widgetId);

                return (
                  <Subcell
                    key={`${subcell.widgetId},${subcell.widthPercentage}`}
                    height={subcell.height || 0}
                    dividerWidth={themeSettings.dashboard.dividerLineWidth}
                    dividerColor={themeSettings.dashboard.dividerLineColor}
                  >
                    {widgetProps && <Widget {...widgetProps} />}
                  </Subcell>
                );
              })}
            </Row>
          ))}
        </Column>
      ))}
    </Row>
  );
};
