import { useEffect, useMemo, useRef } from 'react';
import type { CSSProperties, ReactNode, UIEvent } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import throttle from 'lodash-es/throttle';

import { LoadingDots } from '@/shared/components/loading-dots';

import { FIELD_RADIUS, panel, spacing, typography } from './design-tokens';
import type { FieldRadius } from './design-tokens';
import { fwFallback, fwFieldShadow, fwVar } from './field-palette';
import { Icon } from './icons';

/**
 * The select list's variants.
 *
 * - `multi` — checkbox per row, 30px rows, with the bulk-action header
 * - `single` — check glyph on the chosen row, 30px rows, no header
 * - `hint` — bare 18px suggestion rows (no check, no header) under a text entry
 * @internal
 */
export type DropdownMode = 'multi' | 'single' | 'hint';

/** @internal */
export type DropdownItem = {
  id: string;
  label: ReactNode;
  /**
   * A quiet mark in front of the label. Never truncated: it is short and fixed by
   * nature, so the label is what gives way when the row runs out of room.
   */
  lead?: ReactNode;
  disabled?: boolean;
};

/**
 * How far down the list is, and which way it just moved.
 *
 * `top` is a fraction of the scrollable distance, not a pixel offset, so a threshold
 * against it means the same thing however long the list has grown.
 * @internal
 */
export type DropdownScrollEvent = {
  top: number;
  direction: 'down' | 'up';
};

const SCROLL_THROTTLE_MS = 300;

