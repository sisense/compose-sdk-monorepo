import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { TabberButtonsWidgetProps } from '@/props';

import { TabberButtonsWidget } from './tabber-buttons-widget';
import type { TabberButtonsWidgetCustomOptions, TabberButtonsWidgetStyleOptions } from './types';

vi.mock('@/decorators/component-decorators/as-sisense-component', () => ({
  asSisenseComponent: () => (Component: any) => Component,
}));

const baseTabsConfig: TabberButtonsWidgetCustomOptions = {
  tabNames: ['Tab One', 'Tab Two', 'Tab Three'],
};

const baseStyleOptions: TabberButtonsWidgetStyleOptions = {
  showSeparators: true,
  showDescription: false,
  selectedColor: '#FFCB05',
  unselectedColor: '#9EA2AB',
  descriptionColor: '#9EA2AB',
  tabsSize: 'medium',
  tabsInterval: 'medium',
  tabsAlignment: 'center',
  tabCornerRadius: 'none',
};

const baseProps: TabberButtonsWidgetProps = {
  id: 'tabber1',
  widgetType: 'custom',
  dataOptions: {},
  customWidgetType: 'tabber-buttons',
  styleOptions: baseStyleOptions,
  customOptions: { ...baseTabsConfig, activeTab: 0 },
  description: '',
};

