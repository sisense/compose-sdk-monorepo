import { expect, test } from './mocked-api-test';
import { SisenseContextProvider } from '@sisense/sdk-ui';
import { AiContextProvider, Chatbot } from '@sisense/sdk-ui/ai';
import { DataModel, Perspective } from '@sisense/sdk-ui/dist/ai/api/types';

test.describe('React Chatbot', () => {
  test('renders the header and data topic screen', async ({ mount, page }) => {
    await page.route('**/api/v2/datamodels/schema?*', async (route) => {
      const models: DataModel[] = [
        { oid: '1', title: 'Data Model 1' },
        { oid: '2', title: 'Data Model 2' },
      ];
      await route.fulfill({ json: models });
    });

    await page.route('**/api/v2/perspectives?*', async (route) => {
      const perspectives: Partial<Perspective>[] = [
        { oid: '1', name: 'Perspective 1', description: 'My first perspective', isDefault: false },
        { oid: '2', name: 'Perspective 2', description: 'My second perspective', isDefault: false },
        { oid: '3', name: 'Perspective 3', description: 'My third perspective', isDefault: true }, // should not be shown
      ];
      await route.fulfill({ json: perspectives });
    });

    const component = await mount(
      <SisenseContextProvider url="http://fake-url" token="fake-token">
        <AiContextProvider>
          <Chatbot />
        </AiContextProvider>
      </SisenseContextProvider>,
    );

    await expect(component).toContainText('Analytics Chatbot');
    await expect(component).toContainText('Data Topics');

    await expect(component).toContainText('Data Model 1');
    await expect(component).toContainText('Data Model 2');

    await expect(component).toContainText('Perspective 1');
    await expect(component).toContainText('Perspective 2');
    await expect(component).not.toContainText('Perspective 3');
  });
});
