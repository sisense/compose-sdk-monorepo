/** @vitest-environment jsdom */
import { fireEvent, render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { TextWidgetProps } from '@/props';

import { isTextWidgetProps, TextWidget } from './text-widget';

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

      it('should render custom title when renderTitle is provided', () => {
        const customTitle = 'Custom Widget Title';
        const renderTitleMock = vi.fn(() => <div data-testid="custom-title">{customTitle}</div>);

        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              renderTitle: renderTitleMock,
            },
          },
        };
        const { getByTestId, getByText } = render(<TextWidget {...props} />);

        expect(renderTitleMock).toHaveBeenCalledWith(null);
        expect(getByTestId('custom-title')).toBeInTheDocument();
        expect(getByText(customTitle)).toBeInTheDocument();
      });

      it('should render custom toolbar when renderToolbar is provided', () => {
        const customToolbar = 'Custom Toolbar';
        const renderToolbarMock = vi.fn(() => (
          <div data-testid="custom-toolbar">{customToolbar}</div>
        ));

        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              renderToolbar: renderToolbarMock,
            },
          },
        };
        const { getByTestId, getByText } = render(<TextWidget {...props} />);

        expect(renderToolbarMock).toHaveBeenCalledWith(null);
        expect(getByTestId('custom-toolbar')).toBeInTheDocument();
        expect(getByText(customToolbar)).toBeInTheDocument();
      });

      it('should render both custom title and toolbar when both are provided', () => {
        const customTitle = 'Custom Title';
        const customToolbar = 'Custom Toolbar';
        const renderTitleMock = vi.fn(() => <div data-testid="custom-title">{customTitle}</div>);
        const renderToolbarMock = vi.fn(() => (
          <div data-testid="custom-toolbar">{customToolbar}</div>
        ));

        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              renderTitle: renderTitleMock,
              renderToolbar: renderToolbarMock,
            },
          },
        };
        const { getByTestId, getByText } = render(<TextWidget {...props} />);

        expect(renderTitleMock).toHaveBeenCalledWith(null);
        expect(renderToolbarMock).toHaveBeenCalledWith(null);
        expect(getByTestId('custom-title')).toBeInTheDocument();
        expect(getByTestId('custom-toolbar')).toBeInTheDocument();
        expect(getByText(customTitle)).toBeInTheDocument();
        expect(getByText(customToolbar)).toBeInTheDocument();
      });

      it('should render empty title and toolbar sections when header is provided but no render functions', () => {
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

        // Should have title and toolbar divs but they should be empty
        const titleElement = headerElement?.querySelector('div:first-child');
        const toolbarElement = headerElement?.querySelector('div:last-child');

        expect(titleElement).toBeInTheDocument();
        expect(toolbarElement).toBeInTheDocument();
        expect(titleElement?.textContent).toBe('');
        expect(toolbarElement?.textContent).toBe('');
      });

      it('should handle renderTitle returning null', () => {
        const renderTitleMock = vi.fn(() => null);

        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              renderTitle: renderTitleMock,
            },
          },
        };
        const { container } = render(<TextWidget {...props} />);

        expect(renderTitleMock).toHaveBeenCalledWith(null);
        const headerElement = container.querySelector('.text-widget-header');
        expect(headerElement).toBeInTheDocument();

        const titleElement = headerElement?.querySelector('div:first-child');
        expect(titleElement).toBeInTheDocument();
        expect(titleElement?.textContent).toBe('');
      });

      it('should handle renderToolbar returning null', () => {
        const renderToolbarMock = vi.fn(() => null);

        const props: TextWidgetProps = {
          styleOptions: {
            html: '<p>Sample Text</p>',
            bgColor: '#ffffff',
            vAlign: 'valign-top',
            header: {
              renderToolbar: renderToolbarMock,
            },
          },
        };
        const { container } = render(<TextWidget {...props} />);

        expect(renderToolbarMock).toHaveBeenCalledWith(null);
        const headerElement = container.querySelector('.text-widget-header');
        expect(headerElement).toBeInTheDocument();

        const toolbarElement = headerElement?.querySelector('div:last-child');
        expect(toolbarElement).toBeInTheDocument();
        expect(toolbarElement?.textContent).toBe('');
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
