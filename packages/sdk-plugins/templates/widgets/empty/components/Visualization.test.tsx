import React from 'react';

import { render } from '@testing-library/react';
import { describe, it } from 'vitest';

import { Visualization, VisualizationProps } from './Visualization';

const TestVisualization = Visualization as React.FC<VisualizationProps>;

describe('Visualization', () => {
  it('renders without crashing', () => {
    render(<TestVisualization dataOptions={{ category: [], value: [], breakBy: [] }} />);
  });
});
