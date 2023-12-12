---
title: Compose SDK
indexTopics:
  - title: Quickstart Guide
    description: Get started with Compose SDK
    link: ./quickstart
  - title: API Reference
    description: Explore Compose SDK packages
    link: ./modules
  - title: Compose SDK GitHub
    description: Visit the Compose SDK GitHub Monorepo
    link: https://github.com/sisense/compose-sdk-monorepo
    external: true
  - title: Changelog
    description: Get informed about the evolution of Compose SDK
    link: ./CHANGELOG
  - title: Troubleshooting
    description: Find solutions to common issues
    link: ./troubleshooting
  # - title: Online Demo
  #   description: Check out a quick demo built with Compose SDK
  #   link: https://github.com/sisense/compose-sdk-monorepo
  #   external: true
---

# Compose SDK <Badge type="beta" text="Beta" />

Compose SDK is a software development kit that enables a composable, code-driven way to use Sisense platform capabilities. Build analytics and data-driven experiences into your product with code using Compose SDK, a set of client-side libraries and components for query composition, data visualization, and more.

 - **Create Sisense queries, charts, and filters directly from your application code**
 No predefined dashboards or widgets required - or render existing widgets by ID. Mix and match approaches to fit your needs.
 - **Composable, modular and extensible**
 Use our components, customize them, or bring your own. Compose SDK works equally well for building new applications or upgrading existing ones to use Sisense’s powerful analytics platform.
 - **Built with developer experience in mind**
 The SDK is available via GitHub and NPM, supports TypeScript and React, and includes documentation, code samples and CLI tools that help you get things done with ease.

::: warning You should know
 - **Compose SDK is currently in Beta** - Packages, APIs, and anything else is bound to change
 - Compose SDK currently supports development using TypeScript & React. Additional frameworks will be supported in the future
 - The [Compose SDK GitHub repository](https://github.com/sisense/compose-sdk-monorepo) is a monorepo containing all SDK packages. You can find the individual packages [here](https://www.npmjs.com/search?q=%40sisense)
:::

<SectionIndex />

::: tip Example/Demo Application
A demo application for Compose SDK + TypeScript + React is available in: [compose-sdk-react-demo](https://github.com/sisense/compose-sdk-react-demo).
:::

### What can I do with Compose SDK?

 - Execute composable queries on Sisense Data Models directly from your client application and use the data to drive your application's behavior, or render custom visualizations
 - Render ad-hoc data visualizations generated from code, based on Sisense data or your own
 - Embed visualizations from pre-defined Sisense Widgets
 - Create interactive data exploration with Filter components

### Who can use Compose SDK?

Compose SDK is currently in <Badge type="beta" text="Beta" />, and is available to all Sisense Customers.

To use Compose SDK Beta, you will need:

 - Access to a Sisense instance with Sisense Linux version L2022.11 or later
 - An application built using React and TypeScript (additional frameworks will be supported later)
 - A NodeJS package manager (`npm` or `yarn`)
