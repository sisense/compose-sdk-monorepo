import {
  type FunctionComponent,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

const GAP = 8;
const ARROW = 8;
const CARET_EXT = Math.round((ARROW / 2) * Math.sqrt(2));
const MAX_W = 400;
const PAD = 8;
const R = 4;
const VP = 8;
const BORDER = 'rgba(38, 46, 61, 0.08)';
const SHADOW = `0 2px 8px rgba(38, 46, 61, 0.12), 0 0 0 1px ${BORDER}`;

function Caret({ dir, centerXPx }: { dir: 'up' | 'down'; centerXPx: number | null }) {
  const half = ARROW / 2;
  const pos =
    centerXPx !== null
      ? { left: centerXPx, marginLeft: 0, transform: 'translateX(-50%) rotate(45deg)' as const }
      : { left: '50%' as const, marginLeft: -half, transform: 'rotate(45deg)' as const };
  const base = {
    position: 'absolute' as const,
    width: ARROW,
    height: ARROW,
    backgroundColor: '#ffffff',
    boxSizing: 'border-box' as const,
    ...pos,
  };
  if (dir === 'up') {
    return (
      <div
        aria-hidden
        style={{
          ...base,
          bottom: '100%',
          marginBottom: -half,
          borderLeft: `1px solid ${BORDER}`,
          borderTop: `1px solid ${BORDER}`,
          boxShadow: '-1px -1px 0 0 rgba(38, 46, 61, 0.04)',
        }}
      />
    );
  }
  return (
    <div
      aria-hidden
      style={{
        ...base,
        top: '100%',
        marginTop: -half,
        borderRight: `1px solid ${BORDER}`,
        borderBottom: `1px solid ${BORDER}`,
        boxShadow: '1px 1px 0 0 rgba(38, 46, 61, 0.04)',
      }}
    />
  );
}

export interface QueryPillBubbleTooltipProps {
  children: ReactNode;
  content: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** false = prefer above pill (default); true = prefer below (>3 lines of JSON). */
  preferBelow?: boolean;
  /** Tooltip stays inside this box (e.g. widget / story panel); intersects with viewport. */
  boundaryElement?: HTMLElement | null;
}

export const QueryPillBubbleTooltip: FunctionComponent<QueryPillBubbleTooltipProps> = ({
  children,
  content,
  open,
  onOpenChange,
  preferBelow = false,
  boundaryElement,
}) => {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const boundaryRef = useRef(boundaryElement);
  boundaryRef.current = boundaryElement ?? null;
  const closeT = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [pos, setPos] = useState<{ left: number; top: number; below: boolean } | null>(null);
  const [caretX, setCaretX] = useState<number | null>(null);

  const clearT = () => {
    if (closeT.current) {
      clearTimeout(closeT.current);
      closeT.current = undefined;
    }
  };

  const layout = useCallback(() => {
    const t = triggerRef.current;
    const w = wrapRef.current;
    if (!t || !w) {
      return;
    }
    const r = t.getBoundingClientRect();
    const { width: bw, height: bh } = w.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const B = boundaryRef.current?.getBoundingClientRect();
    const bl = B ? Math.max(VP, B.left) : VP;
    const br = B ? Math.min(vw - VP, B.right) : vw - VP;
    const bt = B ? Math.max(VP, B.top) : VP;
    const bb = B ? Math.min(vh - VP, B.bottom) : vh - VP;

    const half = Math.min(bw / 2, MAX_W / 2);
    const left = Math.max(bl + half, Math.min(br - half, cx));

    const block = GAP + CARET_EXT + bh;
    const canPlaceAbove = r.top - bt >= block;
    const canPlaceBelow = bb - r.bottom >= block;
    const noFreeVerticalSpace = !canPlaceAbove && !canPlaceBelow;
    const below =
      canPlaceAbove && canPlaceBelow
        ? preferBelow
        : canPlaceBelow
        ? true
        : canPlaceAbove
        ? false
        : preferBelow;
    const unclampedTop = below ? r.bottom + GAP + CARET_EXT : r.top - GAP - CARET_EXT - bh;
    const top = noFreeVerticalSpace ? unclampedTop : Math.max(bt, Math.min(bb - bh, unclampedTop));

    setPos({ left, top, below });
    setCaretX(cx - left + bw / 2);
  }, [preferBelow]);

  useLayoutEffect(() => {
    if (!open) {
      setPos(null);
      setCaretX(null);
      return;
    }
    layout();
    const w = wrapRef.current;
    let roW: ResizeObserver | undefined;
    if (w) {
      roW = new ResizeObserver(layout);
      roW.observe(w);
    }
    const b = boundaryRef.current;
    let roB: ResizeObserver | undefined;
    if (b) {
      roB = new ResizeObserver(layout);
      roB.observe(b);
    }
    return () => {
      roW?.disconnect();
      roB?.disconnect();
    };
  }, [open, content, layout, boundaryElement]);

  useEffect(() => {
    if (!open) {
      return;
    }
    const fn = () => layout();
    window.addEventListener('scroll', fn, true);
    window.addEventListener('resize', fn);
    const b = boundaryRef.current;
    b?.addEventListener('scroll', fn, true);
    return () => {
      window.removeEventListener('scroll', fn, true);
      window.removeEventListener('resize', fn);
      b?.removeEventListener('scroll', fn, true);
    };
  }, [open, layout, boundaryElement]);

  useEffect(
    () => () => {
      clearT();
    },
    [],
  );

  const p = pos;
  const below = p?.below ?? false;

  const portal =
    open && typeof document !== 'undefined'
      ? createPortal(
          <div
            ref={wrapRef}
            role="tooltip"
            onMouseEnter={clearT}
            onMouseLeave={() => onOpenChange(false)}
            style={{
              position: 'fixed',
              left: p?.left ?? -9999,
              top: p?.top ?? 0,
              transform: 'translateX(-50%)',
              zIndex: 2147483647,
              maxWidth: MAX_W,
              pointerEvents: 'auto',
            }}
          >
            <div style={{ position: 'relative' }}>
              {below && <Caret dir="up" centerXPx={caretX} />}
              <div
                style={{
                  backgroundColor: '#fff',
                  color: '#262e3d',
                  borderRadius: R,
                  padding: PAD,
                  boxShadow: SHADOW,
                }}
              >
                {content}
              </div>
              {!below && <Caret dir="down" centerXPx={caretX} />}
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        className="csdk-inline-flex csdk-max-w-full"
        onMouseEnter={() => {
          clearT();
          onOpenChange(true);
        }}
        onMouseLeave={() => {
          closeT.current = setTimeout(() => onOpenChange(false), 120);
        }}
        onFocus={() => {
          clearT();
          onOpenChange(true);
        }}
        onBlur={() => {
          closeT.current = setTimeout(() => onOpenChange(false), 120);
        }}
      >
        {children}
      </span>
      {portal}
    </>
  );
};
