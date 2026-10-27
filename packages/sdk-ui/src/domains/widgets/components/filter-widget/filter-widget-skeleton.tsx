import { useTranslation } from 'react-i18next';

import Skeleton from '@mui/material/Skeleton';

import { FIELD_HEIGHT, FIELD_RADIUS } from './components/design-tokens';
import { membersFilterWidgetDesign, resolveFilterWidgetControlStyle } from './filter-widget-design';
import type { FilterWidgetControlStyleOptions } from './types';

// Drawn in the host's text colour: the theme does not exist yet while the skeleton is shown.
const shimmerSx = {
  bgcolor: 'color-mix(in srgb, currentColor 8%, transparent)',
  '&::after': {
    background:
      'linear-gradient(90deg, transparent, color-mix(in srgb, currentColor 8%, transparent), transparent)',
  },
  '@media (prefers-reduced-motion: reduce)': {
    '&::after': { animation: 'none' },
  },
};

/** @internal */
export type FilterWidgetSkeletonProps = {
  /** The control's Filter Style, so the skeleton has the control's size and placement. */
  controlStyleOptions?: FilterWidgetControlStyleOptions;
};

/**
 * Placeholder for the FilterWidget control while it loads, shaped and placed like the control.
 * @param props - Skeleton props.
 * @returns Filter widget skeleton.
 * @internal
 */
export const FilterWidgetSkeleton = (props: FilterWidgetSkeletonProps) => {
  const { t } = useTranslation();
  const { tokens, containerAlign } = resolveFilterWidgetControlStyle(props.controlStyleOptions);
  const { padding, minWidth, maxWidth } = membersFilterWidgetDesign;

  return (
    <div
      data-testid="filter-widget-skeleton"
      role="status"
      aria-busy="true"
      aria-label={t('loadingOverlay.label')}
      style={containerAlign}
    >
      <div
        style={{
          padding: `${padding.top}px ${padding.right}px ${padding.bottom}px ${padding.left}px`,
          width: '100%',
          minWidth,
          maxWidth,
          boxSizing: 'border-box',
        }}
      >
        <Skeleton
          data-testid="filter-widget-skeleton-field"
          variant="rectangular"
          animation="wave"
          height={FIELD_HEIGHT[tokens.size]}
          sx={{ ...shimmerSx, borderRadius: FIELD_RADIUS[tokens.cornerRadius] }}
        />
      </div>
    </div>
  );
};
