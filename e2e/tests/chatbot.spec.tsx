import { expect, test } from '@playwright/experimental-ct-react';
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { ChatApiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';

test.describe('React Chatbot', () => {
  test('renders the header and data topic screen', async ({ mount }) => {
    const { E2E_SISENSE_URL, E2E_SISENSE_TOKEN } = process.env;

    const component = await mount(
      <SisenseContextProvider url={E2E_SISENSE_URL} token={E2E_SISENSE_TOKEN}>
        <ChatApiContextProvider>
          <Chatbot />
        </ChatApiContextProvider>
      </SisenseContextProvider>,
    );

    await expect(component).toContainText('Analytics Chatbot');
    await expect(component).toContainText('Data Topics');
  });
});
