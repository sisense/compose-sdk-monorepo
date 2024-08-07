import { CODE_TEMPLATES } from './code-templates';
import { CodeTemplateKey, UiFramework } from './types';

/**
 * Populates templates recursively.
 *
 * @param templateKey - the key of the template to use
 * @param uiFramework - the UI framework for the generated code
 * @returns the populated template with placeholders
 */
const populateTemplates = (templateKey: CodeTemplateKey, uiFramework: UiFramework): string => {
  const template = CODE_TEMPLATES[uiFramework][templateKey];
  return (
    template
      // replace template placeholders with actual templates recursively
      .replace(/{{(.*?)Tmpl}}/g, (match, key) =>
        populateTemplates(`${key}Tmpl` as CodeTemplateKey, uiFramework),
      )
  );
};

/**
 * Populates placeholders in the given template with the given data.
 * If a placeholder is not found in the data, a warning is logged.
 *
 * @param template - the template to populate
 * @param data - the data to populate the template with
 * @returns the populated template
 */
export const populatePlaceholders = (template: string, data: Record<string, string>): string => {
  // replace other placeholders with actual values defined in data
  return template.replace(/{{(.*?)}}/g, (match, key) => {
    if (key in data) {
      return data[key];
    }
    console.warn(`Placeholder ${key} not found in data`);
    return match;
  });
};

/**
 * Generates code from a template with the given data and UI framework.
 *
 * @param templateKey - the key of the template to use
 * @param data - the data to populate the template with
 * @param uiFramework - the UI framework for the generated code
 */
export const generateCode = (
  templateKey: CodeTemplateKey,
  data: Record<string, string>,
  uiFramework: UiFramework = 'react',
): string => {
  const template = populateTemplates(templateKey, uiFramework);
  return populatePlaceholders(template, data);
};
