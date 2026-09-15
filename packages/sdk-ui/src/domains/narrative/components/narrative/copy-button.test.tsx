import { act, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { setup } from '@/__test-helpers__';
import { translation } from '@/infra/translation/resources/en';

import { NarrativeCopyButton } from './copy-button.js';

describe('NarrativeCopyButton', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes the copy text to the clipboard, formatting preserved', async () => {
    const { user } = setup(<NarrativeCopyButton copyText="**bold** narrative" />);

    await user.click(await screen.findByTestId('csdk-narrative-copy-button'));

    expect(await navigator.clipboard.readText()).toBe('**bold** narrative');
  });

  it('shows the copied confirmation for four seconds and is inert meanwhile', async () => {
    vi.useFakeTimers();
    try {
      const { user } = setup(<NarrativeCopyButton copyText="text" />, true);
      const button = screen.getByTestId('csdk-narrative-copy-button');

      await user.click(button);
      // Let the clipboard promise settle.
      await act(async () => {
        await vi.advanceTimersByTimeAsync(0);
      });

      expect(button).toBeDisabled();
      expect(button).toHaveAccessibleName(translation.narrativeWidget.copied);

      await act(async () => {
        await vi.advanceTimersByTimeAsync(3999);
      });
      expect(button).toBeDisabled();

      await act(async () => {
        await vi.advanceTimersByTimeAsync(1);
      });
      expect(button).toBeEnabled();
      expect(button).toHaveAccessibleName(translation.narrativeWidget.copy);
    } finally {
      vi.useRealTimers();
    }
  });

  it('stays inert when the clipboard write is denied', async () => {
    const { user } = setup(<NarrativeCopyButton copyText="text" />);
    const button = await screen.findByTestId('csdk-narrative-copy-button');
    vi.spyOn(navigator.clipboard, 'writeText').mockRejectedValue(new Error('denied'));

    await user.click(button);

    expect(button).toHaveAccessibleName(translation.narrativeWidget.copy);
  });
});
