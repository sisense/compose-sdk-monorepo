/** @vitest-environment jsdom */
import { render } from '@testing-library/react';
import { describe, expect, it, Mock, vi } from 'vitest';

import { asBuiltInHeaderItem, HeaderItem } from '@/domains/shared/header';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import type { AlignmentTypes } from '@/types';

import { WIDGET_HEADER_ITEM_SIZE } from './constants';
import type { WidgetHeaderConfig, WidgetHeaderItem } from './types';
import { WidgetHeader } from './widget-header';
import { WidgetHeaderTargets } from './widget-header-targets';

vi.mock('@/infra/contexts/theme-provider', () => ({
  useThemeContext: vi.fn(),
}));

const mockUseThemeContext = useThemeContext as Mock;

const defaultThemeSettings = {
  themeSettings: {
    widget: {
      header: {
        backgroundColor: '#FFFFFF',
        titleTextColor: '#5B6372',
        titleFontSize: 15,
        titleAlignment: 'Left',
        dividerLine: false,
        dividerLineColor: '#e6e6e6',
      },
    },
    typography: { fontFamily: '"Open Sans",sans-serif' },
  },
};

/** Test id the shared header renderer gives an item's layout cell. */
const itemTestId = (id: string) => `header-item-${id}`;

/** Ids of the rendered header items, in visual (left-to-right) order. */
const renderedItemIds = (container: HTMLElement): string[] =>
  Array.from(container.querySelectorAll('[data-testid^="header-item-"]')).map((cell) =>
    (cell.getAttribute('data-testid') as string).replace('header-item-', ''),
  );

/**
 * A widget-contributed item: marked built-in, so it may claim a reserved slot id. Stands in for what
 * a feature hook produces — the header only cares about the id and the content.
 */
const contributed = (id: string, label = id): HeaderItem =>
  asBuiltInHeaderItem({ id, component: () => <span data-testid={label}>{label}</span> });

const TITLE_ITEM = contributed(WidgetHeaderTargets.Title, 'title');
const INFO_BUTTON_ITEM = contributed(WidgetHeaderTargets.InfoButton, 'info');

/**
 * Renders the header. Everything reaches it through `config.items`: `items` here are the widget's own
 * (marked) contributions, `consumerItems` the unmarked ones a consumer would pass.
 */
const renderHeader = ({
  items = [TITLE_ITEM, INFO_BUTTON_ITEM],
  config,
  styleOptions,
}: {
  items?: readonly HeaderItem[];
  config?: WidgetHeaderConfig;
  styleOptions?: Parameters<typeof WidgetHeader>[0]['styleOptions'];
} = {}) =>
  render(
    <WidgetHeader
      config={{ ...config, items: [...items, ...((config?.items ?? []) as HeaderItem[])] }}
      styleOptions={styleOptions}
    />,
  );

