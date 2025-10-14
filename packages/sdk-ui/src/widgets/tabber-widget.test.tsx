import React from 'react';

import { fireEvent, render, screen } from '@testing-library/react';

import { TabberWidgetProps } from '@/props';
import type { TabberStyleProps, TabberTab } from '@/types';

import { TabberWidget, TabInterval, TabSize } from './tabber-widget';

const sampleTabs: TabberTab[] = [
  { title: 'Tab One', displayWidgetIds: ['w1'] },
  { title: 'Tab Two', displayWidgetIds: ['w2'] },
  { title: 'Tab Three', displayWidgetIds: ['w3'] },
];

const baseStyleOptions: TabberStyleProps = {
  showTitle: false,
  showSeparators: true,
  showDescription: false,
  useSelectedBkg: false,
  useUnselectedBkg: false,
  selectedColor: '#FFCB05',
  unselectedColor: '#9EA2AB',
  descriptionColor: '#9EA2AB',
  selectedBkgColor: '#FFFFFF',
  unselectedBkgColor: '#FFFFFF',
  tabsSize: 'MEDIUM',
  tabsInterval: 'MEDIUM',
  tabsAlignment: 'CENTER',
  tabCornerRadius: 'NONE',
  tabs: sampleTabs,
  activeTab: 0,
};

const baseProps: TabberWidgetProps = {
  styleOptions: baseStyleOptions,
  description: '',
  selectedTab: 0,
  onTabSelected: vi.fn(),
  width: '100%',
};

