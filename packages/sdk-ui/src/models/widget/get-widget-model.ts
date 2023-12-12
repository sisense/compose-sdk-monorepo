import { HttpClient } from '@sisense/sdk-rest-client';
import { RestApi } from '../../api/rest-api';
import { fetchWidgetDtoModel } from '../../dashboard-widget/use-fetch-widget-dto-model';
import { WidgetModel } from './widget-model';

/** @internal */
export async function getWidgetModel(
  httpClient: HttpClient,
  dashboardOid: string,
  widgetOid: string,
): Promise<WidgetModel> {
  const api = new RestApi(httpClient);
  const { widget: fetchedWidget } = await fetchWidgetDtoModel({
    widgetOid,
    dashboardOid,
    api,
  });
  return new WidgetModel(fetchedWidget);
}
