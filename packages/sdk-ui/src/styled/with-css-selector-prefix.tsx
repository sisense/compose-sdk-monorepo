import React, { type ComponentType, forwardRef, useMemo } from 'react';

import type { CreateStyled, Interpolation } from '@emotion/styled';

import { useThemeContext } from '@/theme-provider/theme-context';
import { AnyObject } from '@/utils/utility-types';

type StyledHtmlTag = keyof React.JSX.IntrinsicElements;
type Component = ComponentType<any>;
type ComponentOrTag = Component | StyledHtmlTag;
interface TemplateStringsArray extends Array<string> {
  raw: string[];
}

// Helper to wrap CSS template with prefix from theme config
function wrapWithPrefix(template: TemplateStringsArray, cssPrefix: string): TemplateStringsArray {
  if (!Array.isArray(template)) {
    return template;
  }

  const wrappedTemplate = [
    `${cssPrefix} & { ${template[0]}`,
    ...template.slice(1, -1),
    `${template[template.length - 1]} }`,
  ];

  // Create a proper TemplateStringsArray
  const result = wrappedTemplate as TemplateStringsArray;
  result.raw = wrappedTemplate;
  return result;
}

// Create a wrapper for each HTML tag that automatically adds CSS prefix
function createPrefixedStyledComponentBuilder(
  baseStyled: CreateStyled,
  componentOrTagName: ComponentOrTag,
) {
  return function <Props extends AnyObject>(
    template: TemplateStringsArray,
    ...interpolations: Array<Interpolation<Props>>
  ) {
    const PrefixedStyledComponent = forwardRef<Component, Props>((props, ref) => {
      const { config } = useThemeContext();
      const cssSelectorPrefix = config?.cssSelectorPrefix?.enabled
        ? config?.cssSelectorPrefix?.value
        : '';

      const StyledComponent = useMemo(() => {
        const finalTemplate = cssSelectorPrefix
          ? wrapWithPrefix(template, cssSelectorPrefix)
          : template;
        return baseStyled(componentOrTagName as Component)(finalTemplate, ...interpolations);
      }, [cssSelectorPrefix]);

      return <StyledComponent ref={ref} {...props} />;
    });

    // Wraps the custom prefixed styled component with the base styled component to prevent broken emotion internals
    return baseStyled(PrefixedStyledComponent, { shouldForwardProp: () => true })``;
  };
}

// Decorator that adds CSS selector prefix wrapper to styled components
export function withCssSelectorPrefix<T extends CreateStyled = CreateStyled>(baseStyled: T): T {
  // Create the main styled function for custom components
  const styledFunction = (component: ComponentOrTag) =>
    createPrefixedStyledComponentBuilder(baseStyled, component);

  // Get the HTML tag names from the baseStyled object
  const styledHtmlTags = Object.keys(baseStyled) as StyledHtmlTag[];

  // Create the styled object with HTML tag properties dynamically from STYLED_HTML_TAGS
  const tagWrappers = styledHtmlTags.reduce((acc, tagName) => {
    acc[tagName] = createPrefixedStyledComponentBuilder(baseStyled, tagName);
    return acc;
  }, {} as Record<StyledHtmlTag, ReturnType<typeof createPrefixedStyledComponentBuilder>>);

  const styled = Object.assign(styledFunction, tagWrappers);

  return styled as T;
}
