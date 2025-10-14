import { HttpClient } from '@sisense/sdk-rest-client';

import { AppSettings } from '@/app/settings/settings';
import { widgetModelTranslator } from '@/models/widget/';
import { TranslatableError } from '@/translation/translatable-error';

import { RestApi } from '../../api/rest-api';
import { CompleteThemeSettings } from '../../types';
import { fetchWidgetDtoModel } from '../../widget-by-id/use-fetch-widget-dto-model';
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
    throw new TranslatableError('errors.widgetWithOidNotFound', { widgetOid });
  }
  return widgetModelTranslator.fromWidgetDto(fetchedWidget, themeSettings, appSettings);
}
