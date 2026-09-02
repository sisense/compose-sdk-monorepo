/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { WidgetHeaderTargets } from '../../shared/widget-header/widget-header-targets';
import { isTextWidgetProps, TextWidget } from './text-widget';
import { TextWidgetProps } from './types';

vi.mock('@/infra/decorators/component-decorators/as-sisense-component', () => ({
  asSisenseComponent: () => (Component: any) => Component,
}));

vi.mock('../infra/contexts/theme-provider', () => ({
  useThemeContext: () => ({
    themeSettings: {
      widget: {
        spaceAround: 'Small',
      },
    },
  }),
}));

vi.mock('dompurify', () => ({
  default: {
    sanitize: (html: string) => html,
  },
}));

describe('TextWidget', () => {
  describe('isTextWidgetProps', () => {
    it('should return true for valid TextWidgetProps', () => {
      const validProps: TextWidgetProps = {
        styleOptions: {
          html: '<p>Sample Text</p>',
          bgColor: '#ffffff',
          vAlign: 'valign-top',
        },
      };
      expect(isTextWidgetProps(validProps)).toBe(true);
    });

    it('should return false for invalid TextWidgetProps (missing properties)', () => {
      const invalidProps = {
        styleOptions: {
          html: '<p>Sample Text</p>',
          bgColor: '#ffffff',
        },
      };
      expect(isTextWidgetProps(invalidProps)).toBe(false);
    });

    it('should return false for invalid TextWidgetProps (wrong types)', () => {
      const invalidProps = {
        styleOptions: {
          html: 123,
          bgColor: '#ffffff',
          vAlign: 'valign-top',
        },
      };
      expect(isTextWidgetProps(invalidProps)).toBe(false);
    });

    it('should return false for completely invalid objects', () => {
      const invalidProps = {
        someRandomKey: 'someRandomValue',
      };
      expect(isTextWidgetProps(invalidProps)).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(isTextWidgetProps(null)).toBe(false);
      expect(isTextWidgetProps(undefined)).toBe(false);
    });
  });

  describe('TextWidget component', () => {
    it('should render TextWidget with provided HTML content', async () => {
      const props: TextWidgetProps = {
        styleOptions: {
          html: '<div><p>Sample Text</p></div>',
          bgColor: '#ffffff',
          vAlign: 'valign-top',
        },
      };
      const { findByText } = render(<TextWidget {...props} />);

      expect(await findByText('Sample Text')).toBeInTheDocument();
    });

    describe('styleOptions.header', () => {
      it('should render header when header is not provided (defaults to visible)', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
          },
        };
        const { container } = render(<TextWidget {...props} />);

        const headerElement = container.querySelector('.text-widget-header');
        expect(headerElement).toBeInTheDocument();
      });

      it('should not render header when header.hidden is true', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              hidden: true,
            },
          },
        };
        const { container } = render(<TextWidget {...props} />);

        const headerElement = container.querySelector('.text-widget-header');
        expect(headerElement).not.toBeInTheDocument();
      });

      it('should render header when header is provided and hidden is false', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              hidden: false,
            },
          },
        };
        const { container } = render(<TextWidget {...props} />);

        const headerElement = container.querySelector('.text-widget-header');
        expect(headerElement).toBeInTheDocument();
      });

      it('should render header when header is provided without hidden property (defaults to false)', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {},
          },
        };
        const { container } = render(<TextWidget {...props} />);

        const headerElement = container.querySelector('.text-widget-header');
        expect(headerElement).toBeInTheDocument();
      });

      it('renders a custom header item from config.header.items', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {},
          },
          config: {
            header: {
              items: [
                {
                  id: 'custom',
                  size: { width: 80 },
                  component: () => <div data-testid="custom-header-item">Custom</div>,
                },
              ],
            },
          },
        };
        const { getByTestId } = render(<TextWidget {...props} />);

        expect(getByTestId('custom-header-item')).toBeInTheDocument();
      });

      it('never renders the info button — a text widget has no query to inspect', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {},
          },
        };
        const { container, queryByTestId } = render(<TextWidget {...props} />);

        expect(container.querySelector('.text-widget-header')).toBeInTheDocument();
        expect(queryByTestId('header-item-widget-header-info-button')).not.toBeInTheDocument();
      });

      it('renders only the spacers when nothing is configured — a text widget has no title', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {},
          },
        };
        const { container } = render(<TextWidget {...props} />);

        const renderedIds = Array.from(
          container.querySelectorAll('[data-testid^="header-item-"]'),
        ).map((cell) => (cell.getAttribute('data-testid') as string).replace('header-item-', ''));
        expect(renderedIds).toEqual([
          WidgetHeaderTargets.TitleAlignmentSpacer,
          WidgetHeaderTargets.Spacer,
        ]);
      });

      // The header is an overlay on top of the body, and the body is itself a click target (e.g. a
      // jump-to-dashboard source). The strip and its empty spacers must therefore be transparent to
      // the pointer, or a click on the text lands on the spacer instead.
      it('lets clicks through the header overlay and its spacers to the body underneath', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {},
          },
        };
        const { container } = render(<TextWidget {...props} />);

        const headerElement = container.querySelector('.text-widget-header') as HTMLElement;
        expect(getComputedStyle(headerElement).pointerEvents).toBe('none');

        const spacers = container.querySelectorAll<HTMLElement>('[data-testid^="header-item-"]');
        expect(spacers.length).toBeGreaterThan(0);
        spacers.forEach((spacer) => expect(spacer.style.pointerEvents).toBe('none'));
      });

      it('keeps a rendered header item clickable inside the pass-through overlay', () => {
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {},
          },
          config: {
            header: {
              items: [
                {
                  id: 'custom',
                  size: { width: 80 },
                  component: () => <div data-testid="custom-header-item">Custom</div>,
                },
              ],
            },
          },
        };
        const { getByTestId } = render(<TextWidget {...props} />);

        expect(getByTestId('header-item-custom').style.pointerEvents).toBe('auto');
      });
    });

    describe('onDataPointClick event handler', () => {
      it('should call onDataPointClick when widget is clicked', () => {
        const onDataPointClickMock = vi.fn();
        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Click me</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-middle',
          },
          onDataPointClick: onDataPointClickMock,
        };

        const { getByText } = render(<TextWidget {...props} />);
        const textElement = getByText('Click me');

        // Click on the text element which should bubble up to the container
        fireEvent.click(textElement);

        expect(onDataPointClickMock).toHaveBeenCalledTimes(1);
        expect(onDataPointClickMock).toHaveBeenCalledWith(
          expect.objectContaining({
            html: '<p>Click me</p>',
          }),
          expect.any(Object), // MouseEvent
        );
      });

      it('should pass correct data point structure to onDataPointClick', () => {
        const onDataPointClickMock = vi.fn();
        const htmlContent = '<div><h1>Test Title</h1><p>Test content</p></div>';
        const props: TextWidgetProps = {
          styleOptions: {
            html: htmlContent,
            bgColor: '#f0f0f0',
            vAlign: 'valign-bottom',
          },
          onDataPointClick: onDataPointClickMock,
        };

        const { getByText } = render(<TextWidget {...props} />);
        const textElement = getByText('Test content');
        fireEvent.click(textElement);

        expect(onDataPointClickMock).toHaveBeenCalledTimes(1);
        const [dataPoint, nativeEvent] = onDataPointClickMock.mock.calls[0];

        expect(dataPoint).toEqual({
          html: htmlContent,
        });
        expect(nativeEvent).toBeInstanceOf(Object);
        expect(nativeEvent.type).toBe('click');
      });

      it('should handle HTML content correctly in data point', () => {
        const onDataPointClickMock = vi.fn();
        const htmlContent = '<p>Safe content</p>';
        const props: TextWidgetProps = {
          styleOptions: {
            html: htmlContent,
            bgColor: '#ffffff',
            vAlign: 'valign-middle',
          },
          onDataPointClick: onDataPointClickMock,
        };

        const { getByText } = render(<TextWidget {...props} />);
        const textElement = getByText('Safe content');
        fireEvent.click(textElement);

        expect(onDataPointClickMock).toHaveBeenCalledTimes(1);
        const [dataPoint] = onDataPointClickMock.mock.calls[0];
        expect(dataPoint.html).toBe(htmlContent);
      });
    });
  });
});
