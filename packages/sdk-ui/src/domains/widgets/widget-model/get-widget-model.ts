import { HttpClient } from '@sisense/sdk-rest-client';

import { fetchWidgetDtoModel } from '@/domains/widgets/components/widget-by-id/use-fetch-widget-dto-model';
import { widgetModelTranslator } from '@/domains/widgets/widget-model';
import { RestApi } from '@/infra/api/rest-api';
import { AppSettings } from '@/infra/app/settings/settings';
import { TranslatableError } from '@/infra/translation/translatable-error';
import { CompleteThemeSettings } from '@/types';

import { WidgetModel } from './widget-model';

/**
 * Retrieves a widget model by its OID.
 *
 * @param httpClient - The HTTP client
 * @param dashboardOid - The OID of the dashboard
 * @param widgetOid - The OID of the widget
 * @param themeSettings - Optional theme settings
 * @param appSettings - Optional application settings
 * @returns The widget model
 * @internal
 */
export async function getWidgetModel(
  httpClient: HttpClient,
  dashboardOid: string,
  widgetOid: string,
  themeSettings?: CompleteThemeSettings,
  appSettings?: AppSettings,
): Promise<WidgetModel> {
  const api = new RestApi(httpClient);
  const { widget: fetchedWidget } = await fetchWidgetDtoModel({
    widgetOid,
    dashboardOid,
    api,
  });
  if (!fetchedWidget) {
    throw new TranslatableError('errors.widgetByIdInvalidIdentifier', { widgetOid, dashboardOid });
  }
  return widgetModelTranslator.fromWidgetDto(fetchedWidget, themeSettings, appSettings);
}