/** @internal */
export type DropdownProps = {
  mode?: DropdownMode;
  /**
   * Panel corner, following the Corner Radius setting. There is deliberately no
   * `size`: that setting governs field heights, and a list keeps its own 30px row
   * rhythm at every one of them.
   */
  radius?: FieldRadius;
  items: DropdownItem[];
  /** Selected ids. `single` reads the first entry. */
  selected?: string[];
  onSelect?: (id: string) => void;
  /**
   * `Select All` / `Clear all`, which only a `multi` list draws. Neither action has
   * anything to act on where one choice is the most that can be held.
   */
  onSelectAll?: () => void;
  onClearAll?: () => void;
  /** Disables `Select All` — already in the select-all state. */
  selectAllDisabled?: boolean;
  /** Disables `Clear all` — already cleared. */
  clearAllDisabled?: boolean;
  /** Keyboard-highlighted row, driven by the owning combobox. */
  activeId?: string;
  /** Caps the list and scrolls past it. */
  maxHeight?: number;
  /** Fires as the list scrolls, so the owner can page more members in. */
  onScroll?: (event: DropdownScrollEvent) => void;
  /** Renders a loading row under the items while the next page is in flight. */
  loading?: boolean;
  /**
   * Whether the list draws its own surface — fill, corner and shadow. Set false when
   * it is already inside one: two stacked shadows read as a seam.
   */
  surface?: boolean;
  width?: number | string;
  emptyMessage?: ReactNode;
  id?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * The panel holds its contents 16px off every edge, so a header and list sit inside it
 * with 12px between them. Rows are inset by that padding rather than running edge to
 * edge, so a hovered row stops short of the panel's own border. It clips, because the
 * list scrolls and a row scrolled under the padding should not show past the corner.
 */
const Panel = styled.div<{
  $radius: FieldRadius;
  $surface: boolean;
  $width?: number | string;
}>`
  display: flex;
  flex-direction: column;
  gap: ${panel.gap};
  align-items: stretch;
  box-sizing: border-box;
  width: ${({ $width }) =>
    $width === undefined ? panel.width : typeof $width === 'number' ? `${$width}px` : $width};
  max-width: 100%;
  padding: ${({ $surface }) => ($surface ? panel.padding : '0')};
  font-family: ${fwVar('fontFamily', fwFallback.fontFamily)};
  /* Checkbox and check glyphs are the primary ink, unlike the secondary glyphs inside
     a field. */
  color: ${fwVar('panelText', fwFallback.panelText)};
  background: ${({ $surface }) => ($surface ? fwVar('panelBg', fwFallback.panelBg) : 'none')};
  overflow: ${({ $surface }) => ($surface ? 'hidden' : 'visible')};
  border-radius: ${({ $radius, $surface }) => ($surface ? FIELD_RADIUS[$radius] : '0')};
  box-shadow: ${({ $surface }) => ($surface ? fwFieldShadow : 'none')};
`;

const Header = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${spacing.m};
  align-items: flex-end;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${spacing.m};
  align-items: center;
`;

const Link = styled.button`
  padding: 0;
  font-family: inherit;
  font-size: ${typography.link.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.link.lineHeight};
  white-space: nowrap;
  cursor: pointer;
  background: none;
  border: 0;

  /* Doubled classes, deliberately. An embedding host may colour bare \`button\` elements, and
     such a selector outranks a single generated class — so these links read as the host's grey
     instead of the theme's hyperlink colour. Every state is doubled, not just the resting one:
     lifting the resting colour alone would leave it outranking the disabled colour it should
     defer to. */
  && {
    color: ${fwVar('link', fwFallback.link)};
  }

  &&:hover:not(:disabled) {
    color: ${fwVar('linkHover', fwFallback.linkHover)};
  }

  /* Muted rather than the hyperlink colour: a link that still reads as a link invites a click
     it will not accept. */
  &&:disabled {
    color: ${fwVar('textSecondary', fwFallback.textSecondary)};
    cursor: not-allowed;
  }
`;

/**
 * Lighter than a field's border: this rule only separates the two links from the rows
 * beneath them, and at full border strength it reads as a second edge inside the list.
 * Mixed down from the border rather than given a hex, so it stays a fixed fraction of
 * whatever the border becomes.
 */
const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: color-mix(
    in srgb,
    ${fwVar('border', fwFallback.border)} 55%,
    ${fwVar('panelBg', fwFallback.panelBg)}
  );
`;

/**
 * Rows sit flush against the panel's padding — the 6px belongs to `hint` alone.
 * Hint rows are 18px rather than 30px, so without it the first and last would sit
 * tight against the padding where a 30px row's own height gives it room.
 */
const List = styled.ul<{ $mode: DropdownMode }>`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  margin: 0;
  padding: ${({ $mode }) => ($mode === 'hint' ? '6px 0' : '0')};
  overflow: hidden;
  list-style: none;
`;

const Option = styled.li<{ $mode: DropdownMode; $active: boolean; $disabled: boolean }>`
  /* A row keeps its height and the list scrolls. Without flex-shrink:0 a capped list
     squashes its rows to fit instead. */
  flex: 0 0 auto;
  display: flex;
  gap: ${({ $mode }) => ($mode === 'hint' ? '0' : spacing.xs)};
  align-items: center;
  justify-content: ${({ $mode }) => ($mode === 'single' ? 'space-between' : 'flex-start')};
  box-sizing: border-box;
  width: 100%;
  height: ${({ $mode }) => ($mode === 'hint' ? panel.hintRowHeight : panel.rowHeight)};
  padding: 0 ${spacing.m};
  overflow: hidden;
  color: ${({ $disabled }) =>
    $disabled ? fwVar('textSecondary', fwFallback.textSecondary) : 'inherit'};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};
  background: ${({ $active }) =>
    $active ? fwVar('rowHover', fwFallback.rowHover) : 'transparent'};

  &:hover {
    background: ${fwVar('rowHover', fwFallback.rowHover)};
  }
`;

const OptionLead = styled.span`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  font-size: ${typography.label.size};
  line-height: ${typography.label.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

const OptionLabel = styled.span`
  flex: 1 1 0;
  min-width: 0;
  overflow: hidden;
  font-size: ${typography.paragraph.size};
  font-weight: ${typography.label.weight};
  line-height: ${typography.paragraph.lineHeight};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Notice = styled.li`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  height: ${panel.rowHeight};
  padding: 0 ${spacing.m};
  font-size: ${typography.paragraph.size};
  line-height: ${typography.paragraph.lineHeight};
  color: ${fwVar('textSecondary', fwFallback.textSecondary)};
`;

/** The next page arriving, under the rows already loaded. */
const LoadingRow = styled.li`
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${panel.rowHeight};
`;

/**
 * The option list under a trigger.
 * @param props - The items, the selection, and the bulk actions the mode allows
 * @returns The panel, its header and its rows
 * @internal
 */
export function Dropdown({
  mode = 'multi',
  radius = 's',
  items,
  selected = [],
  onSelect,
  onSelectAll,
  onClearAll,
  selectAllDisabled,
  clearAllDisabled,
  activeId,
  maxHeight,
  onScroll,
  loading = false,
  surface = true,
  width,
  emptyMessage,
  id,
  className,
  style,
}: DropdownProps) {
  const { t } = useTranslation();
  const multi = mode === 'multi';
  const hint = mode === 'hint';
  const lastScrollTop = useRef(0);

  const handleScroll = useMemo(() => {
    if (!onScroll) {
      return undefined;
    }
    const report = throttle((element: HTMLUListElement) => {
      const scrollable = element.scrollHeight - element.clientHeight;
      const direction = element.scrollTop >= lastScrollTop.current ? 'down' : 'up';
      lastScrollTop.current = element.scrollTop;
      onScroll({ top: scrollable > 0 ? element.scrollTop / scrollable : 0, direction });
    }, SCROLL_THROTTLE_MS);

    return { handler: (event: UIEvent<HTMLUListElement>) => report(event.currentTarget), report };
  }, [onScroll]);

  /* The trailing call would otherwise land after the panel closed, paging a list nobody is
     looking at. */
  useEffect(() => () => handleScroll?.report.cancel(), [handleScroll]);

  /* Arrow keys move `activeId`, and `aria-activedescendant` points a screen reader at it — but
     a capped list scrolls, so without this the highlighted row can sit outside the viewport
     and the keyboard user is navigating rows they cannot see. */
  const activeRowRef = useRef<HTMLLIElement | null>(null);
  useEffect(() => {
    // Optional call: jsdom does not implement scrollIntoView, and this is presentation only.
    activeRowRef.current?.scrollIntoView?.({ block: 'nearest' });
  }, [activeId]);

  return (
    <Panel className={className} $radius={radius} $surface={surface} $width={width} style={style}>
      {multi && (
        <Header>
          <HeaderActions>
            <Link
              type="button"
              data-testid="filter-widget-select-all"
              onClick={onSelectAll}
              disabled={selectAllDisabled}
            >
              {t('filterEditor.buttons.selectAll')}
            </Link>
            <Link
              type="button"
              data-testid="filter-widget-clear-all"
              onClick={onClearAll}
              disabled={clearAllDisabled}
            >
              {t('filterEditor.buttons.clearAll')}
            </Link>
          </HeaderActions>
          <Divider />
        </Header>
      )}

      <List
        id={id}
        data-testid={hint ? 'filter-widget-hint-list' : 'filter-widget-select-list'}
        $mode={mode}
        role="listbox"
        aria-multiselectable={multi || undefined}
        onScroll={handleScroll?.handler}
        style={maxHeight === undefined ? undefined : { maxHeight, overflowY: 'auto' }}
      >
        {items.length === 0 && !loading && !hint && (
          <Notice>{emptyMessage ?? t('filterWidget.controls.noMatches')}</Notice>
        )}

        {items.map((item) => {
          const isSelected = selected.includes(item.id);
          return (
            <Option
              key={item.id}
              ref={activeId === item.id ? activeRowRef : undefined}
              id={id ? `${id}-${item.id}` : undefined}
              $mode={mode}
              $active={activeId === item.id}
              $disabled={Boolean(item.disabled)}
              role="option"
              data-testid={hint ? 'filter-widget-hint-option' : 'filter-widget-select-option'}
              aria-selected={isSelected}
              aria-disabled={item.disabled || undefined}
              onClick={() => {
                if (!item.disabled) {
                  onSelect?.(item.id);
                }
              }}
            >
              {multi && <Icon name={isSelected ? 'checkboxChecked' : 'checkboxUnchecked'} />}

              {item.lead !== undefined && item.lead !== null && (
                <OptionLead>{item.lead}</OptionLead>
              )}

              <OptionLabel>{item.label}</OptionLabel>

              {!multi && !hint && isSelected && <Icon name="check" />}
            </Option>
          );
        })}

        {loading && (
          <LoadingRow>
            <LoadingDots color="grey" />
          </LoadingRow>
        )}
      </List>
    </Panel>
  );
}
