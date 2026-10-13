import { type FunctionComponent, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { applyOpacity } from '@/shared/utils/color/color-interpolation';

import { fieldPaletteVars, useFieldPalette } from './components/field-palette';
import { filterWidgetDesign } from './filter-widget-design';
import type { FilterWidgetControlStyleOptions } from './types';

const BORDER_BOX = 'border-box' as const;
const SETUP_ICON_ID = 'filter-widget-setup';

function SetupIcon({ size }: { size: number }) {
  return (
    <span
      className="app-icon"
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        flexShrink: 0,
        display: 'inline-flex',
      }}
    >
      <svg
        className="app-icon__svg"
        width={size}
        height={size}
        focusable="false"
        style={{ fill: 'currentColor' }}
      >
        <use href={`#${SETUP_ICON_ID}`} xlinkHref={`#${SETUP_ICON_ID}`} />
      </svg>
    </span>
  );
}

type FilterWidgetSetupProps = {
  /** Opens the host widget editor. Omit to render a non-interactive button. */
  onSetup?: () => void;
  onReady?: () => void;
  controlStyleOptions?: FilterWidgetControlStyleOptions;
  /** Mirrors the dropdown root so tests can assert value type on the empty state. */
  attributeValueType?: string | null;
};

/**
 * "Set up filter" button shown on the dashboard when the widget has no dimension yet.
 *
 * @internal
 */
export const FilterWidgetSetup: FunctionComponent<FilterWidgetSetupProps> = ({
  onSetup,
  onReady,
  controlStyleOptions,
  attributeValueType,
}) => {
  const { t } = useTranslation();
  const palette = useFieldPalette(controlStyleOptions);
  const emptySetup = filterWidgetDesign.emptySetup;
  const clickable = typeof onSetup === 'function';

  useEffect(() => {
    onReady?.();
    // Mount-only: the host uses this as widget `domready`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      data-testid="filter-widget-setup"
      data-filter-attribute-value-type={attributeValueType ?? 'unsupported'}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        width: '100%',
        boxSizing: BORDER_BOX,
        ...fieldPaletteVars(palette),
      }}
    >
      <button
        type="button"
        data-testid="filter-widget-setup-button"
        disabled={!clickable}
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          onSetup?.();
        }}
        style={{
          boxSizing: BORDER_BOX,
          minWidth: emptySetup.width,
          height: emptySetup.height,
          padding: `0 ${emptySetup.paddingInline}px`,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: emptySetup.iconGap,
          borderWidth: 1,
          borderStyle: 'solid',
          /* The primary ink at partial strength, not the fields' faint border: the button is
             the widget's call to action and its outline has to read as one, in the theme's
             (or Filter Style's) own primary text color. */
          borderColor: applyOpacity(palette.textPrimary, emptySetup.borderOpacity),
          borderRadius: emptySetup.radius,
          background: palette.bg,
          /* Primary ink, not secondary: this is the widget's one call to action, and the
             secondary grey read as a disabled button. The glyph follows via currentColor. */
          color: palette.textPrimary,
          fontFamily: palette.fontFamily,
          fontSize: emptySetup.fontSize,
          lineHeight: emptySetup.lineHeight,
          fontWeight: emptySetup.fontWeight,
          whiteSpace: 'nowrap',
          cursor: clickable ? 'pointer' : 'default',
        }}
      >
        <SetupIcon size={emptySetup.iconSize} />
        {t('filterWidget.emptySetup', 'Set up filter')}
      </button>
    </div>
  );
};
