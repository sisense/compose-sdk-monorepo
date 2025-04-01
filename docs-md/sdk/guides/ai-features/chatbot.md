# Chatbot Features

The AI chatbot allows your users to explore your data and generate queries through natural language questions powered by GenAI. The chatbot can suggest sample insights, provide narrative explanations in context, and produce data visualizations.

::: warning Note
This feature is currently under beta release for our managed cloud customers on version L2024.2 or above. It is subject to changes as we make fixes and improvements. We’re striving to reach General Availability in the first half of 2025.
:::

## Quickstart Recommendations

When your users start a chat, the chatbot suggests a number of queries to get them started. They can choose one of these recommendations or ask their own questions as described below. These recommendations are also available mid-conversation by clicking the magic wand icon.

## Chat Conversation

Throughout conversations with the chatbot, your users can ask several types of questions.

- General, open-ended questions about the chatbot itself, such as "Who are you?" or "How can you help me?". The chatbot answers these questions by telling you about it's capabilities. The chatbot will not answer general questions that do not pertain to it or your data.
- Questions about your data model tables and their fields, such as "How many tables does my data model have?" and "Which table has information about the active status of a customer?". The chatbot answers these questions by providing you with information about your data model.
- Natural language queries, such as "How many active customers do we have?" and "What are the top five industries with active customers?". The chatbot answers these questions with the following:
  - Confirmation that your question was understood correctly. You should always validate that your question was indeed understood correctly before continuing.
  - A visualization that depicts the answer to your question. You can also see additional information about the tables, columns, and filters used in the query that created the visualization.
  - Insights button that generates a textual explanation about the data, highlighting key information.
  - (Optional) Suggested follow up questions to further explore your data. Currently, follow-up questions are still under development and are not validated. Therefore, follow-up questions are disabled by default.

## Natural Language Query Support

The natural language queries (NLQ) that you ask the chatbot support the following [formulas](#supported-formulas), [filters](#supported-filters), and [visualizations](#supported-visualizations).

### Supported Formulas

The following formulas are supported:

- Basic aggregation functions, such as `sum`, `count`, `countDistinct`, `min`, `max`, `median`, and `average`
- Quick functions, such as `contribution`, `pastYear`, `difference`, and arithmetic operations (`+`/`-`/`:`/`*`) either by entering the operation as a word ("revenue minus cost") or using the operator symbol ("revenue - cost").

### Supported Filters

The following filters are supported:

- MemberFilter: Get specific values from a column
- FromToFilter: Get values from a range
- ValueFilter: For numeric columns, using: `fromNotEqual`, `from`, `toNotEqual`, `to`, `equals`, `doesntEqual`, `top`, `bottom`
- ExcludeFilter: Get all values from a column except specific ones
- LastFilter: For datetime columns, filter dates from now to specific history (last mont/last year)
- NextFilter: For datetime columns, filter dates from now to specific future (next month/next year)
- ContainsFilter: For text columns to get values that contain a specific text string
- DoesntContainFilter: For text columns to get values that do not contain a specific text string
- StartsWithFilter: For text columns to get values that start with a specific text string
- DoesntStartWithFilter: For text columns to get values that do not start with a specific text string
- EndsWithFilter: For text columns to get values that end with a specific text string
- DoesntEndWithFilter: For text columns to get values that do not end with a specific text string
- ByTopFilter: To get the top values from a column based on formula
- ByBottomFilter: To get the bottom values from a column based on formula

### Supported Visualizations

When asking a question, you can ask for a specific chart type, or the chatbot will select the most suitable chart that answers your question.

The following visualization types are supported:

- Area chart
- Bar chart
- Column chart
- Funnel chart
- Indicator chart
- Line chart
- Pie chart
- Polar chart
- Table
- Treemap chart

## Limitations

- Questions with filters for specific formulas are not supported. For example, the question "What is the total revenue for females and what is the total revenue for males?" is not supported. As a workaround, you can break your question into two separate questions or to ask "What is the total revenue for each gender, keep only female and male".
- Your data model structure and naming must be clear and reflect the terminology users will use in their questions. For example, if the question "What is the total revenue for active users?" is asked, the data model must contain column named "Active".
- Column names with the period (`.`) character may cause errors.
- Asking about a specific textual filter member without knowing its exact spelling is not supported yet. For example, if your data model contains a gender field where one of the possible values is `female`, asking "What are the sales for women?" will not work, whereas asking "What are my sales for female?" will work as expected.
