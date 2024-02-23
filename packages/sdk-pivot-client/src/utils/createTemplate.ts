/* eslint-disable import/prefer-default-export */
export type TemplateStringsMap = { [s: string]: string | number | boolean };

/**
 * Creates template function
 *
 * @example
 * var template = createTemplate('Rows {{from}}-{{to}} ({{total}} Total)');
 * var str = template({ from: 0, to: 10, total: 100 });
 *
 * @param {string} templateString - template string to work with
 * @returns {function(object): string} - template function
 */
export const createTemplate =
  (templateString: string) =>
  (templateData: TemplateStringsMap): string =>
    templateString.replace(/{{(\w+)}}/g, (search, key) => {
      if (typeof templateData[key] !== 'undefined') {
        return templateData[key];
      }
      return key;
    });
