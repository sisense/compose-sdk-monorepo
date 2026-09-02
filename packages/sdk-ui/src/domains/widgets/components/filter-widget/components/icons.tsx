/**
 * The control set's glyphs.
 *
 * Each is inlined as SVG path data and painted with `currentColor`, so a glyph
 * follows the ink of whatever contains it. Masking an imported `.svg` asset would be
 * the shorter route, but the UMD builds emit assets they do not inline below the size
 * limit, and a glyph that resolves to a relative URL renders as nothing once the
 * bundle is loaded from elsewhere.
 * @internal
 */
import { spacing } from './design-tokens';

type Glyph = {
  viewBox: string;
  width: number;
  height: number;
  d: string;
  /** The path is a shape with a hole — a checkbox outline, a magnifier. */
  evenOdd?: true;
  /** Reuses another glyph's path, mirrored. */
  flip?: 'x' | 'y';
};

const CHEVRON_D =
  'M4.00001 2.84005L7.17471 0.120297C7.38442 -0.05936 7.70006 -0.034998 7.87972 0.174711C8.05938 0.38442 8.03502 0.700064 7.82531 0.879721L4.32531 3.87816C4.1381 4.03854 3.86192 4.03854 3.67471 3.87816L0.174711 0.879721C-0.034998 0.700064 -0.05936 0.38442 0.120297 0.174711C0.299954 -0.034998 0.615598 -0.05936 0.825307 0.120297L4.00001 2.84005Z';

const ARROW_LEFT_D =
  'M3.87815 0.825307C4.05781 0.615598 4.03345 0.299954 3.82374 0.120297C3.61403 -0.05936 3.29838 -0.034998 3.11873 0.174711L0.120288 3.67471C-0.040096 3.86192 -0.040096 4.1381 0.120288 4.32531L3.11873 7.82531C3.29838 8.03502 3.61403 8.05938 3.82374 7.87972C4.03345 7.70006 4.05781 7.38442 3.87815 7.17471L1.15839 4.00001L3.87815 0.825307Z';

const GLYPHS = {
  chevronDown: { viewBox: '0 0 8.00002 3.99845', width: 8, height: 3.998, d: CHEVRON_D },
  chevronUp: { viewBox: '0 0 8.00002 3.99845', width: 8, height: 3.998, d: CHEVRON_D, flip: 'y' },
  arrowLeft: { viewBox: '0 0 3.99845 8.00002', width: 3.998, height: 8, d: ARROW_LEFT_D },
  arrowRight: {
    viewBox: '0 0 3.99845 8.00002',
    width: 3.998,
    height: 8,
    d: ARROW_LEFT_D,
    flip: 'x',
  },
  check: {
    viewBox: '0 0 9.26042 8.06153',
    width: 9.26,
    height: 8.062,
    evenOdd: true,
    d: 'M9.26042 0.581238L3.91736 8.06153L0 4.14417L0.707107 3.43707L3.78975 6.51971L8.44669 0L9.26042 0.581238Z',
  },
  checkboxChecked: {
    viewBox: '0 0 12 12',
    width: 12,
    height: 12,
    evenOdd: true,
    d: 'M10.6667 0H1.33333C0.6 0 0 0.6 0 1.33333V10.6667C0 11.4 0.6 12 1.33333 12H10.6667C11.4 12 12 11.4 12 10.6667V1.33333C12 0.6 11.4 0 10.6667 0V0ZM4.66667 9.33333L1.33333 6.12821L2.26667 5.23077L4.66667 7.53846L9.73333 2.66667L10.6667 3.5641L4.66667 9.33333V9.33333Z',
  },
  checkboxUnchecked: {
    viewBox: '0 0 12 12',
    width: 12,
    height: 12,
    d: 'M10 0C11.1046 0 12 0.89543 12 2V10C12 11.1046 11.1046 12 10 12H2C0.89543 12 0 11.1046 0 10V2C0 0.89543 0.89543 0 2 0H10ZM2 1C1.44772 1 1 1.44772 1 2V10C1 10.5523 1.44772 11 2 11H10C10.5523 11 11 10.5523 11 10V2C11 1.44772 10.5523 1 10 1H2Z',
  },
  closeSmall: {
    viewBox: '0 0 7.97906 7.97907',
    width: 7.979,
    height: 7.979,
    d: 'M7.12594 0.146444C7.32121 -0.0486382 7.63776 -0.0487583 7.83297 0.146444C8.02764 0.341688 8.02787 0.658374 7.83297 0.853475L4.69625 3.98922L7.83297 7.12594C8.02753 7.32125 8.02799 7.63794 7.83297 7.83297C7.63794 8.028 7.32125 8.02753 7.12594 7.83297L3.98922 4.69625L0.853475 7.83297C0.658373 8.02788 0.341691 8.02765 0.146444 7.83297C-0.0487608 7.63776 -0.0486457 7.32121 0.146444 7.12594L3.28219 3.98922L0.146444 0.853475C-0.0488147 0.658213 -0.0488146 0.341705 0.146444 0.146444C0.341706 -0.0488142 0.658214 -0.0488148 0.853475 0.146444L3.98922 3.28219L7.12594 0.146444Z',
  },
  search: {
    viewBox: '0 0 14 14',
    width: 14,
    height: 14,
    evenOdd: true,
    d: 'M5 10C2.23858 10 0 7.76142 0 5C0 2.23858 2.23858 0 5 0C7.76142 0 10 2.23858 10 5C10 6.20063 9.57682 7.30243 8.87147 8.16437L13.8536 13.1464C14.0488 13.3417 14.0488 13.6583 13.8536 13.8536C13.6583 14.0488 13.3417 14.0488 13.1464 13.8536L8.16437 8.87147C7.30243 9.57682 6.20063 10 5 10ZM5 9C7.20914 9 9 7.20914 9 5C9 2.79086 7.20914 1 5 1C2.79086 1 1 2.79086 1 5C1 7.20914 2.79086 9 5 9Z',
  },
} as const satisfies Record<string, Glyph>;

/** @internal */
export type IconName = keyof typeof GLYPHS;

/** @internal */
export type IconProps = {
  name: IconName;
  /** Size of the square the glyph is centred in. Defaults to Icon/M (24px). */
  box?: number;
  className?: string;
};

/**
 * Renders a glyph centred in a square box, in the current ink colour.
 * @param props - Which glyph, and the box to centre it in
 * @returns The glyph, hidden from assistive technology
 * @internal
 */
export function Icon({ name, box, className }: IconProps) {
  const glyph: Glyph = GLYPHS[name];
  const side = box ? `${box}px` : spacing.iconM;

  return (
    <span
      className={className}
      aria-hidden="true"
      style={{
        flex: '0 0 auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: side,
        height: side,
        overflow: 'hidden',
      }}
    >
      <svg
        width={glyph.width}
        height={glyph.height}
        viewBox={glyph.viewBox}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          display: 'block',
          transform:
            glyph.flip === 'y' ? 'scaleY(-1)' : glyph.flip === 'x' ? 'scaleX(-1)' : undefined,
        }}
      >
        <path
          d={glyph.d}
          fill="currentColor"
          fillRule={glyph.evenOdd ? 'evenodd' : undefined}
          clipRule={glyph.evenOdd ? 'evenodd' : undefined}
        />
      </svg>
    </span>
  );
}
