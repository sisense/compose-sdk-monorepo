import { expect, test } from './mocked-api-test';
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';
import { ChatContext } from '@sisense/sdk-ui/dist/ai/api/types';

test.describe('React Chatbot', () => {
  test('renders the header and data topic screen', async ({ mount, page }) => {
    await page.route('**/api/datasources?*', async (route) => {
      const models: ChatContext[] = [
        { title: 'Data Model 1', live: false },
        { title: 'Data Model 2', live: false },
      ];
      await route.fulfill({ json: models });
    });

    const component = await mount(
      <SisenseContextProvider url="http://fake-url" token="fake-token">
        <AiContextProvider>
          <Chatbot />
        </AiContextProvider>
      </SisenseContextProvider>,
    );

    await expect(component).toContainText('Analytics ChatbotBeta');
    await expect(component).toContainText('Data Topics');

    await expect(component).toContainText('Data Model 1');
    await expect(component).toContainText('Data Model 2');
  });
});