describe('TabberButtonsWidget Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab items with correct text and no description by default', () => {
    render(<TabberButtonsWidget {...baseProps} />);
    // Check that all tab titles are rendered
    expect(screen.getByText('Tab One')).toBeInTheDocument();
    expect(screen.getByText('Tab Two')).toBeInTheDocument();
    expect(screen.getByText('Tab Three')).toBeInTheDocument();
  });

  it('renders description when showDescription is true and description prop is provided', () => {
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      showDescription: true,
    };
    const descriptionText = 'This is a tab description';
    render(
      <TabberButtonsWidget
        {...baseProps}
        styleOptions={customStyle}
        description={descriptionText}
      />,
    );
    expect(screen.getByText(descriptionText)).toBeInTheDocument();
  });

  it('calls onTabSelected with the correct index when a tab is clicked', () => {
    const onTabSelectedMock = vi.fn();
    const propsWithCallback: TabberButtonsWidgetProps = {
      ...baseProps,
      customOptions: {
        ...baseProps.customOptions,
        onTabSelected: onTabSelectedMock,
      },
    };
    render(<TabberButtonsWidget {...propsWithCallback} />);
    const tabTwo = screen.getByText('Tab Two');
    fireEvent.click(tabTwo);
    expect(onTabSelectedMock).toHaveBeenCalledWith(1);
  });

  it('does not render separators when showSeparators is false', () => {
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      showSeparators: false,
    };
    const { container } = render(<TabberButtonsWidget {...baseProps} styleOptions={customStyle} />);
    // Separator is a styled div with a right border. Verify no element has such a border.
    const divs = Array.from(container.querySelectorAll('div'));
    const hasSeparator = divs.some((div) => {
      return div.attributes.getNamedItem('data-testid')?.value === 'tabber-separator';
    });
    expect(hasSeparator).toBe(false);
  });

  it('applies custom colors and background styles for active and inactive tabs', () => {
    // Define custom style options:
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      // Active tab should have red text and pink background.
      selectedColor: 'red', // red → rgb(255, 0, 0)
      selectedBackgroundColor: 'pink', // pink → rgb(255, 192, 203)
      // Inactive tab should have blue text and lightblue background.
      unselectedColor: 'blue', // blue → rgb(0, 0, 255)
      unselectedBackgroundColor: 'lightblue', // lightblue → rgb(173, 216, 230)
      tabCornerRadius: 'small', // small maps to 5px border-radius
    };

    const customTabsConfig = {
      ...baseTabsConfig,
      activeTab: 1,
    };

    render(
      <TabberButtonsWidget
        {...baseProps}
        styleOptions={customStyle}
        customOptions={customTabsConfig}
        description={'desc'}
      />,
    );
    const activeTabElement = screen.getByText('Tab Two').parentElement;
    const inactiveTabElement = screen.getByText('Tab One').parentElement;

    // Use getComputedStyle to obtain the CSS properties.
    const activeStyles = window.getComputedStyle(activeTabElement!);
    const inactiveStyles = window.getComputedStyle(inactiveTabElement!);

    // Assert active tab styles:
    expect(activeStyles.color).toBe('rgb(255, 0, 0)'); // red
    expect(activeStyles.backgroundColor).toBe('rgb(255, 192, 203)'); // pink
    expect(activeStyles.borderRadius).toBe('5px');

    // Assert inactive tab styles:
    expect(inactiveStyles.color).toBe('rgb(0, 0, 255)'); // blue
    expect(inactiveStyles.backgroundColor).toBe('rgb(173, 216, 230)');
  });

  it('renders transparent backgrounds when background colors are not provided', () => {
    // When background colors are not provided, both tabs should have transparent backgrounds
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      // No selectedBackgroundColor or unselectedBackgroundColor provided
    };

    // Active tab is index 0 (Tab One) in this case.
    render(<TabberButtonsWidget {...baseProps} styleOptions={customStyle} />);
    const activeTabElement = screen.getByText('Tab One').parentElement;
    const inactiveTabElement = screen.getByText('Tab Two').parentElement;
    const activeStyles = window.getComputedStyle(activeTabElement!);
    const inactiveStyles = window.getComputedStyle(inactiveTabElement!);

    // Expect both backgrounds to be transparent.
    // Depending on the browser/JSDOM, transparent can appear as 'rgba(0, 0, 0, 0)'.
    expect(activeStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(inactiveStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('applies unselectedBackgroundColor only to unselected tabs when selectedBackgroundColor is not specified', () => {
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      unselectedBackgroundColor: 'lightblue', // lightblue → rgb(173, 216, 230)
      // No selectedBackgroundColor provided
    };

    render(<TabberButtonsWidget {...baseProps} styleOptions={customStyle} />);
    const activeTabElement = screen.getByText('Tab One').parentElement;
    const inactiveTabElement = screen.getByText('Tab Two').parentElement;
    const activeStyles = window.getComputedStyle(activeTabElement!);
    const inactiveStyles = window.getComputedStyle(inactiveTabElement!);

    // Active tab should be transparent since selectedBackgroundColor is not provided
    expect(activeStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    // Inactive tab should have lightblue background
    expect(inactiveStyles.backgroundColor).toBe('rgb(173, 216, 230)');
  });

  it('applies custom descriptionColor to the description text', () => {
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      showDescription: true,
      descriptionColor: 'purple',
    };
    const descriptionText = 'Custom description';
    render(
      <TabberButtonsWidget
        {...baseProps}
        styleOptions={customStyle}
        description={descriptionText}
      />,
    );
    const descriptionElement = screen.getByText(descriptionText);
    const descriptionStyles = window.getComputedStyle(descriptionElement);
    // 'purple' usually computes to 'rgb(128, 0, 128)'
    expect(descriptionStyles.color).toBe('rgb(128, 0, 128)');
  });

  it('applies correct text alignment based on tabsAlignment', () => {
    const customStyle: TabberButtonsWidgetStyleOptions = {
      ...baseStyleOptions,
      tabsAlignment: 'right',
    };
    const { container } = render(<TabberButtonsWidget {...baseProps} styleOptions={customStyle} />);
    // The List container is the first child inside the ContentWrapper.
    const contentWrapper = container.firstChild;
    const listElement = contentWrapper?.firstChild as HTMLElement;
    const listStyles = window.getComputedStyle(listElement);
    expect(listStyles.textAlign).toBe('right');
  });

  it('applies correct padding based on tabsInterval', () => {
    // For small: expect padding "0px 6px"
    // For medium: expect padding "0px 12px"
    // For large: expect padding "0px 24px"
    const intervals: { interval: 'small' | 'medium' | 'large'; expectedPadding: string }[] = [
      { interval: 'small', expectedPadding: '0px 6px' },
      { interval: 'medium', expectedPadding: '0px 12px' },
      { interval: 'large', expectedPadding: '0px 24px' },
    ];
    intervals.forEach(({ interval, expectedPadding }) => {
      const customStyle: TabberButtonsWidgetStyleOptions = {
        ...baseStyleOptions,
        tabsInterval: interval,
      };
      const { container, unmount } = render(
        <TabberButtonsWidget {...baseProps} styleOptions={customStyle} />,
      );
      const contentWrapper = container.firstChild;
      const listElement = contentWrapper?.firstChild as HTMLElement;
      const listStyles = window.getComputedStyle(listElement);
      expect(listStyles.padding).toBe(expectedPadding);
      unmount();
    });
  });

  it('applies different font-size based on tabsSize', () => {
    // We test that different tabsSize values yield different computed font-size values.
    const sizes: { size: 'small' | 'medium' | 'large' }[] = [
      { size: 'small' },
      { size: 'medium' },
      { size: 'large' },
    ];
    const fontSizes: Record<string, string> = {};
    sizes.forEach(({ size }) => {
      const customStyle: TabberButtonsWidgetStyleOptions = {
        ...baseStyleOptions,
        tabsSize: size,
      };
      const { container, unmount } = render(
        <TabberButtonsWidget {...baseProps} styleOptions={customStyle} />,
      );
      const contentWrapper = container.firstChild;
      const listElement = contentWrapper?.firstChild as HTMLElement;
      const listStyles = window.getComputedStyle(listElement);
      fontSizes[size] = listStyles.fontSize;
      unmount();
    });
    // Assert that font sizes are distinct for each tabsSize value.
    expect(fontSizes.small).not.toBe(fontSizes.medium);
    expect(fontSizes.medium).not.toBe(fontSizes.large);
  });
});
