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

const DOUBLE_ARROW_LEFT_D =
  'M3.11919 0.174805C3.29887 -0.0347654 3.61461 -0.059497 3.82427 0.120117C4.0338 0.299802 4.05758 0.615549 3.87798 0.825195L1.15825 4L3.87798 7.1748C4.05758 7.38445 4.03379 7.7002 3.82427 7.87988C3.6146 8.0595 3.29887 8.03477 3.11919 7.8252L0.120165 4.3252C-0.0400519 4.13803 -0.0400581 3.86196 0.120165 3.6748L3.11919 0.174805ZM6.11724 0.174805C6.29691 -0.0347654 6.61265 -0.059497 6.82231 0.120117C7.03185 0.299802 7.05563 0.615549 6.87602 0.825195L4.1563 4L6.87602 7.1748C7.05562 7.38445 7.03184 7.7002 6.82231 7.87988C6.61265 8.0595 6.29691 8.03477 6.11724 7.8252L3.11821 4.3252C2.95799 4.13803 2.95799 3.86196 3.11821 3.6748L6.11724 0.174805Z';

/* The three ruled lines and the bound outline as one path: the lines are simple closed
   shapes, so the even-odd rule the outline needs for its holes leaves them unchanged. */
const CALENDAR_D =
  'M10.5 12C10.7761 12 11 12.2239 11 12.5C11 12.7761 10.7761 13 10.5 13H3.5C3.22386 13 3 12.7761 3 12.5C3 12.2239 3.22386 12 3.5 12H10.5Z M10.5 10C10.7761 10 11 10.2239 11 10.5C11 10.7761 10.7761 11 10.5 11H3.5C3.22386 11 3 10.7761 3 10.5C3 10.2239 3.22386 10 3.5 10H10.5Z M10.5 8C10.7761 8 11 8.22386 11 8.5C11 8.77614 10.7761 9 10.5 9H3.5C3.22386 9 3 8.77614 3 8.5C3 8.22386 3.22386 8 3.5 8H10.5Z M9.5 0C9.77614 0 10 0.223858 10 0.5V2H12C13.1046 2 14 2.89543 14 4V14C14 15.1046 13.1046 16 12 16H2C0.89543 16 0 15.1046 0 14V4C0 2.89543 0.89543 2 2 2H4V0.5C4 0.223858 4.22386 0 4.5 0C4.77614 0 5 0.223858 5 0.5V2H9V0.5C9 0.223858 9.22386 0 9.5 0ZM1 14C1 14.5523 1.44772 15 2 15H12C12.5523 15 13 14.5523 13 14V6H1V14ZM2 3C1.44772 3 1 3.44772 1 4V5H13V4C13 3.44772 12.5523 3 12 3H10V3.5C10 3.77614 9.77614 4 9.5 4C9.22386 4 9 3.77614 9 3.5V3H5V3.5C5 3.77614 4.77614 4 4.5 4C4.22386 4 4 3.77614 4 3.5V3H2Z';

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
  doubleArrowLeft: {
    viewBox: '0 0 6.99654 8',
    width: 6.997,
    height: 8,
    d: DOUBLE_ARROW_LEFT_D,
  },
  doubleArrowRight: {
    viewBox: '0 0 6.99654 8',
    width: 6.997,
    height: 8,
    d: DOUBLE_ARROW_LEFT_D,
    flip: 'x',
  },
  calendar: {
    viewBox: '0 0 14 16',
    width: 14,
    height: 16,
    evenOdd: true,
    d: CALENDAR_D,
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
