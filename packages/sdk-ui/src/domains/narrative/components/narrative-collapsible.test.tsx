import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { setup } from '@/__test-helpers__';

import { NarrativeCollapsible } from './narrative-collapsible.js';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Stub scrollHeight on every HTMLElement so layout effects see overflow. */
const stubScrollHeight = (px: number) =>
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => px,
  });

/** Restore scrollHeight to the default 0 used by JSDOM. */
const resetScrollHeight = () =>
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', {
    configurable: true,
    get: () => 0,
  });

/**
 * The outer styled div sits at root.firstElementChild.
 * root = div.csdk-min-w-0 (container.firstElementChild)
 * outer = the div that receives outerStyle (root.firstElementChild)
 */
const getOuterDiv = (container: HTMLElement) =>
  (container.firstElementChild as HTMLElement).firstElementChild as HTMLElement;

// measureLineHeight appends a probe span and divides getBoundingClientRect().height by 2.
// JSDOM returns 0 for all layout measurements, so we mock a non-zero height here.
const PROBE_HEIGHT = 36;
/** Measured line height used in collapsed-height calculations: PROBE_HEIGHT / 2. */
const LINE_HEIGHT = PROBE_HEIGHT / 2; // 18

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('NarrativeCollapsible', () => {
  beforeEach(() => {
    vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockReturnValue({
      height: PROBE_HEIGHT,
      width: 0,
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    } as DOMRect);
    vi.mocked(ResizeObserver).mockClear();
  });

  afterEach(() => {
    resetScrollHeight();
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Basic rendering
  // -------------------------------------------------------------------------

  describe('short text (no overflow)', () => {
    it('renders text', () => {
      setup(<NarrativeCollapsible text="short" />);
      expect(screen.getByText('short')).toBeInTheDocument();
    });

    it('does not show show-more or show-less buttons', () => {
      setup(<NarrativeCollapsible text="short" />);
      expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Show less' })).not.toBeInTheDocument();
    });
  });

  // -------------------------------------------------------------------------
  // Collapse / expand (no external constraint)
  // -------------------------------------------------------------------------

  describe('long text without external constraint', () => {
    beforeEach(() => stubScrollHeight(200));

    it('shows show-more button when text overflows collapsed height', () => {
      setup(<NarrativeCollapsible text="long text" />);
      expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    });

    it('does not show show-less button initially', () => {
      setup(<NarrativeCollapsible text="long text" />);
      expect(screen.queryByRole('button', { name: 'Show less' })).not.toBeInTheDocument();
    });

    it('hides show-more and shows show-less after clicking show-more', async () => {
      const { user } = setup(<NarrativeCollapsible text="long text" />);
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument();
    });

    it('returns to collapsed state after clicking show-less', async () => {
      const { user } = setup(<NarrativeCollapsible text="long text" />);
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      await user.click(screen.getByRole('button', { name: 'Show less' }));
      expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Show less' })).not.toBeInTheDocument();
    });

    it('fires onCollapsedChange(false) when show-more is clicked', async () => {
      const onCollapsedChange = vi.fn();
      const { user } = setup(
        <NarrativeCollapsible text="long text" onCollapsedChange={onCollapsedChange} />,
      );
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      expect(onCollapsedChange).toHaveBeenCalledWith(false);
    });

    it('fires onCollapsedChange(true) when show-less is clicked', async () => {
      const onCollapsedChange = vi.fn();
      const { user } = setup(
        <NarrativeCollapsible text="long text" onCollapsedChange={onCollapsedChange} />,
      );
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      await user.click(screen.getByRole('button', { name: 'Show less' }));
      expect(onCollapsedChange).toHaveBeenLastCalledWith(true);
    });

    it('outer div has no height constraint after expanding', async () => {
      const { container, user } = setup(<NarrativeCollapsible text="long text" />);
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      const outer = getOuterDiv(container);
      expect(outer.style.height).toBe('');
      expect(outer.style.maxHeight).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // noCollapse
  // -------------------------------------------------------------------------

  describe('noCollapse = true', () => {
    beforeEach(() => stubScrollHeight(200));

    it('renders text without any buttons', () => {
      setup(<NarrativeCollapsible text="long text" noCollapse />);
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });

    it('does not apply height constraints', () => {
      const { container } = setup(<NarrativeCollapsible text="long text" noCollapse />);
      const root = container.firstElementChild as HTMLElement;
      const outer = getOuterDiv(container);
      expect(root.style.maxHeight).toBe('');
      expect(outer.style.height).toBe('');
      expect(outer.style.maxHeight).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // constrainedHeightPx — reserved collapsed height with expand / collapse
  // -------------------------------------------------------------------------

  describe('constrainedHeightPx — reserved collapsed height', () => {
    beforeEach(() => stubScrollHeight(200));

    it('shows show-more button when text overflows constrainedHeightPx', () => {
      // scrollHeight (200) > row-aligned floor(100/18)*18 = 90
      setup(<NarrativeCollapsible text="long text" constrainedHeightPx={100} />);
      expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    });

    it('does not show show-more when text fits within constrainedHeightPx', () => {
      resetScrollHeight(); // scrollHeight = 0, which is < 90
      setup(<NarrativeCollapsible text="short" constrainedHeightPx={100} />);
      expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
    });

    it('outer div reserves row-aligned height with overflow:hidden when collapsed', () => {
      // constrainedHeightPx=100, lineHeight=18: floor(100/18)*18 = 5*18 = 90
      const { container } = setup(
        <NarrativeCollapsible text="long text" constrainedHeightPx={100} />,
      );
      const outer = getOuterDiv(container);
      expect(outer.style.height).toBe('90px');
      expect(outer.style.overflow).toBe('hidden');
    });

    it('clamps to at least one line when constrainedHeightPx is smaller than lineHeight', () => {
      // floor(5/18)*18 = 0, but Math.max(0, 18) = 18
      const { container } = setup(
        <NarrativeCollapsible text="long text" constrainedHeightPx={5} />,
      );
      const outer = getOuterDiv(container);
      expect(outer.style.height).toBe(`${LINE_HEIGHT}px`);
    });

    it('expand/collapse still works with constrainedHeightPx', async () => {
      const { user } = setup(<NarrativeCollapsible text="long text" constrainedHeightPx={100} />);
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      expect(screen.queryByRole('button', { name: 'Show more' })).not.toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument();
      await user.click(screen.getByRole('button', { name: 'Show less' }));
      expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    });

    it('applies maxConstrainedHeightPx with overflow:auto when expanded', async () => {
      const { container, user } = setup(
        <NarrativeCollapsible
          text="long text"
          constrainedHeightPx={100}
          maxConstrainedHeightPx={200}
        />,
      );
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      const outer = getOuterDiv(container);
      expect(outer.style.maxHeight).toBe('200px');
      expect(outer.style.overflow).toBe('auto');
    });

    it('has no height constraint when expanded without maxConstrainedHeightPx', async () => {
      const { container, user } = setup(
        <NarrativeCollapsible text="long text" constrainedHeightPx={100} />,
      );
      await user.click(screen.getByRole('button', { name: 'Show more' }));
      const outer = getOuterDiv(container);
      expect(outer.style.height).toBe('');
      expect(outer.style.maxHeight).toBe('');
    });
  });

  // -------------------------------------------------------------------------
  // Keyboard navigation
  // -------------------------------------------------------------------------

  describe('keyboard navigation', () => {
    beforeEach(() => stubScrollHeight(200));

    it('expands on Enter key press', async () => {
      const { user } = setup(<NarrativeCollapsible text="long text" />);
      const button = screen.getByRole('button', { name: 'Show more' });
      button.focus();
      await user.keyboard('{Enter}');
      expect(screen.getByRole('button', { name: 'Show less' })).toBeInTheDocument();
    });

    it('collapses on Space key press', async () => {
      const { user } = setup(<NarrativeCollapsible text="long text" />);
      const showMore = screen.getByRole('button', { name: 'Show more' });
      showMore.focus();
      await user.keyboard(' ');
      const showLess = screen.getByRole('button', { name: 'Show less' });
      showLess.focus();
      await user.keyboard(' ');
      expect(screen.getByRole('button', { name: 'Show more' })).toBeInTheDocument();
    });
  });
});
