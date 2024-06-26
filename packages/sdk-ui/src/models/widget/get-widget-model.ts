import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api';
import { fetchWidgetDtoModel } from '../../dashboard-widget/use-fetch-widget-dto-model';
import { WidgetModel } from './widget-model';
import { CompleteThemeSettings } from '../../types';

/** @internal */
export async function getWidgetModel(
  httpClient: HttpClient,
  dashboardOid: string,
  widgetOid: string,
  themeSettings?: CompleteThemeSettings,
): Promise<WidgetModel> {
  const api = new RestApi(httpClient);
  const { widget: fetchedWidget } = await fetchWidgetDtoModel({
    widgetOid,
    dashboardOid,
    api,
  });
  return new WidgetModel(fetchedWidget, themeSettings);
}
