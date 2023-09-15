import { ClientApplication } from '../app/client-application';
import { WidgetDto } from './types';
import { translation } from '../locales/en';

/**
 * Fetch a dashboard widget from the default Sisense instance using POC
 * authentication code.
 *
 * @param widgetOid - Widget identifier in Sisense instance
 * @param dashboardOid - Dashboard identifier in Sisense instance
 * @param app - Client application
 */
export async function fetchWidget(
  widgetOid: string,
  dashboardOid: string,
  app: ClientApplication,
): Promise<WidgetDto> {
  // when error is encountered, API returns only status code 422 without informative error message
  // to remedy, catch error and throw a more informative error message
  try {
    return await app.httpClient.get(`api/v1/dashboards/${dashboardOid}/widgets/${widgetOid}`);
  } catch (error) {
    throw new Error(translation.errors.dashboardWidgetInvalidIdentifiers);
  }
}
