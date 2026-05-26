---
title: CompleteThemeSettings
---

# Type alias CompleteThemeSettings

> **CompleteThemeSettings**: `object`

Resolved theme returned by [useTheme](../contexts/function.useTheme.md).

Contains all theme values after defaults are applied. Unlike [ThemeSettings](../interfaces/interface.ThemeSettings.md)
(where every field is optional), every field here is guaranteed to be present.

## Type declaration

### `aiChat`

**aiChat**: `object`

Theme settings specific to the AI Chatbot component

> #### `aiChat.backgroundColor`
>
> **backgroundColor**: `string`
>
> Background color of the chatbot
>
> #### `aiChat.body`
>
> **body**: `object`
>
> Settings for the main chat body
>
> > ##### `body.gapBetweenMessages`
> >
> > **gapBetweenMessages**: `string`
> >
> > ##### `body.paddingBottom`
> >
> > **paddingBottom**: `string`
> >
> > ##### `body.paddingLeft`
> >
> > **paddingLeft**: `string`
> >
> > ##### `body.paddingRight`
> >
> > **paddingRight**: `string`
> >
> > ##### `body.paddingTop`
> >
> > **paddingTop**: `string`
> >
> >
>
> #### `aiChat.border`
>
> **border**: `false` \| `string`
>
> Border of the chatbot
>
> #### `aiChat.borderRadius`
>
> **borderRadius**: `false` \| `string`
>
> Border radius of the chatbot
>
> #### `aiChat.clickableMessages`
>
> **clickableMessages**: `object`
>
> Settings for the chatbot clickable messages
>
> > ##### `clickableMessages.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `clickableMessages.border`
> >
> > **border**: `false` \| `string`
> >
> > ##### `clickableMessages.borderGradient`
> >
> > **borderGradient**: [`string`, `string`] \| `null`
> >
> > ##### `clickableMessages.hover`
> >
> > **hover**: `object`
> >
> > > ###### `hover.backgroundColor`
> > >
> > > **backgroundColor**: `string`
> > >
> > > ###### `hover.textColor`
> > >
> > > **textColor**: `string`
> > >
> > >
> >
> > ##### `clickableMessages.textColor`
> >
> > **textColor**: `string`
> >
> >
>
> #### `aiChat.dataTopics`
>
> **dataTopics**: `object`
>
> Settings for the data topics screen
>
> > ##### `dataTopics.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `dataTopics.items`
> >
> > **items**: `object`
> >
> > > ###### `items.backgroundColor`
> > >
> > > **backgroundColor**: `string`
> > >
> > > ###### `items.textColor`
> > >
> > > **textColor**: `string`
> > >
> > >
> >
> >
>
> #### `aiChat.dropup`
>
> **dropup**: `object`
>
> Settings for chatbot dropup
>
> > ##### `dropup.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `dropup.borderRadius`
> >
> > **borderRadius**: `string`
> >
> > ##### `dropup.boxShadow`
> >
> > **boxShadow**: `string`
> >
> > ##### `dropup.headers`
> >
> > **headers**: `object`
> >
> > > ###### `headers.hover`
> > >
> > > **hover**: `object`
> > >
> > > > ###### `hover.backgroundColor`
> > > >
> > > > **backgroundColor**: `string`
> > > >
> > > >
> > >
> > > ###### `headers.textColor`
> > >
> > > **textColor**: `string`
> > >
> > >
> >
> > ##### `dropup.items`
> >
> > **items**: `object`
> >
> > > ###### `items.hover`
> > >
> > > **hover**: `object`
> > >
> > > > ###### `hover.backgroundColor`
> > > >
> > > > **backgroundColor**: `string`
> > > >
> > > >
> > >
> > > ###### `items.textColor`
> > >
> > > **textColor**: `string`
> > >
> > >
> >
> >
>
> #### `aiChat.footer`
>
> **footer**: `object`
>
> Settings for the chat footer
>
> > ##### `footer.paddingBottom`
> >
> > **paddingBottom**: `string`
> >
> > ##### `footer.paddingLeft`
> >
> > **paddingLeft**: `string`
> >
> > ##### `footer.paddingRight`
> >
> > **paddingRight**: `string`
> >
> > ##### `footer.paddingTop`
> >
> > **paddingTop**: `string`
> >
> >
>
> #### `aiChat.header`
>
> **header**: `object`
>
> Settings for the chatbot header
>
> > ##### `header.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `header.textColor`
> >
> > **textColor**: `string`
> >
> >
>
> #### `aiChat.icons`
>
> **icons**: `object`
>
> Settings for the chatbot icons
>
> > ##### `icons.color`
> >
> > **color**: `string`
> >
> > ##### `icons.feedbackIcons`
> >
> > **feedbackIcons**: `object`
> >
> > > ###### `feedbackIcons.hoverColor`
> > >
> > > **hoverColor**: `string`
> > >
> > >
> >
> >
>
> #### `aiChat.input`
>
> **input**: `object`
>
> Settings for the chatbot input
>
> > ##### `input.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `input.focus`
> >
> > **focus**: `object`
> >
> > > ###### `focus.outlineColor`
> > >
> > > **outlineColor**: `string`
> > >
> > >
> >
> >
>
> #### `aiChat.primaryFontSize`
>
> **primaryFontSize**: [`string`, `string`]
>
> Primary font size for text in the chatbot
>
> #### `aiChat.primaryTextColor`
>
> **primaryTextColor**: `string`
>
> Text color of the chatbot
>
> #### `aiChat.secondaryTextColor`
>
> **secondaryTextColor**: `string`
>
> Secondary text color of the chatbot
>
> #### `aiChat.suggestions`
>
> **suggestions**: `object`
>
> Settings for the chatbot suggestions
>
> > ##### `suggestions.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `suggestions.border`
> >
> > **border**: `string`
> >
> > ##### `suggestions.borderGradient`
> >
> > **borderGradient**: [`string`, `string`] \| `null`
> >
> > ##### `suggestions.borderRadius`
> >
> > **borderRadius**: `string`
> >
> > ##### `suggestions.gap`
> >
> > **gap**: `string`
> >
> > ##### `suggestions.hover`
> >
> > **hover**: `object`
> >
> > > ###### `hover.backgroundColor`
> > >
> > > **backgroundColor**: `string`
> > >
> > > ###### `hover.textColor`
> > >
> > > **textColor**: `string`
> > >
> > >
> >
> > ##### `suggestions.loadingGradient`
> >
> > **loadingGradient**: [`string`, `string`]
> >
> > ##### `suggestions.textColor`
> >
> > **textColor**: `string`
> >
> >
>
> #### `aiChat.systemMessages`
>
> **systemMessages**: `object`
>
> Settings for system chat messages
>
> > ##### `systemMessages.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> >
>
> #### `aiChat.tooltips`
>
> **tooltips**: `object`
>
> Settings for the chatbot tooltips
>
> > ##### `tooltips.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > ##### `tooltips.boxShadow`
> >
> > **boxShadow**: `string`
> >
> > ##### `tooltips.textColor`
> >
> > **textColor**: `string`
> >
> >
>
> #### `aiChat.userMessages`
>
> **userMessages**: `object`
>
> Settings for user chat messages
>
> > ##### `userMessages.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> >
>
>

