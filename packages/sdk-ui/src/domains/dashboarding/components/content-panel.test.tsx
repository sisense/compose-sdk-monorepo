import { render } from '@testing-library/react';

import { WidgetProps } from '@/domains/widgets/components/widget/types';

import { ContentPanel } from './content-panel.js';

vi.mock('@/domains/widgets/components/widget', async () => {
  return { Widget: (props: WidgetProps) => <div data-testid={'widget'}>{props.id}</div> };
});

describe('ContentPanel', () => {
  it('should render widgets with provided layout', async () => {
    const widgets = [
      { id: 'widget-1' },
      { id: 'widget-2' },
      { id: 'widget-3' },
      { id: 'widget-4' },
    ] as WidgetProps[];
    const layout = {
      columns: [
        {
          widthPercentage: 70,
          rows: [
            {
              cells: [
                { widthPercentage: 60, widgetId: 'widget-1' },
                { widthPercentage: 40, widgetId: 'widget-2' },
              ],
            },
          ],
        },
        {
          widthPercentage: 30,
          rows: [
            {
              cells: [
                { widthPercentage: 25, widgetId: 'widget-3' },
                { widthPercentage: 75, widgetId: 'widget-4' },
              ],
            },
          ],
        },
      ],
    };
    const { container, getAllByTestId } = render(
      <ContentPanel widgets={widgets} layout={layout} />,
    );

    const [wrapperWidths, ...columnsWidths] = Array.from(
      container.querySelectorAll('[widths]'),
    ).map((el) => el.getAttribute('widths'));
    expect(wrapperWidths).toBe('70,30');
    expect(columnsWidths).toEqual(['60,40', '25,75']);

    const widgetElements = getAllByTestId('widget');
    expect(widgetElements).toHaveLength(4);
  });
});
