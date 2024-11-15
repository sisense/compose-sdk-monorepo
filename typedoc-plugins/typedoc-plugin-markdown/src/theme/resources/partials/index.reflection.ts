import {
  DeclarationReflection,
  ProjectReflection,
  ReflectionCategory,
  ReflectionGroup,
  ReflectionKind,
} from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { heading, link, table } from '../../../support/elements';
import { escapeChars, tableComments } from '../../../support/utils';

export function reflectionIndex(
  context: MarkdownThemeRenderContext,
  reflection: ProjectReflection | DeclarationReflection,
  headingLevel: number,
): string {
  const md: string[] = [];

  const subHeadingLevel = headingLevel;

  if (context.options.getValue('excludeGroups') && reflection.children) {
    const group = { title: 'Members', children: reflection.children };
    md.push(getGroup(context, group as ReflectionGroup) + '\n');
  } else {
    const groupCount = reflection.groups?.length || 0;
    reflection.groups?.forEach((reflectionGroup) => {
      if (reflectionGroup.categories) {
        md.push(heading(subHeadingLevel, reflectionGroup.title) + '\n');
        reflectionGroup.categories.forEach((categoryGroup) => {
          md.push(heading(subHeadingLevel + 1, categoryGroup.title) + '\n');
          md.push(getGroup(context, categoryGroup) + '\n');
        });
      } else {
        /** CSDK START */
        // If there is more than one group, exclude built-in groups in the index
        // as user-defined groups are more relevant to users
        if (
          groupCount > 1 &&
          ['Classes', 'Interfaces', 'Enumerations', 'Type Aliases', 'Variables'].includes(
            reflectionGroup.title,
          )
        ) {
          return;
        }
        /** CSDK END */

        md.push(heading(subHeadingLevel, reflectionGroup.title) + '\n');

        /** CSDK START */
        // Include groupDescription
        if (reflectionGroup.description) {
          md.push(reflectionGroup.description[0].text + '\n');
        }
        /** CSDK END */

        md.push(getGroup(context, reflectionGroup) + '\n');
      }
    });
  }
  return md.join('\n');
}

function getGroup(
  context: MarkdownThemeRenderContext,
  group: ReflectionGroup | ReflectionCategory,
) {
  if (context.options.getValue('tocFormat') === 'table') {
    return getTable(context, group);
  }
  return getList(context, group);
}

function getTable(
  context: MarkdownThemeRenderContext,
  group: ReflectionGroup | ReflectionCategory,
) {
  const reflectionKind = group.children[0].kind;
  const headers = [ReflectionKind.singularString(reflectionKind), 'Description'];
  const rows: string[][] = [];

  group.children.forEach((child) => {
    const row: string[] = [];

    row.push(link(escapeChars(child.name), context.relativeURL(child.url)));

    if (child.comment?.summary) {
      row.push(tableComments(context.commentParts(child.comment.summary)).split('\n')[0]);
    } else {
      row.push('-');
    }
    rows.push(row);
  });
  return table(headers, rows);
}

function getList(context: MarkdownThemeRenderContext, group: ReflectionGroup | ReflectionCategory) {
  const children = group.children.map(
    (child: DeclarationReflection) =>
      // CSDK: add member badge
      `- [${escapeChars(child.name)}](${context.relativeURL(child.url)})${context.memberBadge(
        child,
      )}${context.memberShortDescription(child)}`,
  );
  return children.join('\n');
}