***

### `chart`

**chart**: `object`

Chart theme settings

> #### `chart.animation`
>
> **animation**: `object`
>
> Animation options
>
> > ##### `animation.init`
> >
> > **init**: `object`
> >
> > Chart initialization animation options
> >
> > > ###### `init.duration`
> > >
> > > **duration**: `"auto"` \| `number`
> > >
> > > Animation duration in milliseconds
> > >
> > >
> >
> > ##### `animation.redraw`
> >
> > **redraw**: `object`
> >
> > Chart redraw animation options
> >
> > > ###### `redraw.duration`
> > >
> > > **duration**: `"auto"` \| `number`
> > >
> > > Animation duration in milliseconds
> > >
> > >
> >
> >
>
> #### `chart.backgroundColor`
>
> **backgroundColor**: `string`
>
> Background color
>
> #### `chart.secondaryTextColor`
>
> **secondaryTextColor**: `string`
>
> Secondary text color
>
> #### `chart.textColor`
>
> **textColor**: `string`
>
> Text color
>
>

***

### `filter`

**filter**: `object`

Filter theme settings

> #### `filter.panel`
>
> **panel**: `object`
>
> > ##### `panel.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > Background color
> >
> > ##### `panel.dividerLineColor`
> >
> > **dividerLineColor**: `string`
> >
> > Divider line color for the filter panel
> >
> > ##### `panel.dividerLineWidth`
> >
> > **dividerLineWidth**: `number`
> >
> > Divider line width for the filter panel
> >
> > ##### `panel.titleColor`
> >
> > **titleColor**: `string`
> >
> > Title color
> >
> >
>
>

