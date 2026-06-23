/** @vitest-environment jsdom */
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { MockedSisenseContextProvider } from '../../../../__test-helpers__/index.js';
import { CriteriaFilterDisplay } from './criteria-filter-display.js';
import { FilterOption } from './criteria-filter-operations.js';

describe('CriteriaFilterDisplay', () => {
  it('renders top ranking collapsed label with capital By', () => {
    render(
      <MockedSisenseContextProvider>
        <CriteriaFilterDisplay
          filterType={FilterOption.TOP as never}
          values={[10, '# of unique Category']}
        />
      </MockedSisenseContextProvider>,
    );

    expect(screen.getByText('Top 10 By # of unique Category')).toBeInTheDocument();
  });

  it('renders bottom ranking collapsed label with Bottom prefix', () => {
    render(
      <MockedSisenseContextProvider>
        <CriteriaFilterDisplay
          filterType={FilterOption.BOTTOM as never}
          values={[1, '# of unique Category']}
        />
      </MockedSisenseContextProvider>,
    );

    expect(screen.getByText('Bottom 1 By # of unique Category')).toBeInTheDocument();
  });

  it('prefixes non-ranked filters with display mode prefix', () => {
    render(
      <MockedSisenseContextProvider>
        <CriteriaFilterDisplay filterType={FilterOption.BETWEEN as never} values={[0, 100]} />
      </MockedSisenseContextProvider>,
    );

    expect(screen.getByText('All items between 0 and 100')).toBeInTheDocument();
  });
});