describe('TabberWidget Component Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders all tab items with correct text and no description by default', () => {
    render(<TabberWidget {...baseProps} />);
    // Check that all tab titles are rendered
    expect(screen.getByText('Tab One')).toBeInTheDocument();
    expect(screen.getByText('Tab Two')).toBeInTheDocument();
    expect(screen.getByText('Tab Three')).toBeInTheDocument();
  });

  it('renders description when showDescription is true and description prop is provided', () => {
    const customStyle: TabberStyleProps = {
      ...baseStyleOptions,
      showDescription: true,
    };
    const descriptionText = 'This is a tab description';
    render(
      <TabberWidget {...baseProps} styleOptions={customStyle} description={descriptionText} />,
    );
    expect(screen.getByText(descriptionText)).toBeInTheDocument();
  });

  it('calls onTabSelected with the correct index when a tab is clicked', () => {
    const onTabSelectedMock = vi.fn();
    render(<TabberWidget {...baseProps} selectedTab={0} onTabSelected={onTabSelectedMock} />);
    const tabTwo = screen.getByText('Tab Two');
    fireEvent.click(tabTwo);
    expect(onTabSelectedMock).toHaveBeenCalledWith(1);
  });

  it('does not render separators when showSeparators is false', () => {
    const customStyle: TabberStyleProps = {
      ...baseStyleOptions,
      showSeparators: false,
    };
    const { container } = render(<TabberWidget {...baseProps} styleOptions={customStyle} />);
    // Separator is a styled div with a right border. Verify no element has such a border.
    const divs = Array.from(container.querySelectorAll('div'));
    const hasSeparator = divs.some((div) => {
      return div.attributes.getNamedItem('data-testid')?.value === 'tabber-separator';
    });
    expect(hasSeparator).toBe(false);
  });

  it('applies custom colors and background styles for active and inactive tabs', () => {
    // Define custom style options:
    const customStyle: TabberStyleProps = {
      ...baseStyleOptions,
      // Active tab should have red text and pink background.
      selectedColor: 'red', // red → rgb(255, 0, 0)
      selectedBkgColor: 'pink', // pink → rgb(255, 192, 203)
      // Inactive tab should have blue text and lightblue background.
      unselectedColor: 'blue', // blue → rgb(0, 0, 255)
      useSelectedBkg: true,
      useUnselectedBkg: true,
      unselectedBkgColor: 'lightblue', // lightblue → rgb(173, 216, 230)
      tabCornerRadius: 'SMALL', // SMALL maps to 5px border-radius
    };

    render(
      <TabberWidget
        {...baseProps}
        styleOptions={customStyle}
        selectedTab={1}
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

  it('renders transparent backgrounds when useSelectedBkg and useUnselectedBkg are false', () => {
    // Even though default baseStyleOptions has useSelectedBkg/unselectedBkg false,
    // we explicitly set them to false and provide non-transparent colors.
    const customStyle: TabberStyleProps = {
      ...baseStyleOptions,
      useSelectedBkg: false,
      useUnselectedBkg: false,
      selectedBkgColor: 'pink', // these should be ignored
      unselectedBkgColor: 'lightblue', // these should be ignored
      tabs: sampleTabs,
    };

    // Active tab is index 0 (Tab One) in this case.
    render(<TabberWidget {...baseProps} styleOptions={customStyle} selectedTab={0} />);
    const activeTabElement = screen.getByText('Tab One').parentElement;
    const inactiveTabElement = screen.getByText('Tab Two').parentElement;
    const activeStyles = window.getComputedStyle(activeTabElement!);
    const inactiveStyles = window.getComputedStyle(inactiveTabElement!);

    // Expect both backgrounds to be transparent.
    // Depending on the browser/JSDOM, transparent can appear as 'rgba(0, 0, 0, 0)'.
    expect(activeStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(inactiveStyles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('applies custom descriptionColor to the description text', () => {
    const customStyle: TabberStyleProps = {
      ...baseStyleOptions,
      showDescription: true,
      descriptionColor: 'purple',
      tabs: sampleTabs,
    };
    const descriptionText = 'Custom description';
    render(
      <TabberWidget {...baseProps} styleOptions={customStyle} description={descriptionText} />,
    );
    const descriptionElement = screen.getByText(descriptionText);
    const descriptionStyles = window.getComputedStyle(descriptionElement);
    // 'purple' usually computes to 'rgb(128, 0, 128)'
    expect(descriptionStyles.color).toBe('rgb(128, 0, 128)');
  });

  it('applies correct text alignment based on tabsAlignment', () => {
    const customStyle: TabberStyleProps = {
      ...baseStyleOptions,
      tabsAlignment: 'RIGHT',
      tabs: sampleTabs,
    };
    const { container } = render(<TabberWidget {...baseProps} styleOptions={customStyle} />);
    // The List container is the first child inside the ContentWrapper.
    const contentWrapper = container.firstChild;
    const listElement = contentWrapper?.firstChild as HTMLElement;
    const listStyles = window.getComputedStyle(listElement);
    expect(listStyles.textAlign).toBe('right');
  });

  it('applies correct padding based on tabsInterval', () => {
    // For SMALL: expect padding "0px 6px"
    // For MEDIUM: expect padding "0px 12px"
    // For LARGE: expect padding "0px 24px"
    const intervals: { interval: TabInterval; expectedPadding: string }[] = [
      { interval: 'SMALL', expectedPadding: '0px 6px' },
      { interval: 'MEDIUM', expectedPadding: '0px 12px' },
      { interval: 'LARGE', expectedPadding: '0px 24px' },
    ];
    intervals.forEach(({ interval, expectedPadding }) => {
      const customStyle: TabberStyleProps = {
        ...baseStyleOptions,
        tabsInterval: interval,
        tabs: sampleTabs,
      };
      const { container, unmount } = render(
        <TabberWidget {...baseProps} styleOptions={customStyle} />,
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
    const sizes: { size: TabSize }[] = [{ size: 'SMALL' }, { size: 'MEDIUM' }, { size: 'LARGE' }];
    const fontSizes: Record<string, string> = {};
    sizes.forEach(({ size }) => {
      const customStyle: TabberStyleProps = {
        ...baseStyleOptions,
        tabsSize: size,
        tabs: sampleTabs,
      };
      const { container, unmount } = render(
        <TabberWidget {...baseProps} styleOptions={customStyle} />,
      );
      const contentWrapper = container.firstChild;
      const listElement = contentWrapper?.firstChild as HTMLElement;
      const listStyles = window.getComputedStyle(listElement);
      fontSizes[size] = listStyles.fontSize;
      unmount();
    });
    // Assert that font sizes are distinct for each tabsSize value.
    expect(fontSizes.SMALL).not.toBe(fontSizes.MEDIUM);
    expect(fontSizes.MEDIUM).not.toBe(fontSizes.LARGE);
  });
});
