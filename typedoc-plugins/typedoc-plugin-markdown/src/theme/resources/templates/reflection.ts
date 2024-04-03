import { DeclarationReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { MarkdownPageEvent } from '../../../plugin/events';
import { heading } from '../../../support/elements';

/**
 * @category Templates
 */
export function reflectionTemplate(
  context: MarkdownThemeRenderContext,
  page: MarkdownPageEvent<DeclarationReflection>,
) {
  const md: string[] = [];

  if (!context.options.getValue('hidePageHeader')) {
    md.push(context.header(page));
  }

  if (!context.options.getValue('hideBreadcrumbs')) {
    md.push(context.breadcrumbs(page));
  }

  if (!context.options.getValue('hidePageTitle')) {
    /** CSDK START */
    // add title metadata
    md.push(`---\ntitle: ${page.model.name}\n---`);
    /** CSDK END */
    md.push(heading(1, context.pageTitle(page)));
  }

  md.push(context.reflectionMember(page.model, 2));

  md.push(context.footer());

  return md.join('\n\n');
}
