import { createAttribute } from '@sisense/sdk-data';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { Member } from '@/domains/filters/components/member-filter-tile/members-reducer';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';
import type { CompleteThemeSettingsInternal } from '@/types';

import { ConditionFilter } from './condition-filter';
import type { FilterControlStyle } from './field-palette';
import { FilterSelect } from './filter-select';

vi.mock('react-i18next', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-i18next')>();
  return { ...actual, useTranslation: () => ({ t: (key: string) => key }) };
});

// ConditionFilterText calls useGetFilterMembersInternal; without a mock (or SisenseContext)
// the hook retries forever and the suite OOMs — same pattern as condition-filter.test.tsx.
vi.mock('@/domains/filters/hooks/use-get-filter-members', () => ({
  useGetFilterMembersInternal: () => ({
    data: {
      allMembers: [],
      selectedMembers: [],
      excludeMembers: false,
      enableMultiSelection: true,
      hasBackgroundFilter: false,
    },
    loadMore: vi.fn(),
    isLoading: false,
    isAllItemsLoaded: true,
  }),
}));

const { useThemeContextMock } = vi.hoisted(() => ({ useThemeContextMock: vi.fn() }));

vi.mock('@/infra/contexts/theme-provider', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/infra/contexts/theme-provider')>();
  return { ...actual, useThemeContext: useThemeContextMock };
});

const MEMBERS: Member[] = [{ key: 'France', title: 'France' }];

/** A dark theme, where every frozen light constant used to show through. */
function darkTheme(): CompleteThemeSettingsInternal {
  const theme = getDefaultThemeSettings();
  theme.chart.backgroundColor = '#313138';
  theme.chart.textColor = '#FFFFFF';
  theme.chart.secondaryTextColor = '#C5C8CF';
  theme.general.brandColor = '#FFCB05';
  theme.typography.fontFamily = 'Roboto';
  theme.typography.hyperlinkColor = '#1FAFF3';
  theme.typography.hyperlinkHoverColor = '#1cd5dc';
  theme.general.buttons.cancel.backgroundColor = {
    default: '#EDEEF1',
    hover: '#D0D3DB',
    focus: '#D0D3DB',
  };
  theme.general.buttons.cancel.textColor = '#3A4356';
  return theme;
}

/** Renders the control and hands back the element the palette is published on. */
function renderControl(controlStyle?: FilterControlStyle) {
  const { container } = render(
    <FilterSelect
      members={MEMBERS}
      selectedMembers={[]}
      excludeMembers={false}
      enableMultiSelection={true}
      onSelectMember={vi.fn()}
      onSelectAll={vi.fn()}
      onClearAll={vi.fn()}
      controlStyle={controlStyle}
    />,
  );
  return container.querySelector('[style*="--csdk-fw-"]') as HTMLElement;
}

const cssVar = (element: HTMLElement, name: string) => element.style.getPropertyValue(name).trim();

describe('the palette a control publishes', () => {
  beforeEach(() => {
    useThemeContextMock.mockReturnValue({ themeSettings: darkTheme() });
  });

  it('reaches the DOM as the theme’s colours, not the design’s constants', () => {
    const root = renderControl();

    expect(cssVar(root, '--csdk-fw-bg')).toBe('#313138');
    expect(cssVar(root, '--csdk-fw-panel-bg')).toBe('#313138');
    expect(cssVar(root, '--csdk-fw-text-primary')).toBe('#FFFFFF');
    expect(cssVar(root, '--csdk-fw-text-label')).toBe('#FFFFFF');
    expect(cssVar(root, '--csdk-fw-text-secondary')).toBe('#C5C8CF');
    expect(cssVar(root, '--csdk-fw-accent')).toBe('#FFCB05');
  });

  it('publishes a border and a hover tinted from the theme’s ink', () => {
    const root = renderControl();

    expect(cssVar(root, '--csdk-fw-border')).toBe('#ffffff26');
    expect(cssVar(root, '--csdk-fw-surface-muted')).toBe('#ffffff0a');
    expect(cssVar(root, '--csdk-fw-row-hover')).toBe('#ffffff0a');
  });

  // Select all / Clear all are the only hyperlinks in the control, and they need both roles:
  // one to rest in, one to answer the pointer with.
  it('publishes both hyperlink roles for Select all / Clear all', () => {
    const root = renderControl();

    expect(cssVar(root, '--csdk-fw-link')).toBe('#1FAFF3');
    expect(cssVar(root, '--csdk-fw-link-hover')).toBe('#1cd5dc');
  });

  it('sets the type in the theme’s family', () => {
    const root = renderControl();

    expect(cssVar(root, '--csdk-fw-font-family')).toMatch(/^Roboto, /);
  });

  it('publishes the footer button colours the drill-in panel paints with', () => {
    const root = renderControl();

    expect(cssVar(root, '--csdk-fw-button-cancel-bg')).toBe('#EDEEF1');
    expect(cssVar(root, '--csdk-fw-button-cancel-hover')).toBe('#D0D3DB');
    expect(cssVar(root, '--csdk-fw-button-cancel-text')).toBe('#3A4356');
  });

  it('lets the widget’s own style outrank the theme', () => {
    const root = renderControl({ background: '#123456', accentColor: '#ff0000' });

    expect(cssVar(root, '--csdk-fw-bg')).toBe('#123456');
    expect(cssVar(root, '--csdk-fw-accent')).toBe('#ff0000');
    // Untouched roles keep following the theme.
    expect(cssVar(root, '--csdk-fw-text-primary')).toBe('#FFFFFF');
  });

  // A portal escapes the root, so it would inherit none of the variables.
  it('republishes the palette on the portaled panel', async () => {
    renderControl();
    await userEvent.click(screen.getByRole('combobox'));

    const portalRoot = screen.getByRole('listbox').closest('[style*="--csdk-fw-"]');
    expect(portalRoot).not.toBeNull();
    expect(cssVar(portalRoot as HTMLElement, '--csdk-fw-panel-bg')).toBe('#313138');
  });
});

