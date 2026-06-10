import React from 'react';

import type { DesignPanelProps } from '@sisense/sdk-ui';

import type { StyleOptions } from '../types.js';

// Render style controls for dashboard editors.
// Read styleOptions and call onChange({ ...styleOptions, key: newValue }) to update.
// Always spread styleOptions to preserve properties you are not changing.
// See /add-style-prop for step-by-step examples.
export const DesignPanel: React.FC<DesignPanelProps<StyleOptions>> = () => {
  return <div>Design panels go here</div>;
};
