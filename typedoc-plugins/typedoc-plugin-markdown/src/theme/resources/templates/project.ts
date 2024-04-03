import { ProjectReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { MarkdownPageEvent } from '../../../plugin/events';
import { heading } from '../../../support/elements';

/**
 * @category Templates
 */
export function projectTemplate(
  context: MarkdownThemeRenderContext,
  page: MarkdownPageEvent<ProjectReflection>,
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

  if (page.model.comment) {
    md.push(context.comment(page.model.comment, 2));
  }

  md.push(context.pageIndex(page, 2));

  md.push(context.members(page.model, 2));

  md.push(context.footer());

  return md.join('\n\n');
}
