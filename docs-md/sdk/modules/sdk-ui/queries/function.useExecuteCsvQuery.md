---
title: useExecuteCsvQuery
---

# Function useExecuteCsvQuery

> **useExecuteCsvQuery**(...`args`): [`CsvQueryState`](../type-aliases/type-alias.CsvQueryState.md)

React hook that executes a CSV data query.
Similar to [useExecuteQuery](function.useExecuteQuery.md), but returns the data in CSV format as text or as a stream.

## Parameters

| Parameter | Type |
| :------ | :------ |
| ...`args` | [[`ExecuteCsvQueryParams`](../interfaces/interface.ExecuteCsvQueryParams.md)] |

## Returns

[`CsvQueryState`](../type-aliases/type-alias.CsvQueryState.md)

Query state that contains the status of the query execution, the result data, or the error if any occurred

## Example

An example of using the hook to obtain data in a CSV string:
```ts
const { data, isLoading, isError } = useExecuteCsvQuery({
  dataSource: DM.DataSource,
  dimensions: [DM.Commerce.AgeRange],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
  filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
});
if (isLoading) {
  return <div>Loading...</div>;
}
if (isError) {
  return <div>Error</div>;
}
if (data) {
  return <div>{`CSV as string: ${data}`}</div>;
}
return null;
```
An example of using the hook to obtain data in CSV format as a stream, translating headers, and triggering file download:
```ts
const { data, isLoading, isError } = useExecuteCsvQuery({
  dataSource: DM.DataSource,
  dimensions: [DM.Commerce.AgeRange],
  measures: [measureFactory.sum(DM.Commerce.Revenue)],
  filters: [filterFactory.greaterThan(DM.Commerce.Revenue, 1000)],
  config: { asDataStream: true },
});
if (isLoading) {
  return <div>Loading...</div>;
}
if (isError) {
  return <div>Error</div>;
}
if (data) {
  const reader = new FileReader();
  reader.onload = () => {
    if (reader.result) {
      const text = reader.result as string;
      const lines = text.split('\n');
      // Update headers
      if (lines.length > 0) {
        lines[0] = translateHeaders(lines[0]); // replace with own implementation
      }
      // Join modified lines back to a text
      const modifiedCsv = lines.join('\n');
      // Create a new Blob with modified content
      const modifiedBlob = new Blob([modifiedCsv], { type: 'text/csv' });
      // Trigger file download
      const blobURL = window.URL.createObjectURL(modifiedBlob);
      const a = document.createElement('a');
      a.href = blobURL;
      const fileName = 'data_translated_headers'
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(blobURL);
      document.body.removeChild(a);
    }
  };
  reader.readAsText(data as Blob);
}
return null;
```