/**
 * The condition filter arrived after the theming work and reuses the same `Field` chrome, so it
 * inherits the palette for free — this pins that, because a control that styled itself instead
 * would silently reintroduce the frozen palette this all replaced.
 */
describe('the palette a condition filter publishes', () => {
  const attribute = createAttribute({
    name: 'Country',
    expression: '[Commerce.Country]',
    type: 'text',
  });

  beforeEach(() => {
    useThemeContextMock.mockReturnValue({ themeSettings: darkTheme() });
  });

  it('reaches the DOM as the theme’s colours', () => {
    const { container } = render(
      <ConditionFilter attribute={attribute} onFilterUpdate={vi.fn()} />,
    );
    const root = container.querySelector('[style*="--csdk-fw-"]') as HTMLElement;

    expect(root).not.toBeNull();
    expect(cssVar(root, '--csdk-fw-bg')).toBe('#313138');
    expect(cssVar(root, '--csdk-fw-text-primary')).toBe('#FFFFFF');
    expect(cssVar(root, '--csdk-fw-border')).toBe('#ffffff26');
    expect(cssVar(root, '--csdk-fw-font-family')).toMatch(/^Roboto, /);
  });

  // The drill-in panel and its footer buttons live in filter-widget-panel.tsx, shared with the
  // period filter, and are portaled — so they need the palette republished on their own root.
  it('republishes the palette on the portaled condition panel', async () => {
    render(<ConditionFilter attribute={attribute} onFilterUpdate={vi.fn()} />);

    await userEvent.click(screen.getByTestId('filter-widget-condition-trigger'));

    const panel = screen.getByTestId('filter-widget-condition-panel');
    const portalRoot = panel.closest('[style*="--csdk-fw-"]') as HTMLElement;

    expect(portalRoot).not.toBeNull();
    expect(cssVar(portalRoot, '--csdk-fw-panel-bg')).toBe('#313138');
    expect(cssVar(portalRoot, '--csdk-fw-button-cancel-bg')).toBe('#EDEEF1');
  });
});

/**
 * Apply is the application's primary button, so it follows the theme's Primary Button roles.
 * It used to take the control's `accent` fill, which the Filter Style panel exposes — so
 * restyling one filter widget restyled its Apply while every other Apply in the product
 * stayed on the theme.
 */
describe('the panel’s Apply button', () => {
  beforeEach(() => {
    useThemeContextMock.mockReturnValue({ themeSettings: darkTheme() });
  });

  it('follows the theme’s primary button, not the control’s accent', () => {
    const root = renderControl({ accentColor: '#ff0000' });

    expect(cssVar(root, '--csdk-fw-accent')).toBe('#ff0000');
    // The accent moved; the button did not.
    expect(cssVar(root, '--csdk-fw-button-primary-bg')).not.toBe('#ff0000');
    // `backgroundColor` is either a flat colour or a stateful one, depending on the theme.
    const primaryBg = getDefaultThemeSettings().general.buttons.primary.backgroundColor;
    expect(cssVar(root, '--csdk-fw-button-primary-bg')).toBe(
      typeof primaryBg === 'string' ? primaryBg : primaryBg.default,
    );
  });
});
