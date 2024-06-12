---
title: ThemeSettings
---

# Interface ThemeSettings

Theme settings defining the look and feel of components.

## Properties

### aiChat

> **aiChat**?: `object`

Theme settings specific to the AI Chatbot component

#### Type declaration

> ##### `aiChat.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the chatbot
>
> ##### `aiChat.body`
>
> **body**?: `object`
>
> Settings for the main chat body
>
> > ###### `body.gapBetweenMessages`
> >
> > **gapBetweenMessages**?: `string`
> >
> > Gap size between each message in the chat body
> >
> > ###### `body.paddingBottom`
> >
> > **paddingBottom**?: `string`
> >
> > Bottom padding of the chat body
> >
> > ###### `body.paddingLeft`
> >
> > **paddingLeft**?: `string`
> >
> > Left padding of the chat body
> >
> > ###### `body.paddingRight`
> >
> > **paddingRight**?: `string`
> >
> > Right padding of the chat body
> >
> > ###### `body.paddingTop`
> >
> > **paddingTop**?: `string`
> >
> > Top padding of the chat body
> >
> >
>
> ##### `aiChat.border`
>
> **border**?: `string` \| `false`
>
> Border of the chatbot
>
> ##### `aiChat.borderRadius`
>
> **borderRadius**?: `string` \| `false`
>
> Border radius of the chatbot
>
> ##### `aiChat.clickableMessages`
>
> **clickableMessages**?: `object`
>
> Settings for the chatbot clickable messages
>
> > ###### `clickableMessages.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the chatbot clickable messages
> >
> > ###### `clickableMessages.border`
> >
> > **border**?: `string` \| `false`
> >
> > Border of the chatbot clickable messages
> >
> > ###### `clickableMessages.borderGradient`
> >
> > **borderGradient**?: `null` \| [`string`, `string`]
> >
> > 2-color gradient to be applied on the border
> >
> > ###### `clickableMessages.hover`
> >
> > **hover**?: `object`
> >
> > Setting to be applied on hover
> >
> > > ###### `hover.backgroundColor`
> > >
> > > **backgroundColor**?: `string`
> > >
> > > Background color of the chatbot clickable messages on hover
> > >
> > > ###### `hover.textColor`
> > >
> > > **textColor**?: `string`
> > >
> > > Text color of the chatbot clickable messages on hover
> > >
> > >
> >
> > ###### `clickableMessages.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the chatbot clickable messages
> >
> >
>
> ##### `aiChat.dataTopics`
>
> **dataTopics**?: `object`
>
> Settings for the data topics screen
>
> > ###### `dataTopics.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the data topics screen
> >
> > ###### `dataTopics.items`
> >
> > **items**?: `object`
> >
> > Settings for the individual data topic items
> >
> > > ###### `items.backgroundColor`
> > >
> > > **backgroundColor**?: `string`
> > >
> > > Background color of the data topic items
> > >
> > > ###### `items.textColor`
> > >
> > > **textColor**?: `string`
> > >
> > > Text color of the data topic items
> > >
> > >
> >
> >
>
> ##### `aiChat.dropup`
>
> **dropup**?: `object`
>
> Settings for chatbot dropup
>
> > ###### `dropup.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the dropup
> >
> > ###### `dropup.borderRadius`
> >
> > **borderRadius**?: `string`
> >
> > Border radius of the dropup
> >
> > ###### `dropup.boxShadow`
> >
> > **boxShadow**?: `string`
> >
> > Box shadow of the dropup
> >
> > ###### `dropup.headers`
> >
> > **headers**?: `object`
> >
> > Settings for the section headers of the dropup
> >
> > > ###### `headers.hover`
> > >
> > > **hover**?: `object`
> > >
> > > Settings to be applied on hover of the headers
> > >
> > > > ###### `hover.backgroundColor`
> > > >
> > > > **backgroundColor**?: `string`
> > > >
> > > > Background color of headers on hover
> > > >
> > > >
> > >
> > > ###### `headers.textColor`
> > >
> > > **textColor**?: `string`
> > >
> > > Text color of headers
> > >
> > >
> >
> > ###### `dropup.items`
> >
> > **items**?: `object`
> >
> > Settings for the dropup items
> >
> > > ###### `items.hover`
> > >
> > > **hover**?: `object`
> > >
> > > Settings to be applied on hover of dropup items
> > >
> > > > ###### `hover.backgroundColor`
> > > >
> > > > **backgroundColor**?: `string`
> > > >
> > > > Background color of dropup items on hover
> > > >
> > > >
> > >
> > > ###### `items.textColor`
> > >
> > > **textColor**?: `string`
> > >
> > > Text color of the dropup items
> > >
> > >
> >
> >
>
> ##### `aiChat.footer`
>
> **footer**?: `object`
>
> Settings for the chat footer
>
> > ###### `footer.paddingBottom`
> >
> > **paddingBottom**?: `string`
> >
> > Bottom padding of the chat footer
> >
> > ###### `footer.paddingLeft`
> >
> > **paddingLeft**?: `string`
> >
> > Left padding of the chat footer
> >
> > ###### `footer.paddingRight`
> >
> > **paddingRight**?: `string`
> >
> > Right padding of the chat footer
> >
> > ###### `footer.paddingTop`
> >
> > **paddingTop**?: `string`
> >
> > Top padding of the chat footer
> >
> >
>
> ##### `aiChat.header`
>
> **header**?: `object`
>
> Settings for the chatbot header
>
> > ###### `header.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the chatbot header
> >
> > ###### `header.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the chatbot header
> >
> >
>
> ##### `aiChat.icons`
>
> **icons**?: `object`
>
> Settings for the chatbot icons
>
> > ###### `icons.color`
> >
> > **color**?: `string`
> >
> > Color of the chatbot icons
> >
> > ###### `icons.feedbackIcons`
> >
> > **feedbackIcons**?: `object`
> >
> > Settings for feedback icons
> >
> > > ###### `feedbackIcons.hoverColor`
> > >
> > > **hoverColor**?: `string`
> > >
> > > Background color of the feedback icons on hover
> > >
> > >
> >
> >
>
> ##### `aiChat.input`
>
> **input**?: `object`
>
> Settings for the chatbot input
>
> > ###### `input.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the input
> >
> > ###### `input.focus`
> >
> > **focus**?: `object`
> >
> > Settings to be applied on input focus
> >
> > > ###### `focus.outlineColor`
> > >
> > > **outlineColor**?: `string`
> > >
> > > Outline color of the input
> > >
> > >
> >
> >
>
> ##### `aiChat.primaryFontSize`
>
> **primaryFontSize**?: [`string`, `string`]
>
> Primary font size for text in the chatbot
>
> ##### `aiChat.primaryTextColor`
>
> **primaryTextColor**?: `string`
>
> Text color of the chatbot
>
> ##### `aiChat.secondaryTextColor`
>
> **secondaryTextColor**?: `string`
>
> Secondary text color of the chatbot
>
> ##### `aiChat.suggestions`
>
> **suggestions**?: `object`
>
> Settings for the chatbot suggestions
>
> > ###### `suggestions.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the chatbot suggestions
> >
> > ###### `suggestions.border`
> >
> > **border**?: `string`
> >
> > Border of the chatbot suggestions
> >
> > ###### `suggestions.borderGradient`
> >
> > **borderGradient**?: `null` \| [`string`, `string`]
> >
> > 2-color gradient to be applied on the border
> >
> > ###### `suggestions.borderRadius`
> >
> > **borderRadius**?: `string`
> >
> > Border radius of the chatbot suggestions
> >
> > ###### `suggestions.gap`
> >
> > **gap**?: `string`
> >
> > Gap size between each suggestion item
> >
> > ###### `suggestions.hover`
> >
> > **hover**?: `object`
> >
> > Setting to be applied on hover
> >
> > > ###### `hover.backgroundColor`
> > >
> > > **backgroundColor**?: `string`
> > >
> > > Background color of the chatbot suggestions on hover
> > >
> > > ###### `hover.textColor`
> > >
> > > **textColor**?: `string`
> > >
> > > Text color of the chatbot suggestions on hover
> > >
> > >
> >
> > ###### `suggestions.loadingGradient`
> >
> > **loadingGradient**?: [`string`, `string`]
> >
> > 2-color gradient to be applied on suggestions loading animation
> >
> > ###### `suggestions.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the chatbot suggestions
> >
> >
>
> ##### `aiChat.systemMessages`
>
> **systemMessages**?: `object`
>
> Settings for system chat messages
>
> > ###### `systemMessages.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of system chat messages
> >
> >
>
> ##### `aiChat.tooltips`
>
> **tooltips**?: `object`
>
> Settings for the chatbot tooltips
>
> > ###### `tooltips.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the tooltips
> >
> > ###### `tooltips.boxShadow`
> >
> > **boxShadow**?: `string`
> >
> > Box shadow of the tooltips
> >
> > ###### `tooltips.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the tooltips
> >
> >
>
> ##### `aiChat.userMessages`
>
> **userMessages**?: `object`
>
> Settings for user chat messages
>
> > ###### `userMessages.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of user chat messages
> >
> >
>
>

