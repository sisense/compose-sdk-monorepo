import React from 'react';

import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { DesignPanel } from './DesignPanel';

describe('DesignPanel', () => {
  it('renders without crashing', () => {
    const C = DesignPanel as React.ComponentType;
    render(<C />);
  });
});