***

### `general`

**general**: `object`

General theme settings

> #### `general.backgroundColor`
>
> **backgroundColor**: `string`
>
> Background color used for elements like tiles, etc.
>
> #### `general.brandColor`
>
> **brandColor**: `string`
>
> Main color used for various elements like primary buttons, switches, etc.
>
> #### `general.primaryButtonHoverColor`
>
> **primaryButtonHoverColor**: `string`
>
> Hover color for primary buttons
>
> #### `general.primaryButtonTextColor`
>
> **primaryButtonTextColor**: `string`
>
> Text color for primary buttons
>
>

***

### `palette`

**palette**: `object`

Collection of colors used to color various elements

> #### `palette.variantColors`
>
> **variantColors**: [`Color`](type-alias.Color.md)[]
>
> Set of colors used to color chart elements
>
>

***

### `typography`

**typography**: `object`

Text theme settings

> #### `typography.fontFamily`
>
> **fontFamily**: `string`
>
> Font family name to style component text
>
> #### `typography.fontsLoader`
>
> **fontsLoader**?: [`FontsLoaderSettings`](../interfaces/interface.FontsLoaderSettings.md)
>
> Settings for font loading
>
> #### `typography.hyperlinkColor`
>
> **hyperlinkColor**: `string`
>
> Hyperlink color
>
> #### `typography.hyperlinkHoverColor`
>
> **hyperlinkHoverColor**: `string`
>
> Hyperlink hover color
>
> #### `typography.primaryTextColor`
>
> **primaryTextColor**: `string`
>
> Primary text color
>
> #### `typography.secondaryTextColor`
>
> **secondaryTextColor**: `string`
>
> Secondary text color
>
>

***

### `widget`

**widget**: `object`

Widget theme settings

> #### `widget.border`
>
> **border**: `boolean`
>
> Widget container border toggle
>
> #### `widget.borderColor`
>
> **borderColor**: `string`
>
> Widget container border color
>
> #### `widget.cornerRadius`
>
> **cornerRadius**: [`RadiusSizes`](type-alias.RadiusSizes.md)
>
> Corner radius of the widget container
>
> #### `widget.header`
>
> **header**: `object`
>
> Widget header styles
>
> > ##### `header.backgroundColor`
> >
> > **backgroundColor**: `string`
> >
> > Header background color
> >
> > ##### `header.dividerLine`
> >
> > **dividerLine**: `boolean`
> >
> > Toggle of the divider line between widget header and chart
> >
> > ##### `header.dividerLineColor`
> >
> > **dividerLineColor**: `string`
> >
> > Divider line color
> >
> > ##### `header.titleAlignment`
> >
> > **titleAlignment**: [`AlignmentTypes`](type-alias.AlignmentTypes.md)
> >
> > Header title alignment
> >
> > ##### `header.titleFontSize`
> >
> > **titleFontSize**: `number`
> >
> > Header title font size
> >
> > ##### `header.titleTextColor`
> >
> > **titleTextColor**: `string`
> >
> > Header title text color
> >
> >
>
> #### `widget.shadow`
>
> **shadow**: [`ShadowsTypes`](type-alias.ShadowsTypes.md)
>
> Shadow level of the widget container
>
> #### `widget.spaceAround`
>
> **spaceAround**: [`SpaceSizes`](type-alias.SpaceSizes.md)
>
> Space between widget container edge and the chart
>
>
