/** @vitest-environment jsdom */
import { I18nextProvider } from 'react-i18next';

import { screen } from '@testing-library/react';

import { setup } from '@/__test-helpers__';
import { i18nextInstance } from '@/infra/translation/initialize-i18n.js';

import WidgetHeaderInfoButton from './widget-header-info-button.js';

const minTouchTargetStyle = { minWidth: '24px', minHeight: '24px' };

describe('WidgetHeaderInfoButton', () => {
  describe('A11Y-03 minimum touch target size', () => {
    it('applies 24×24 min dimensions to info and refresh IconButtons', async () => {
      const { user } = setup(
        <I18nextProvider i18n={i18nextInstance}>
          <WidgetHeaderInfoButton onRefresh={vi.fn()} />
        </I18nextProvider>,
      );

      const infoButton = screen.getByTestId('widget-header-info-icon-button');
      expect(infoButton).toHaveStyle(minTouchTargetStyle);

      await user.click(infoButton);

      const refreshButton = await screen.findByTestId('widget-header-refresh-icon-button');
      expect(refreshButton).toHaveStyle(minTouchTargetStyle);
    });
  });
});
