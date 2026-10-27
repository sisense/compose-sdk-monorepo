import { screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setup } from '@/__test-helpers__';
import { ThemeProvider } from '@/infra/contexts/theme-provider';
import { translation } from '@/infra/translation/resources/en';

import { mockNarrativeSixInsights, mockNarrativeStandard } from './__mocks__/narrative-mocks.js';
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

  it('draws every insight, beyond three included', async () => {
    setup(<Narrative state={{ status: 'ready', data: mockNarrativeSixInsights }} />);

    expect(await screen.findAllByTestId('csdk-narrative-insight')).toHaveLength(6);
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

/**
 * The height the content needs, reported so a host can size the widget to it. jsdom lays nothing
 * out, so every measured element reports the same stubbed height.
 */
describe('natural height', () => {
  const MEASURED = 40;

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const stubHeights = () =>
    vi.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(MEASURED);

  it('reports the ready content with the design paddings: 16, text, 16, footer, 8', async () => {
    stubHeights();
    const onNaturalHeightChange = vi.fn();
    setup(<Narrative state={readyState} onNaturalHeightChange={onNaturalHeightChange} />);

    await screen.findByTestId('csdk-narrative-overview');

    expect(onNaturalHeightChange).toHaveBeenLastCalledWith(16 + MEASURED + 16 + MEASURED + 8);
  });

  it('reports the idle and error states with 16 above and below', async () => {
    stubHeights();
    const onIdle = vi.fn();
    const idle = setup(<Narrative state={{ status: 'idle' }} onNaturalHeightChange={onIdle} />);
    await screen.findByTestId('csdk-narrative-idle');
    expect(onIdle).toHaveBeenLastCalledWith(16 + MEASURED + 16);
    idle.unmount();

    const onError = vi.fn();
    setup(
      <Narrative state={{ status: 'error', kind: 'failed' }} onNaturalHeightChange={onError} />,
    );
    await screen.findByTestId('csdk-narrative-error');
    expect(onError).toHaveBeenLastCalledWith(16 + MEASURED + 16);
  });

  it('reports nothing while loading', async () => {
    stubHeights();
    const onNaturalHeightChange = vi.fn();
    setup(
      <Narrative state={{ status: 'loading' }} onNaturalHeightChange={onNaturalHeightChange} />,
    );

    await screen.findByTestId('csdk-narrative-loading');

    expect(onNaturalHeightChange).not.toHaveBeenCalled();
  });
});

/** A rendering nobody interacts with, such as an export, draws no actions. */
describe('without actions', () => {
  it('draws no generate, regenerate or retry action', async () => {
    const { unmount } = setup(<Narrative state={{ status: 'idle' }} showActions={false} />);
    expect(await screen.findByTestId('csdk-narrative-idle')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
    unmount();

    const ready = setup(<Narrative state={readyState} showActions={false} />);
    expect(await screen.findByTestId('csdk-narrative-overview')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-timestamp')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
    ready.unmount();

    setup(<Narrative state={{ status: 'error', kind: 'failed' }} showActions={false} />);
    expect(await screen.findByTestId('csdk-narrative-error')).toBeTruthy();
    expect(screen.queryByTestId('csdk-narrative-generate')).toBeNull();
  });
});

/** Before a narrative exists, a host can point the user at the AI context option in its menu. */
describe('AI context hint', () => {
  it('suggests adding AI context beside the idle action, with the option name in bold', async () => {
    setup(<Narrative state={{ status: 'idle' }} aiContextHint />);

    const hint = await screen.findByTestId('csdk-narrative-ai-context-hint');
    expect(hint).toHaveTextContent('For better performance,add AI Context');
    expect(hint.querySelector('strong')).toHaveTextContent('AI Context');
    expect(screen.getByTestId('csdk-narrative-generate')).toBeTruthy();
  });

  describe('beside the generate action', () => {
    afterEach(() => {
      vi.restoreAllMocks();
    });

    /** Lays the generate action out at 233–415 px and the hint text from `textLeft`, both 16–44 px high. */
    const layOut = (textLeft: number) => {
      vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
        this: HTMLElement,
      ) {
        const box = (left: number, right: number) =>
          ({ left, right, top: 16, bottom: 44, width: right - left, height: 28 } as DOMRect);
        if (this.dataset.testid === 'csdk-narrative-generate') return box(233, 415);
        if (this.parentElement?.dataset.testid === 'csdk-narrative-ai-context-hint') {
          return box(textLeft, textLeft + 215);
        }
        return box(0, 648);
      });
    };

    it('hides the hint while its text would come within 16 px of the action', async () => {
      layOut(390);
      setup(<Narrative state={{ status: 'idle' }} aiContextHint />);

      expect(await screen.findByTestId('csdk-narrative-ai-context-hint')).toHaveStyle({
        visibility: 'hidden',
      });
    });

    it('re-measures when the action stack changes, as when a quota line joins it', async () => {
      setup(<Narrative state={{ status: 'idle' }} aiContextHint />);
      const action = await screen.findByTestId('csdk-narrative-generate');
      const hintText = screen.getByTestId('csdk-narrative-ai-context-hint').firstElementChild;

      const observedByHint = vi
        .mocked(ResizeObserver)
        .mock.results.map(({ value }) => value.observe.mock.calls.map((call: unknown[]) => call[0]))
        .find((nodes: unknown[]) => nodes.includes(hintText));
      expect(observedByHint).toContain(action.parentElement);
    });

    it('shows the hint when its text keeps clear of the action', async () => {
      layOut(431);
      setup(<Narrative state={{ status: 'idle' }} aiContextHint />);

      expect(await screen.findByTestId('csdk-narrative-ai-context-hint')).toHaveStyle({
        visibility: 'visible',
      });
    });
  });

  it('keeps the hint alongside the quota warning', async () => {
    setup(
      <Narrative state={{ status: 'idle' }} aiContextHint quotaWarning={{ usagePercentage: 87 }} />,
    );

    expect(await screen.findByTestId('csdk-narrative-ai-context-hint')).toBeTruthy();
    expect(screen.getByTestId('csdk-narrative-quota-warning')).toBeTruthy();
  });

  it('shows no hint unless asked, once a narrative exists, on an error, or without actions', async () => {
    const cases = [
      <Narrative key="not asked" state={{ status: 'idle' }} />,
      <Narrative key="ready" state={readyState} aiContextHint />,
      <Narrative key="failed" state={{ status: 'error', kind: 'failed' }} aiContextHint />,
      <Narrative
        key="quota-exceeded"
        state={{ status: 'error', kind: 'quota-exceeded' }}
        aiContextHint
      />,
      <Narrative key="no actions" state={{ status: 'idle' }} aiContextHint showActions={false} />,
    ];
    for (const ui of cases) {
      const { unmount } = setup(ui);
      expect(await screen.findByTestId('csdk-narrative')).toBeTruthy();
      expect(screen.queryByTestId('csdk-narrative-ai-context-hint')).toBeNull();
      unmount();
    }
  });
});

/** The footer stays one line at any width; the disclaimer is the part that gives way. */
describe('footer disclaimer', () => {
  it('keeps the footer on one line and cuts the disclaimer with an ellipsis', async () => {
    setup(<Narrative state={readyState} />);

    const disclaimer = await screen.findByTestId('csdk-narrative-disclaimer');
    const row = disclaimer.parentElement as HTMLElement;

    expect(getComputedStyle(row).flexWrap).not.toBe('wrap');
    expect(getComputedStyle(disclaimer).textOverflow).toBe('ellipsis');
    expect(getComputedStyle(disclaimer).whiteSpace).toBe('nowrap');
  });

  it('shows the full disclaimer on hover only when it is cut', async () => {
    const { user } = setup(<Narrative state={readyState} />);
    const disclaimer = await screen.findByTestId('csdk-narrative-disclaimer');

    await user.hover(disclaimer);
    expect(screen.queryByRole('tooltip')).toBeNull();
    await user.unhover(disclaimer);

    Object.defineProperty(disclaimer, 'scrollWidth', { configurable: true, value: 400 });
    Object.defineProperty(disclaimer, 'clientWidth', { configurable: true, value: 120 });
    await user.hover(disclaimer);

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      translation.narrativeWidget.disclaimer,
    );
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
