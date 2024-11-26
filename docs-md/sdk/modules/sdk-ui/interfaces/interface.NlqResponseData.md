---
title: NlqResponseData
---

# Interface NlqResponseData

## Properties

### chartRecommendations

> **chartRecommendations**: [`ChartRecommendations`](interface.ChartRecommendations.md) \| \{}

***

### detailedDescription

> **detailedDescription**: `string`

***

### followupQuestions

> **followupQuestions**: `string`[]

***

### jaql

> **jaql**: `object`

#### Type declaration

> ##### `jaql.datasource`
>
> **datasource**: `object`
>
> > ###### `datasource.id`
> >
> > **id**?: `string`
> >
> > ###### `datasource.title`
> >
> > **title**: `string`
> >
> > ###### `datasource.type`
> >
> > **type**?: `"elasticube"` \| `"live"`
> >
> >
>
> ##### `jaql.metadata`
>
> **metadata**: `MetadataItem`[]
>
>

***

### nlqPrompt

> **nlqPrompt**: `string`

***

### queryTitle

> **queryTitle**: `string`
