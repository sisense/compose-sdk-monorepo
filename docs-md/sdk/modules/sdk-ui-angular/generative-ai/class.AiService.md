---
title: AiService
---

# Class AiService

Service for working with Sisense Fusion Generative AI.

## Constructors

### constructor

> **new AiService**(`sisenseContextService`, `aiContextConfig`?): [`AiService`](class.AiService.md)

#### Parameters

| Parameter | Type |
| :------ | :------ |
| `sisenseContextService` | [`SisenseContextService`](../contexts/class.SisenseContextService.md) |
| `aiContextConfig`? | [`AiContextConfig`](../interfaces/interface.AiContextConfig.md) |

#### Returns

[`AiService`](class.AiService.md)

## Methods

### getNlgInsights

> **getNlgInsights**(`params`): `Promise`\< `string` \| `undefined` \>

Fetches an analysis of the provided query using natural language generation (NLG).
Specifying NLG parameters is similar to providing parameters to the [QueryService.executeQuery](../queries/class.QueryService.md#executequery) service method, using dimensions, measures, and filters.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetNlgInsightsParams`](../interfaces/interface.GetNlgInsightsParams.md) | Parameters for getting NLG insights |

#### Returns

`Promise`\< `string` \| `undefined` \>

NLG insights text summary

***

### getNlqResult <Badge type="beta" text="Beta" />

> **getNlqResult**(`params`): `Promise`\< [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `undefined` \>

Executes a natural language query (NLQ) against a data model or perspective

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetNlqResultParams`](../interfaces/interface.GetNlqResultParams.md) | NLQ query parameters |

#### Returns

`Promise`\< [`WidgetProps`](../type-aliases/type-alias.WidgetProps.md) \| `undefined` \>

The result as WidgetProps

***

### getQueryRecommendations <Badge type="beta" text="Beta" />

> **getQueryRecommendations**(`params`): `Promise`\< [`QueryRecommendation`](../interfaces/interface.QueryRecommendation.md)[] \>

Fetches recommended questions for a data model or perspective.

#### Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `params` | [`GetQueryRecommendationsParams`](../interfaces/interface.GetQueryRecommendationsParams.md) | Parameters for recommendations |

#### Returns

`Promise`\< [`QueryRecommendation`](../interfaces/interface.QueryRecommendation.md)[] \>

An array of objects, each containing recommended question text and its corresponding `widgetProps`
