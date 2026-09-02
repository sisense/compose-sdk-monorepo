/**
 * Shared panel state machine for ConditionFilterText / ConditionFilterNumeric —
 * open/close/abandon, drill navigation, connector + operator list filtering,
 * and generic chain-row updates. Domain draft shaping stays in each control.
 * @internal
 */
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { Filter } from '@sisense/sdk-data';

import type { ConditionFilterScreen } from './condition-filter-shell.js';
import type { DropdownItem } from './dropdown';

/** AND/OR connector shared by text and numeric condition drafts. @internal */
export type ConditionConnector = 'AND' | 'OR';

/** Minimum shape of a chained condition row. @internal */
export type ConditionChainRowBase = {
  id: string;
};

/**
 * Minimum draft shape the panel state machine can drive.
 * @internal
 */
export type ConditionDraftBase<Op extends string, Row extends ConditionChainRowBase> = {
  op: Op;
  connector: ConditionConnector;
  extra: readonly Row[];
};

type UseConditionFilterPanelArgs<Draft> = {
  filter: Filter | null | undefined;
  toDraft: (filter: Filter | null | undefined) => Draft;
  defaultDraft: () => Draft;
  operatorItems: DropdownItem[];
  chainOperatorItems: DropdownItem[];
};

/**
 * Owns Condition panel chrome state (screens, query, draft snapshot on open).
 * @typeParam Op - Primary / chain operator id
 * @typeParam Row - Chained row type (must include `id` and `op`)
 * @typeParam Draft - Full draft including domain value fields
 * @param args - Filter → draft adapters and operator catalogues
 * @returns Panel navigation, draft setters, and drill-list builder
 * @internal
 */
export function useConditionFilterPanel<
  Op extends string,
  Row extends ConditionChainRowBase & { op: Op },
  Draft extends ConditionDraftBase<Op, Row>,
>({
  filter,
  toDraft,
  defaultDraft,
  operatorItems,
  chainOperatorItems,
}: UseConditionFilterPanelArgs<Draft>) {
  const { t } = useTranslation();
  const [isOpen, setOpen] = useState(false);
  const [screen, setScreen] = useState<ConditionFilterScreen>({ kind: 'value' });
  const [query, setQuery] = useState('');
  const [triedApply, setTriedApply] = useState(false);

  const committed = useMemo(() => toDraft(filter), [filter, toDraft]);
  const [draft, setDraft] = useState<Draft>(committed);
  const [openedWith, setOpenedWith] = useState<Draft>(committed);

  const connectorLabel = useCallback(
    (connector: ConditionConnector) =>
      connector === 'OR' ? t('filterRelations.or', 'OR') : t('filterRelations.and', 'AND'),
    [t],
  );

  const connectorItems: DropdownItem[] = useMemo(
    () => [
      { id: 'AND', label: connectorLabel('AND') },
      { id: 'OR', label: connectorLabel('OR') },
    ],
    [connectorLabel],
  );

  const filteredOperators = useMemo(() => {
    const source = screen.kind === 'chainOp' ? chainOperatorItems : operatorItems;
    const needle = query.trim().toLowerCase();
    if (!needle) return source;
    return source.filter((item) => String(item.label).toLowerCase().includes(needle));
  }, [operatorItems, chainOperatorItems, query, screen.kind]);

  const back = useCallback(() => {
    setScreen({ kind: 'value' });
    setQuery('');
  }, []);

  const close = useCallback(() => {
    setOpen(false);
    setScreen({ kind: 'value' });
    setQuery('');
    setTriedApply(false);
  }, []);

  const open = useCallback(() => {
    const next = toDraft(filter);
    setDraft(next);
    setOpenedWith(next);
    setScreen({ kind: 'value' });
    setQuery('');
    setTriedApply(false);
    setOpen(true);
  }, [filter, toDraft]);

  const abandon = useCallback(() => {
    setDraft(openedWith);
    close();
  }, [openedWith, close]);

  const clearDraft = useCallback(() => {
    setDraft(defaultDraft());
    setScreen({ kind: 'value' });
    setQuery('');
    setTriedApply(false);
  }, [defaultDraft]);

  const openDrill = useCallback((next: ConditionFilterScreen) => {
    setScreen(next);
    setQuery('');
  }, []);

  const setChainConnector = useCallback((connector: ConditionConnector) => {
    setDraft((prev) => ({ ...prev, connector }));
  }, []);

  const updateRow = useCallback((rowId: string, part: Partial<Row>) => {
    setDraft((prev) => ({
      ...prev,
      extra: prev.extra.map((row) => (row.id === rowId ? { ...row, ...part } : row)),
    }));
  }, []);

  const removeRow = useCallback((rowId: string) => {
    setDraft((prev) => ({
      ...prev,
      extra: prev.extra.filter((row) => row.id !== rowId),
    }));
  }, []);

  const buildDrill = useCallback(
    ({
      selectConditionLabel,
      onPickPrimary,
      onPickChainOp,
    }: {
      selectConditionLabel: string;
      onPickPrimary: (opId: string) => void;
      onPickChainOp: (rowId: string, opId: string) => void;
    }) => {
      if (screen.kind === 'operator') {
        return {
          title: selectConditionLabel,
          items: filteredOperators,
          selected: [draft.op],
          onSelect: onPickPrimary,
        };
      }
      if (screen.kind === 'connector') {
        return {
          title: t('filterWidget.controls.selectConnector', 'Select AND/OR'),
          items: connectorItems,
          selected: [draft.connector],
          onSelect: (next: string) => {
            setChainConnector(next as ConditionConnector);
            back();
          },
        };
      }
      if (screen.kind === 'chainOp') {
        const row = draft.extra.find((entry) => entry.id === screen.rowId);
        return {
          title: `${connectorLabel(draft.connector)} · ${selectConditionLabel}`,
          items: filteredOperators,
          selected: [row?.op ?? ''],
          onSelect: (next: string) => {
            onPickChainOp(screen.rowId, next);
            setTriedApply(false);
            back();
          },
        };
      }
      return null;
    },
    [
      screen,
      filteredOperators,
      draft.op,
      draft.connector,
      draft.extra,
      t,
      connectorItems,
      connectorLabel,
      setChainConnector,
      back,
    ],
  );

  return {
    isOpen,
    screen,
    query,
    setQuery,
    triedApply,
    setTriedApply,
    committed,
    draft,
    setDraft,
    open,
    back,
    close,
    abandon,
    clearDraft,
    openDrill,
    connectorLabel,
    updateRow,
    removeRow,
    buildDrill,
  };
}
