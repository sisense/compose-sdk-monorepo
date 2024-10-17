---
title: AiChatThemeSettings
---

# Interface AiChatThemeSettings

Theme settings specific to the AI Chatbot component

## Properties

### backgroundColor

> **backgroundColor**?: `string`

Background color of the chatbot

***

### body

> **body**?: `object`

Settings for the main chat body

#### Type declaration

> ##### `body.gapBetweenMessages`
>
> **gapBetweenMessages**?: `string`
>
> Gap size between each message in the chat body
>
> ##### `body.paddingBottom`
>
> **paddingBottom**?: `string`
>
> Bottom padding of the chat body
>
> ##### `body.paddingLeft`
>
> **paddingLeft**?: `string`
>
> Left padding of the chat body
>
> ##### `body.paddingRight`
>
> **paddingRight**?: `string`
>
> Right padding of the chat body
>
> ##### `body.paddingTop`
>
> **paddingTop**?: `string`
>
> Top padding of the chat body
>
>

***

### border

> **border**?: `false` \| `string`

Border of the chatbot

***

### borderRadius

> **borderRadius**?: `false` \| `string`

Border radius of the chatbot

***

### clickableMessages

> **clickableMessages**?: `object`

Settings for the chatbot clickable messages

#### Type declaration

> ##### `clickableMessages.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the chatbot clickable messages
>
> ##### `clickableMessages.border`
>
> **border**?: `false` \| `string`
>
> Border of the chatbot clickable messages
>
> ##### `clickableMessages.borderGradient`
>
> **borderGradient**?: [`string`, `string`] \| `null`
>
> 2-color gradient to be applied on the border
>
> ##### `clickableMessages.hover`
>
> **hover**?: `object`
>
> Setting to be applied on hover
>
> > ###### `hover.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the chatbot clickable messages on hover
> >
> > ###### `hover.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the chatbot clickable messages on hover
> >
> >
>
> ##### `clickableMessages.textColor`
>
> **textColor**?: `string`
>
> Text color of the chatbot clickable messages
>
>

***

### dataTopics

> **dataTopics**?: `object`

Settings for the data topics screen

#### Type declaration

> ##### `dataTopics.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the data topics screen
>
> ##### `dataTopics.items`
>
> **items**?: `object`
>
> Settings for the individual data topic items
>
> > ###### `items.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the data topic items
> >
> > ###### `items.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the data topic items
> >
> >
>
>

***

### dropup

> **dropup**?: `object`

Settings for chatbot dropup

#### Type declaration

> ##### `dropup.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the dropup
>
> ##### `dropup.borderRadius`
>
> **borderRadius**?: `string`
>
> Border radius of the dropup
>
> ##### `dropup.boxShadow`
>
> **boxShadow**?: `string`
>
> Box shadow of the dropup
>
> ##### `dropup.headers`
>
> **headers**?: `object`
>
> Settings for the section headers of the dropup
>
> > ###### `headers.hover`
> >
> > **hover**?: `object`
> >
> > Settings to be applied on hover of the headers
> >
> > > ###### `hover.backgroundColor`
> > >
> > > **backgroundColor**?: `string`
> > >
> > > Background color of headers on hover
> > >
> > >
> >
> > ###### `headers.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of headers
> >
> >
>
> ##### `dropup.items`
>
> **items**?: `object`
>
> Settings for the dropup items
>
> > ###### `items.hover`
> >
> > **hover**?: `object`
> >
> > Settings to be applied on hover of dropup items
> >
> > > ###### `hover.backgroundColor`
> > >
> > > **backgroundColor**?: `string`
> > >
> > > Background color of dropup items on hover
> > >
> > >
> >
> > ###### `items.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the dropup items
> >
> >
>
>

***

### footer

> **footer**?: `object`

Settings for the chat footer

#### Type declaration

