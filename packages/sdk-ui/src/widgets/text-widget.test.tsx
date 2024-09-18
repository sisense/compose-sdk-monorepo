/** @vitest-environment jsdom */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { isTextWidgetProps, TextWidget } from './text-widget';
import { TextWidgetProps } from '@/props';

vi.mock('@/decorators/component-decorators/as-sisense-component', () => ({
  asSisenseComponent: () => (Component: any) => Component,
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
  });
});
