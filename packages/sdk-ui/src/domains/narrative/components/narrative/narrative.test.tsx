import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { setup } from '@/__test-helpers__';
import { ThemeProvider } from '@/infra/contexts/theme-provider';
import { translation } from '@/infra/translation/resources/en';

import { mockNarrativeStandard } from './__mocks__/narrative-mocks.js';
import { formatNarrativeTimestamp, Narrative } from './narrative.js';

const readyState = { status: 'ready', data: mockNarrativeStandard } as const;

/**
 * Without a Sisense context the component is wrapped in `I18nProvider`, which renders nothing until the
 * i18n instance has initialised — so every assertion has to wait for that first paint.
 */

describe('Narrative', () => {
  it('renders the overview and one card per insight', async () => {
    setup(<Narrative state={readyState} />);

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.getAllByTestId('csdk-narrative-insight')).toHaveLength(
      mockNarrativeStandard.insights.length,
    );
  });

  it('draws at most three insights', async () => {
    const extra = { ...mockNarrativeStandard.insights[0], text: 'A **fourth** insight.' };
    setup(
      <Narrative
        state={{
          status: 'ready',
          data: { ...mockNarrativeStandard, insights: [...mockNarrativeStandard.insights, extra] },
        }}
      />,
    );

    expect(await screen.findAllByTestId('csdk-narrative-insight')).toHaveLength(3);
  });

  it('keeps emphasis but renders links as plain text and drops images', async () => {
    const overview =
      'Revenue **rose** — see [details](https://example.com) ![chart](https://example.com/c.png).';
    setup(<Narrative state={{ status: 'ready', data: { ...mockNarrativeStandard, overview } }} />);

    const node = await screen.findByTestId('csdk-narrative-overview');
    expect(node.querySelector('strong')?.textContent).toBe('rose');
    expect(node.querySelector('a')).toBeNull();
    expect(node.querySelector('img')).toBeNull();
    expect(node.textContent).toContain('see details');
  });

  it('omits the insight row when there are no insights', async () => {
    setup(
      <Narrative state={{ status: 'ready', data: { ...mockNarrativeStandard, insights: [] } }} />,
    );

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-insights')).toBeNull();
  });

  it('offers no action when there is nothing to narrate, and offers a retry when generation failed', async () => {
    const { unmount } = setup(<Narrative state={{ status: 'error', kind: 'no-data' }} />);
    expect(await screen.findByTestId('csdk-narrative-error')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
    unmount();

    setup(<Narrative state={{ status: 'error', kind: 'failed' }} />);
    const retry = await screen.findByTestId('csdk-narrative-generate');
    expect(retry).toBeEnabled();
    expect(retry).toHaveTextContent(translation.narrativeWidget.retry);
  });

  it('offers no action at all once the allowance is spent', async () => {
    setup(<Narrative state={{ status: 'error', kind: 'quota-exceeded' }} />);

    expect(await screen.findByText(translation.ai.quota.exceededErrorTitle)).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
  });
});

/** Pins the en-US fallback: `formatDate` ignores the reader's language unless a locale is passed. */
describe('formatNarrativeTimestamp', () => {
  const ISO = '2026-06-02T14:53:00Z';

  it('follows the conventions of the given language', () => {
    expect(formatNarrativeTimestamp(ISO, 'en-US')).toContain('06/02/2026');
    expect(formatNarrativeTimestamp(ISO, 'de-DE')).toContain('02.06.2026');
    expect(formatNarrativeTimestamp(ISO, 'ja-JP')).toContain('2026/06/02');
  });

  it('orders day and month differently across locales rather than always en-US', () => {
    expect(formatNarrativeTimestamp(ISO, 'de-DE')).not.toEqual(
      formatNarrativeTimestamp(ISO, 'en-US'),
    );
  });

  it('falls back to a usable format when the language is unknown', () => {
    expect(formatNarrativeTimestamp(ISO, undefined)).toEqual(
      formatNarrativeTimestamp(ISO, 'en-US'),
    );
  });
});

/** The idle warning spells the message out; the footer warning must reduce it to a mark with a tooltip. */
describe('quota warning presentation', () => {
  const quotaWarning = { usagePercentage: 87 };
  const message = translation.narrativeWidget.creditsUsed.replace('{{usagePercentage}}', '87');

  it('spells the warning out beneath the idle action', async () => {
    setup(<Narrative state={{ status: 'idle' }} quotaWarning={quotaWarning} />);

    expect(await screen.findByText(message)).toBeTruthy();
  });

  it('reduces the warning to a mark beside the footer action once a narrative exists', async () => {
    setup(<Narrative state={readyState} quotaWarning={quotaWarning} />);

    expect(await screen.findByTestId('csdk-narrative-quota-warning')).toBeTruthy();
    expect(screen.queryByText(message)).toBeNull();
  });

  it('keeps the narrative and the mark but kills regenerate once the allowance is spent', async () => {
    setup(<Narrative state={readyState} quotaWarning={{ usagePercentage: 100, exceeded: true }} />);

    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-quota-warning')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-generate')).toBeDisabled();
  });
});

/** Loading uses the SDK's shared overlay, so delay and enabled/disabled follow the app's loadingIndicatorConfig. */
describe('loading', () => {
  it('shows the shared loading overlay while generating', async () => {
    setup(<Narrative state={{ status: 'loading' }} />);

    const area = await screen.findByTestId('csdk-narrative-loading');
    expect(area.querySelector('[data-testid="csdk-loading-overlay"]')).toBeTruthy();
  });

  it('leaves the loading treatment to a host that draws its own chrome', async () => {
    setup(<Narrative state={{ status: 'loading' }} showLoadingOverlay={false} />);

    const area = await screen.findByTestId('csdk-narrative-loading');
    expect(area.querySelector('[data-testid="csdk-loading-overlay"]')).toBeNull();
  });
});

/** Only the generated text scrolls; the footer sits outside the scroll container so it never leaves view. */
describe('overflow', () => {
  it('scrolls the content area and keeps the footer pinned outside it', async () => {
    setup(<Narrative state={readyState} />);

    const content = await screen.findByTestId('csdk-narrative-content');
    const footer = screen.getByTestId('csdk-narrative-footer');

    expect(getComputedStyle(content).overflowY).toBe('auto');
    expect(content.contains(footer)).toBe(false);
    expect(getComputedStyle(screen.getByTestId('csdk-narrative')).overflowY).toBe('hidden');
  });
});

/** The action button is hand-rolled, so host theming must still reach it — via the body text colour. */
describe('action button theming', () => {
  it('takes its text colour from typography.primaryTextColor and stays unfilled at rest', async () => {
    setup(
      <ThemeProvider theme={{ typography: { primaryTextColor: 'rgb(200, 100, 50)' } }}>
        <Narrative state={{ status: 'idle' }} />
      </ThemeProvider>,
    );

    const button = await screen.findByTestId('csdk-narrative-generate');
    const styles = getComputedStyle(button);

    expect(styles.color).toBe('rgb(200, 100, 50)');
    expect(styles.backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});
