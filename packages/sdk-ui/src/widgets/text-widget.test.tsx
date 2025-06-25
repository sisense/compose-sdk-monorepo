/** @vitest-environment jsdom */
import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { isTextWidgetProps, TextWidget } from './text-widget';
import { TextWidgetProps } from '@/props';

vi.mock('@/decorators/component-decorators/as-sisense-component', () => ({
  asSisenseComponent: () => (Component: any) => Component,
}));

vi.mock('../theme-provider', () => ({
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