> ##### `footer.paddingBottom`
>
> **paddingBottom**?: `string`
>
> Bottom padding of the chat footer
>
> ##### `footer.paddingLeft`
>
> **paddingLeft**?: `string`
>
> Left padding of the chat footer
>
> ##### `footer.paddingRight`
>
> **paddingRight**?: `string`
>
> Right padding of the chat footer
>
> ##### `footer.paddingTop`
>
> **paddingTop**?: `string`
>
> Top padding of the chat footer
>
>

***

### header

> **header**?: `object`

Settings for the chatbot header

#### Type declaration

> ##### `header.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the chatbot header
>
> ##### `header.textColor`
>
> **textColor**?: `string`
>
> Text color of the chatbot header
>
>

***

### icons

> **icons**?: `object`

Settings for the chatbot icons

#### Type declaration

> ##### `icons.color`
>
> **color**?: `string`
>
> Color of the chatbot icons
>
> ##### `icons.feedbackIcons`
>
> **feedbackIcons**?: `object`
>
> Settings for feedback icons
>
> > ###### `feedbackIcons.hoverColor`
> >
> > **hoverColor**?: `string`
> >
> > Background color of the feedback icons on hover
> >
> >
>
>

***

### input

> **input**?: `object`

Settings for the chatbot input

#### Type declaration

> ##### `input.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the input
>
> ##### `input.focus`
>
> **focus**?: `object`
>
> Settings to be applied on input focus
>
> > ###### `focus.outlineColor`
> >
> > **outlineColor**?: `string`
> >
> > Outline color of the input
> >
> >
>
>

***

### primaryFontSize

> **primaryFontSize**?: [`string`, `string`]

Primary font size for text in the chatbot

***

### primaryTextColor

> **primaryTextColor**?: `string`

Text color of the chatbot

***

### secondaryTextColor

> **secondaryTextColor**?: `string`

Secondary text color of the chatbot

***

### suggestions

> **suggestions**?: `object`

Settings for the chatbot suggestions

#### Type declaration

> ##### `suggestions.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the chatbot suggestions
>
> ##### `suggestions.border`
>
> **border**?: `string`
>
> Border of the chatbot suggestions
>
> ##### `suggestions.borderGradient`
>
> **borderGradient**?: [`string`, `string`] \| `null`
>
> 2-color gradient to be applied on the border
>
> ##### `suggestions.borderRadius`
>
> **borderRadius**?: `string`
>
> Border radius of the chatbot suggestions
>
> ##### `suggestions.gap`
>
> **gap**?: `string`
>
> Gap size between each suggestion item
>
> ##### `suggestions.hover`
>
> **hover**?: `object`
>
> Setting to be applied on hover
>
> > ###### `hover.backgroundColor`
> >
> > **backgroundColor**?: `string`
> >
> > Background color of the chatbot suggestions on hover
> >
> > ###### `hover.textColor`
> >
> > **textColor**?: `string`
> >
> > Text color of the chatbot suggestions on hover
> >
> >
>
> ##### `suggestions.loadingGradient`
>
> **loadingGradient**?: [`string`, `string`]
>
> 2-color gradient to be applied on suggestions loading animation
>
> ##### `suggestions.textColor`
>
> **textColor**?: `string`
>
> Text color of the chatbot suggestions
>
>

***

### systemMessages

> **systemMessages**?: `object`

Settings for system chat messages

#### Type declaration

> ##### `systemMessages.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of system chat messages
>
>

***

### tooltips

> **tooltips**?: `object`

Settings for the chatbot tooltips

#### Type declaration

> ##### `tooltips.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of the tooltips
>
> ##### `tooltips.boxShadow`
>
> **boxShadow**?: `string`
>
> Box shadow of the tooltips
>
> ##### `tooltips.textColor`
>
> **textColor**?: `string`
>
> Text color of the tooltips
>
>

***

### userMessages

> **userMessages**?: `object`

Settings for user chat messages

#### Type declaration

> ##### `userMessages.backgroundColor`
>
> **backgroundColor**?: `string`
>
> Background color of user chat messages
>
>
