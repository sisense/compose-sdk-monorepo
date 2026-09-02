import type { Meta, StoryObj } from '@storybook/react-vite';

import { FIELD_HEIGHT, FIELD_RADIUS } from '../design-tokens';
import type { FieldRadius, FieldSize } from '../design-tokens';
import { Dropdown } from '../dropdown';
import type { DropdownItem } from '../dropdown';
import { Selector } from '../selector';

/**
 * The filter widget's control set, rendered as a spec sheet.
 *
 * The `state` prop pins a visual state instead of deriving it from the pointer, which is
 * what makes hover and open states reviewable side by side — a screenshot cannot hover.
 * Stories cover the axes that unit tests cannot: the size and corner-radius scales the
 * design panel exposes, and how a trigger reads back a selection too long for its box.
 */
const meta: Meta<typeof Selector> = {
  title: 'Widgets/FilterWidget/Controls',
  component: Selector,
  parameters: { layout: 'padded' },
};
export default meta;

const MEMBERS: DropdownItem[] = [
  { id: 'cardiology', label: 'Cardiology' },
  { id: 'neurology', label: 'Neurology' },
  { id: 'oncology', label: 'Oncology' },
  { id: 'urology', label: 'Urology' },
  { id: 'radiology', label: 'Radiology' },
];

const SIZES: FieldSize[] = ['xs', 's', 'm', 'l', 'xl'];
const RADII: FieldRadius[] = ['none', 'xs', 's', 'm', 'l', 'xl'];

/**
 * Lays a specimen beside the token it demonstrates, so a story reads as a spec sheet.
 * @param props - The token caption and the control to show against it
 * @returns One labelled row
 */
const Row = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 12 }}>
    <code style={{ width: 130, fontSize: 12, color: '#666' }}>{label}</code>
    {children}
  </div>
);

/** Every state the design's `State` axis carries, plus the two it composes with. */
export const States: StoryObj = {
  render: () => (
    <div>
      <Row label="default">
        <Selector value="Cardiology" state="default" />
      </Row>
      <Row label="hover">
        <Selector value="Cardiology" state="hover" />
      </Row>
      <Row label="placeholder">
        <Selector />
      </Row>
      <Row label="disabled">
        <Selector value="Cardiology" disabled />
      </Row>
      <Row label="error">
        <Selector value="Cardiology" error="Pick at least one value" />
      </Row>
      <Row label="with label">
        <Selector label="Department" value="Cardiology" />
      </Row>
    </div>
  ),
};

/**
 * The Size setting. `s` is the default — 28px, the height the widget has shipped at, so
 * this story is the guard against the scale drifting under it.
 */
export const Sizes: StoryObj = {
  render: () => (
    <div>
      {SIZES.map((size) => (
        <Row key={size} label={`${size} · ${FIELD_HEIGHT[size]}`}>
          <Selector size={size} value="Cardiology" />
        </Row>
      ))}
    </div>
  ),
};

/** The Corner Radius setting, independent of size — `xl` reads as a pill. */
export const CornerRadii: StoryObj = {
  render: () => (
    <div>
      {RADII.map((radius) => (
        <Row key={radius} label={`${radius} · ${FIELD_RADIUS[radius]}`}>
          <Selector radius={radius} value="Cardiology" />
        </Row>
      ))}
    </div>
  ),
};

/**
 * What a trigger says when the selection outgrows the box: as many values as fit, then a
 * `+N` in its own slot, so the ellipsis eats the names rather than the count.
 */
export const SelectionReadback: StoryObj = {
  render: () => (
    <div>
      <Row label="one value">
        <Selector value="Cardiology" />
      </Row>
      <Row label="two that fit">
        <Selector value="Cardiology, Neurology" />
      </Row>
      <Row label="more than fit">
        <Selector
          value="Cardiology"
          badge={<span style={{ fontSize: 13, color: '#666' }}>+3</span>}
        />
      </Row>
    </div>
  ),
};

/** The list a trigger opens, in both modes. Rendered on its own — no trigger, no portal. */
export const Lists: StoryObj = {
  render: () => (
    <div style={{ display: 'flex', gap: 32, alignItems: 'flex-start' }}>
      <div>
        <p style={{ fontSize: 12, color: '#666' }}>multi — checkboxes and bulk actions</p>
        <Dropdown mode="multi" items={MEMBERS} selected={['cardiology', 'oncology']} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#666' }}>single — a check on the chosen row</p>
        <Dropdown mode="single" items={MEMBERS} selected={['neurology']} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#666' }}>hint — bare suggestion rows</p>
        <Dropdown mode="hint" surface={false} items={MEMBERS} />
      </div>
      <div>
        <p style={{ fontSize: 12, color: '#666' }}>nothing matched the search</p>
        <Dropdown mode="multi" items={[]} />
      </div>
    </div>
  ),
};
