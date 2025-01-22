---
title: GetFilterMembersSuccess
---

# Interface GetFilterMembersSuccess

## Properties

### data

> **data**: `object`

The result data

#### Type declaration

> ##### `data.allMembers`
>
> **allMembers**: [`Member`](interface.Member.md)[]
>
> ##### `data.enableMultiSelection`
>
> **enableMultiSelection**: `boolean`
>
> ##### `data.excludeMembers`
>
> **excludeMembers**: `boolean`
>
> ##### `data.hasBackgroundFilter`
>
> **hasBackgroundFilter**: `boolean`
>
> ##### `data.selectedMembers`
>
> **selectedMembers**: [`SelectedMember`](interface.SelectedMember.md)[]
>
>

***

### error

> **error**: `undefined`

The error if any occurred

***

### isError

> **isError**: `false`

Whether the data fetching has failed

***

### isLoading

> **isLoading**: `boolean`

Whether the data fetching is loading