describe('WidgetHeader', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseThemeContext.mockReturnValue(defaultThemeSettings);
  });

  describe('the header adds no content of its own', () => {
    it('renders only the spacers when the widget contributes nothing', () => {
      const { container } = renderHeader({ items: [] });

      expect(renderedItemIds(container)).toEqual([
        WidgetHeaderTargets.TitleAlignmentSpacer,
        WidgetHeaderTargets.Spacer,
      ]);
    });

    it('renders exactly the items the widget contributed, in slot order', () => {
      const { container } = renderHeader({ items: [INFO_BUTTON_ITEM, TITLE_ITEM] });

      expect(renderedItemIds(container)).toEqual([
        WidgetHeaderTargets.TitleAlignmentSpacer,
        WidgetHeaderTargets.Title,
        WidgetHeaderTargets.Spacer,
        WidgetHeaderTargets.InfoButton,
      ]);
    });

    it('leaves an unfilled slot as an anchor a position can still target', () => {
      // No menu item was contributed, yet `before: Menu` resolves.
      const { container } = renderHeader({
        config: {
          items: [
            {
              id: 'help',
              position: { type: 'before', target: WidgetHeaderTargets.Menu },
              component: () => <span>Help</span>,
            },
          ],
        },
      });

      expect(renderedItemIds(container)).toEqual([
        WidgetHeaderTargets.TitleAlignmentSpacer,
        WidgetHeaderTargets.Title,
        WidgetHeaderTargets.Spacer,
        WidgetHeaderTargets.InfoButton,
        'help',
      ]);
    });
  });

  describe('consumer items (config.items / config.onBeforeRender)', () => {
    it('places an item with no position after the trailing spacer', () => {
      const { container } = renderHeader({
        config: { items: [{ id: 'export', component: () => <span>Export</span> }] },
      });

      expect(renderedItemIds(container)).toEqual([
        WidgetHeaderTargets.TitleAlignmentSpacer,
        WidgetHeaderTargets.Title,
        WidgetHeaderTargets.Spacer,
        'export',
        WidgetHeaderTargets.InfoButton,
      ]);
    });

    it('places a "first" item before everything, including the leading spacer', () => {
      const { container } = renderHeader({
        config: {
          items: [{ id: 'back', position: { type: 'first' }, component: () => <span>Back</span> }],
        },
      });

      expect(renderedItemIds(container)[0]).toBe('back');
    });

    it('places an "after Title" item right next to the title', () => {
      const { container } = renderHeader({
        config: {
          items: [
            {
              id: 'live',
              position: { type: 'after', target: WidgetHeaderTargets.Title },
              component: () => <span>LIVE</span>,
            },
          ],
        },
      });

      expect(renderedItemIds(container)).toEqual([
        WidgetHeaderTargets.TitleAlignmentSpacer,
        WidgetHeaderTargets.Title,
        'live',
        WidgetHeaderTargets.Spacer,
        WidgetHeaderTargets.InfoButton,
      ]);
    });

    it('passes the resolved size to the item component and applies it to the cell', () => {
      const component = vi.fn(() => <span>Clock</span>);
      const { getByTestId } = renderHeader({
        config: { items: [{ id: 'clock', size: { width: 80 }, component }] },
      });

      expect(component).toHaveBeenCalledWith({
        size: { width: 80, height: WIDGET_HEADER_ITEM_SIZE },
      });
      expect(getByTestId(itemTestId('clock'))).toHaveStyle({ width: '80px' });
    });

    it('rejects an unmarked consumer item that claims a reserved slot id', () => {
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

      const { queryByTestId } = renderHeader({
        config: {
          items: [
            {
              id: WidgetHeaderTargets.Title,
              component: () => <span data-testid="forged">forged</span>,
            },
          ],
        },
      });

      expect(consoleError).toHaveBeenCalledOnce();
      expect(queryByTestId('forged')).not.toBeInTheDocument();

      consoleError.mockRestore();
    });

    it('removes a contributed item through onBeforeRender', () => {
      const { container } = renderHeader({
        config: {
          onBeforeRender: (items) =>
            items.filter((item) => item.id !== WidgetHeaderTargets.InfoButton),
        },
      });

      expect(renderedItemIds(container)).not.toContain(WidgetHeaderTargets.InfoButton);
    });

    it('does not pass unfilled slots to onBeforeRender', () => {
      const onBeforeRender = vi.fn((items) => [...items]);
      renderHeader({ config: { onBeforeRender } });

      expect(onBeforeRender.mock.calls[0][0].map((item: { id: string }) => item.id)).toEqual([
        WidgetHeaderTargets.TitleAlignmentSpacer,
        WidgetHeaderTargets.Title,
        WidgetHeaderTargets.Spacer,
        WidgetHeaderTargets.InfoButton,
      ]);
    });
  });

  describe('slot validation', () => {
    it('throws when a contributed item claims an id with no slot', () => {
      // Only SDK code can mark an item, so an unregistered built-in is a bug to surface, not to
      // paper over by treating it as an ordinary item.
      expect(() => renderHeader({ items: [contributed('unregistered')] })).toThrow(/has no slot/);
    });

    it("throws when a contributed item claims one of the header's own spacer slots", () => {
      expect(() => renderHeader({ items: [contributed(WidgetHeaderTargets.Spacer)] })).toThrow(
        /owned by the widget header/,
      );
    });

    it('throws when two contributed items claim the same slot', () => {
      expect(() =>
        renderHeader({ items: [TITLE_ITEM, contributed(WidgetHeaderTargets.Title)] }),
      ).toThrow(/Duplicate built-in/);
    });
  });

  describe('slot ordering', () => {
    it('orders the leading icons drag-then-JTD, before the title alignment spacer', () => {
      const { container } = renderHeader({
        items: [
          contributed(WidgetHeaderTargets.JtdIcon, 'jtd'),
          contributed(WidgetHeaderTargets.DragIcon, 'drag'),
          TITLE_ITEM,
        ],
      });

      expect(renderedItemIds(container).slice(0, 3)).toEqual([
        WidgetHeaderTargets.DragIcon,
        WidgetHeaderTargets.JtdIcon,
        WidgetHeaderTargets.TitleAlignmentSpacer,
      ]);
    });

    it('orders the trailing actions clear-selection, info, narrative, menu', () => {
      const { container } = renderHeader({
        items: [
          contributed(WidgetHeaderTargets.Menu, 'menu'),
          contributed(WidgetHeaderTargets.NarrativeToggle, 'narrative'),
          INFO_BUTTON_ITEM,
          contributed(WidgetHeaderTargets.ClearSelectionButton, 'clear'),
        ],
      });

      expect(renderedItemIds(container).slice(-4)).toEqual([
        WidgetHeaderTargets.ClearSelectionButton,
        WidgetHeaderTargets.InfoButton,
        WidgetHeaderTargets.NarrativeToggle,
        WidgetHeaderTargets.Menu,
      ]);
    });

    it('renders a contributed item at the slot width, not at its own', () => {
      // The header owns layout: a contributed item's own `size` does not override the slot's.
      const { getByTestId } = renderHeader({
        items: [{ ...contributed(WidgetHeaderTargets.DragIcon, 'drag'), size: { width: 200 } }],
      });

      expect(getByTestId(itemTestId(WidgetHeaderTargets.DragIcon))).not.toHaveStyle({
        width: '200px',
      });
    });

    it('places items contributed through config.items into their slots too', () => {
      // How dashboard-level features (JTD, drag handle, common filters) reach the header.
      const { container } = renderHeader({
        config: { items: [contributed(WidgetHeaderTargets.DragIcon, 'drag') as WidgetHeaderItem] },
      });

      expect(renderedItemIds(container)[0]).toBe(WidgetHeaderTargets.DragIcon);
    });
  });

  describe('title alignment (the spacers around the title)', () => {
    const spacerFlex = (container: HTMLElement, id: string) =>
      container.querySelector<HTMLElement>(`[data-testid="${itemTestId(id)}"]`)?.style.flex;

    it.each([
      ['Left', '0 0 auto', '1 1 auto'],
      ['Center', '1 1 auto', '1 1 auto'],
      ['Right', '1 1 auto', '0 0 auto'],
    ] as const)('grows the right spacers for %s alignment', (titleAlignment, leading, trailing) => {
      const { container } = renderHeader({ styleOptions: { titleAlignment } });

      expect(spacerFlex(container, WidgetHeaderTargets.TitleAlignmentSpacer)).toBe(leading);
      expect(spacerFlex(container, WidgetHeaderTargets.Spacer)).toBe(trailing);
    });

    it('accepts a differently-cased alignment, as the previous text-align behavior did', () => {
      const { container } = renderHeader({
        styleOptions: { titleAlignment: 'center' as AlignmentTypes },
      });

      expect(spacerFlex(container, WidgetHeaderTargets.TitleAlignmentSpacer)).toBe('1 1 auto');
      expect(spacerFlex(container, WidgetHeaderTargets.Spacer)).toBe('1 1 auto');
    });

    it('falls back to the theme alignment when styleOptions does not set one', () => {
      const { container } = renderHeader();

      // The mocked theme aligns the title left, so only the trailing spacer grows.
      expect(spacerFlex(container, WidgetHeaderTargets.TitleAlignmentSpacer)).toBe('0 0 auto');
      expect(spacerFlex(container, WidgetHeaderTargets.Spacer)).toBe('1 1 auto');
    });
  });

  describe('divider', () => {
    it('does not render the divider when theme dividerLine is false and no styleOptions', () => {
      const { container } = renderHeader();

      expect(container.querySelector('[data-component="widget-header"]')?.children.length).toBe(1);
    });

    it('renders the divider when theme dividerLine is true', () => {
      mockUseThemeContext.mockReturnValue({
        themeSettings: {
          ...defaultThemeSettings.themeSettings,
          widget: {
            ...defaultThemeSettings.themeSettings.widget,
            header: { ...defaultThemeSettings.themeSettings.widget.header, dividerLine: true },
          },
        },
      });

      const { container } = renderHeader();

      expect(
        container.querySelector('[data-component="widget-header-divider"]'),
      ).toBeInTheDocument();
    });

    it('renders the divider when styleOptions dividerLine is true', () => {
      const { container } = renderHeader({ styleOptions: { dividerLine: true } });

      expect(
        container.querySelector('[data-component="widget-header-divider"]'),
      ).toBeInTheDocument();
    });
  });
});