***

### chart

> **chart**?: `object`

Chart theme settings

#### Type declaration

> ##### `chart.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color
>
> ##### `chart.panelBackgroundColor`
>
> **panelBackgroundColor**?: `string`
>
> Toolbar Background color, can be used as a secondary background color
>
> ##### `chart.secondaryTextColor`
>
> **secondaryTextColor**?: `string`
>
> Secondary text color - e.g., for the indicator chart's secondary value title
>
> ##### `chart.textColor`
>
> **textColor**?: `string`
>
> Text color
>
>

***

### general

> **general**?: `object`

General theme settings

#### Type declaration

> ##### `general.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color used for elements like tiles, etc.
>
> ##### `general.brandColor`
>
> **brandColor**?: `string`
>
> Main color used for various elements like primary buttons, switches, etc.
>
> ##### `general.primaryButtonHoverColor`
>
> **primaryButtonHoverColor**?: `string`
>
> Hover color for primary buttons
>
> ##### `general.primaryButtonTextColor`
>
> **primaryButtonTextColor**?: `string`
>
> Text color for primary buttons
>
>

***

### palette

> **palette**?: [`ColorPaletteTheme`](../type-aliases/type-alias.ColorPaletteTheme.md)

Collection of colors used to color various elements

***

### typography

> **typography**?: `object`

Text theme settings

#### Type declaration

> ##### `typography.fontFamily`
>
> **fontFamily**?: `string`
>
> Font family name to style component text
>
> ##### `typography.primaryTextColor`
>
> **primaryTextColor**?: `string`
>
> Primary text color
>
> ##### `typography.secondaryTextColor`
>
> **secondaryTextColor**?: `string`
>
> Secondary text color
>
>
