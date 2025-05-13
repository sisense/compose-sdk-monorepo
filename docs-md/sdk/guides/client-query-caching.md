# Client Query Caching (Alpha)

Compose SDK provides a client-side caching mechanism that enhances chart rendering performance and reduces network requests for data queries.

If the results of an identical query already exist in the client-side cache, those results will be used automatically instead of making the same query request again to the Fusion API.

## Enabling Client Caching

To enable client-side caching, set the `AppConfig.queryCacheConfig.enabled` property to `true` in your `SisenseContextProvider`.

```tsx
<SisenseContextProvider
  appConfig={{
    queryCacheConfig: {
      enabled: true,
    },
  }}
>
```

This setting enables the caching mechanism globally for all JAQL queries made through the SDK.
The cache can store up to 250 distinct JAQL queries. Once this limit is reached, the oldest entries are purged to make room for new ones.
You can manually clear the cache by obtaining a `CacheClient` instance and calling its `clear` method, which removes all cached queries:

```tsx
const cacheClient = useQueryCache();
cacheClient.clear();
```

**Note:** While `queryCacheConfig` is supported in all frameworks (React, Angular, Vue), the ability to clear the cache via `code` is currently only supported in React. This current limitation is the reason the feature is currently in `alpha` status.

Refreshing the page in the browser also refreshes the cache (see below).


## Query Caching Clarifications

This client-side caching mechanism is distinct from Sisense Fusion's server-side caching.
- It does not influence how JAQL requests are handled by Fusion
- It does not affect the server side caching within Fusion
- It cannot affect the response times for any JAQL requests sent to Fusion

Instead, it stores the results of JAQL queries in memory for quicker access without repeated server requests from the browser.

- It does not store data permanently. Reloading the page will clear the cache.
- It does not share cache across different browser tabs, or between different users.
- It is designed to improve performance and user experience for data that is accessed frequently or multiple times in the UI.

**Example:** A user frequently switches between tabs or sections of a UI which contain Compose SDK dashboards, widgets or other components that query data. Client-side caching will help avoid reloading the same data over the network each time a dashboard or widget is rendered, providing a more responsive user experience.
