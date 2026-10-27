/**
 * Panel state for the Rank control — open / close / abandon, the two drill-in lists, and the
 * draft the panel edits. The draft is local: nothing reaches the host until Apply.
 * @internal
 */
import { useCallback, useMemo, useState } from 'react';

import type { Filter } from '@sisense/sdk-data';

import type { ConditionFilterScreen } from './condition-filter-shell.js';
import { emptyRankDraft, readRankDraft } from './rank.js';
import type { RankDraft } from './rank.js';

type UseRankFilterPanelArgs = {
  filter: Filter | null | undefined;
  isDate: boolean;
};

/**
 * Owns the Rank panel's chrome state and its draft.
 * @param args - The linked filter and whether the attribute is a datetime attribute.
 * @returns Panel navigation, the draft and its setters.
 * @internal
 */
export function useRankFilterPanel(args: UseRankFilterPanelArgs) {
  const { filter, isDate } = args;
  const [isOpen, setOpen] = useState(false);
  const [screen, setScreen] = useState<ConditionFilterScreen>({ kind: 'value' });

  const committed = useMemo(() => readRankDraft(filter, isDate), [filter, isDate]);
  const [draft, setDraft] = useState<RankDraft>(() => committed ?? emptyRankDraft(isDate));
  const [openedWith, setOpenedWith] = useState<RankDraft>(draft);

  const back = useCallback(() => setScreen({ kind: 'value' }), []);

  const close = useCallback(() => {
    setOpen(false);
    setScreen({ kind: 'value' });
  }, []);

  /* A prefill is shown, not applied: a panel with no applied ranking opens on the defaults
     and publishes nothing until Apply. */
  const open = useCallback(() => {
    const next = committed ?? emptyRankDraft(isDate);
    setDraft(next);
    setOpenedWith(next);
    setScreen({ kind: 'value' });
    setOpen(true);
  }, [committed, isDate]);

  const abandon = useCallback(() => {
    setDraft(openedWith);
    close();
  }, [openedWith, close]);

  /* Clear resets the draft, not the filter: the panel stays open and Apply decides. */
  const clearDraft = useCallback(() => {
    setDraft(emptyRankDraft(isDate));
    setScreen({ kind: 'value' });
  }, [isDate]);

  const openDrill = useCallback((next: ConditionFilterScreen) => setScreen(next), []);

  return {
    isOpen,
    screen,
    committed,
    draft,
    setDraft,
    open,
    back,
    close,
    abandon,
    clearDraft,
    openDrill,
  };
}
