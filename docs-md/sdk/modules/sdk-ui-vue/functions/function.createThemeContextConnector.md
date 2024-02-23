---
title: createThemeContextConnector
---

# Function createThemeContextConnector

> **createThemeContextConnector**(`themeSettings` = `...`): `object`

Creates theme context connector

## Parameters

| Parameter | Type | Description |
| :------ | :------ | :------ |
| `themeSettings` | `object` | - |
| `themeSettings.chart` | `{ textColor: string; secondaryTextColor: string; backgroundColor: string; panelBackgroundColor: string; }` | Chart theme settings |
| `themeSettings.general` | `{ brandColor: string; backgroundColor: string; primaryButtonTextColor: string; primaryButtonHoverColor: string; }` | General theme settings |
| `themeSettings.palette` | `{ variantColors: Color[]; }` | Collection of colors used to color various elements |
| `themeSettings.typography` | `{ fontFamily: string; primaryTextColor: string; secondaryTextColor: string; }` | Text theme settings |

## Returns

### `prepareContext`

**prepareContext**

### `renderContextProvider`

**renderContextProvider**: `object`
