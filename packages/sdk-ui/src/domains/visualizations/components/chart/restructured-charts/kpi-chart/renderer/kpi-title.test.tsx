/** @vitest-environment jsdom */
import { render } from '@testing-library/react';

import { KPI_TITLE_TEXT_STYLE_DEFAULTS } from '../design-options/design-options.js';
import { KpiTitle } from './kpi-title.js';

describe('KpiTitle', () => {
  it('renders the default title as semibold uppercase with the uppercase letter-spacing', () => {
    const { getByText } = render(
      <KpiTitle
        title="Revenue"
        showText={true}
        onColor={false}
        align="space-between"
        textStyle={KPI_TITLE_TEXT_STYLE_DEFAULTS}
      />,
    );
    expect(getByText('Revenue')).toHaveStyle({
      'font-weight': '600',
      'font-style': 'normal',
      'text-transform': 'uppercase',
      'letter-spacing': '0.06em',
    });
  });

  it('applies an overridden weight, style, family and transform, dropping the letter-spacing when not uppercase', () => {
    const { getByText } = render(
      <KpiTitle
        title="Revenue"
        showText={true}
        onColor={false}
        align="left"
        textStyle={{
          fontFamily: 'Georgia',
          fontWeight: '400',
          fontStyle: 'italic',
          textTransform: 'none',
        }}
      />,
    );
    expect(getByText('Revenue')).toHaveStyle({
      'font-family': 'Georgia',
      'font-weight': '400',
      'font-style': 'italic',
      'text-transform': 'none',
      'letter-spacing': 'normal',
    });
  });

  it('does not style the category caption with the title text style', () => {
    const { getByText } = render(
      <KpiTitle
        title="Revenue"
        showText={true}
        period="Jun 2026"
        onColor={false}
        align="space-between"
        textStyle={{ fontWeight: '900', fontStyle: 'italic', textTransform: 'lowercase' }}
      />,
    );
    expect(getByText('Jun 2026')).not.toHaveStyle({ 'font-weight': '900' });
    expect(getByText('Jun 2026')).not.toHaveStyle({ 'text-transform': 'lowercase' });
  });
});
