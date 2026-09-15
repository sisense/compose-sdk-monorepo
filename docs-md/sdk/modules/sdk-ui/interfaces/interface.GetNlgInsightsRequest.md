---
title: GetNlgInsightsRequest
---

# Interface GetNlgInsightsRequest

## Properties

### aiContext

> **aiContext**?: `string`

Free-text guidance for the narrative summary — context the model can't infer from the data
alone, e.g. `"amounts are in USD"` or `"ignore the March spike, known data issue"`.

***

### jaql

> **jaql**: `Partial`\< `JaqlQueryPayload` \> & `Pick`\< `JaqlQueryPayload`, `"datasource"` \| `"metadata"` \>

***

### verbosity

> **verbosity**?: `"High"` \| `"Low"`
