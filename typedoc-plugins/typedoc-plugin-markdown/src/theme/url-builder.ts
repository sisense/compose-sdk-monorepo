import * as path from 'path';
import {
  DeclarationReflection,
  EntryPointStrategy,
  Options,
  ProjectReflection,
  Reflection,
  ReflectionKind,
  UrlMapping,
} from 'typedoc';

import { OutputFileStrategy } from '../plugin/options/custom-maps';
import { slugify } from '../support/utils';
import { MarkdownTheme } from './markdown-theme';
import { TemplateMapping, UrlOption } from './models';

export class UrlBuilder {
  urls: UrlMapping[] = [];
  anchors: Record<string, string[]> = {};

  constructor(
    public theme: MarkdownTheme,
    public options: Options,
  ) {}

  /**
   * Map the models of the given project to the desired output files.
   * Based on TypeDoc DefaultTheme.getUrls()
   *
   * @param project  The project whose urls should be generated.
   */
  getUrls(project: ProjectReflection): UrlMapping[] {
    const entryFileName = this.options.getValue('entryFileName') as string;
    const indexFileName = this.options.getValue('indexFileName') as string;
    const hasReadme = !this.options.getValue('readme').endsWith('none');

    if (hasReadme) {
      this.urls.push(
        new UrlMapping(entryFileName, project, this.theme.readmeTemplate),
      );

      if (this.options.getValue('skipIndexPage')) {
        project.url = entryFileName;
      } else {
        project.url = this.getPartName(indexFileName, 1);
        this.urls.push(
          new UrlMapping(
            this.getPartName(indexFileName, 1),
            project,
            this.theme.projectTemplate,
          ),
        );
      }
    } else {
      if (!this.options.getValue('skipIndexPage')) {
        project.url = entryFileName;

        this.urls.push(
          new UrlMapping(entryFileName, project, this.theme.projectTemplate),
        );
      }
    }

    if (
      this.options.getValue('entryPointStrategy') ===
        EntryPointStrategy.Packages &&
      !Boolean(project.groups)
    ) {
      // [tuan]: each projectChild is a module (e.g., @sisense/sdk-ui, @sisense/sdk-data, etc)
      project.children?.forEach((projectChild, projectChildIndex) => {
        /** CSDK START */
        // Remove @sisense/ prefix from module name
        projectChild.name = projectChild.name.replace('@sisense/', '');
        /** CSDK END */

        // console.log('projectChild', projectChild.name, projectChild.url);
        const startIndex = hasReadme ? 2 : 1;

        const directoryPosition = projectChildIndex + startIndex;
        const url = `${this.getPartName(
          projectChild.name,
          directoryPosition,
        )}/${
          Boolean(projectChild.readme)
            ? this.getPartName(indexFileName, 1)
            : entryFileName
        }`;
        if (projectChild.readme) {
          this.urls.push(
            new UrlMapping(
              `${path.dirname(url)}/${entryFileName}`,
              projectChild as any,
              this.theme.readmeTemplate,
            ),
          );
        }
        this.urls.push(
          new UrlMapping(url, projectChild as any, this.theme.projectTemplate),
        );
        projectChild.url = url;
        this.buildUrlsFromProject(projectChild, url);
      });
    } else {
      this.buildUrlsFromProject(project);
    }
    return this.urls;
  }

  /**
   *
   * @param project
   * @param isPackage
   */
  private buildUrlsFromProject(
    project: ProjectReflection | DeclarationReflection,
    parentUrl?: string,
  ) {
    const startIndex = Boolean(project.readme) ? 2 : 1;

    if (this.options.getValue('excludeGroups')) {
      project.children?.forEach((projectGroupChild, projectGroupChildIndex) => {
        this.buildUrlsFromGroup(projectGroupChild, {
          directoryPosition: projectGroupChildIndex + startIndex,
          pagePosition: projectGroupChildIndex + startIndex,
          ...(parentUrl && { parentUrl: parentUrl }),
        });
      });
    } else {
      // [tuan]: each projectGroup is a kind (e.g., functions, interfaces, etc)
      project.groups?.forEach((projectGroup, projectGroupIndex) => {
        /** CSDK START */
        // Generate index.md for each projectGroup
        const entryFileName = this.options.getValue('entryFileName') as string;

        const projectGroupDirName = slugify(projectGroup.title);

        const projectGroupUrl = `${project.name}/${this.getPartName(
          projectGroupDirName,
          projectGroupIndex,
        )}/${entryFileName}`;

        // clone the project with only the current group
        const groupProject = Object.create(project);
        groupProject.name = projectGroup.title;
        groupProject.groups = groupProject.groups?.filter((group) => group.title === projectGroup.title);

        this.urls.push(
          new UrlMapping(projectGroupUrl, groupProject as any, this.theme.projectKindTemplate),
        );
        /** CSDK END */

        // console.log('--projectGroup', projectGroupUrl);

        projectGroup.children?.forEach(
          // [tuan]: each projectGroupChild is an API item (e.g., Chart, ChartProps, etc)
          (projectGroupChild, projectGroupChildIndex) => {
            // console.log('----projectGroupChild', projectGroupChild.name, projectGroupChild.url);
            this.buildUrlsFromGroup(projectGroupChild, {
              // CSDK: use the group title as the directory name
              directory: projectGroupDirName,
              directoryPosition: projectGroupIndex + startIndex,
              pagePosition: projectGroupChildIndex + startIndex,
              ...(parentUrl && { parentUrl: parentUrl }),
            });
          },
        );
      });
    }
  }

  private buildUrlsFromGroup(
    reflection: DeclarationReflection,
    options: UrlOption,
  ) {

    const mapping = this.getTemplateMapping(reflection.kind);
    if (mapping) {
      const directory = options.directory || mapping.directory;
      const url = this.getUrl(reflection, {
        ...options,
        directory,
      });

      this.urls.push(new UrlMapping(url, reflection, mapping.template));

      reflection.url = url;
      reflection.hasOwnDocument = true;

      if (this.options.getValue('excludeGroups')) {
        if (reflection.categories) {
          reflection.categories.forEach((category, categoryIndex) => {
            category.children.forEach((categoryChild, categoryChildIndex) => {
              this.buildUrlsFromGroup(categoryChild, {
                parentUrl: url,
                directoryPosition: categoryIndex + 1,
                directory: category.title,
                pagePosition: categoryChildIndex + 1,
                forceDirectory: true,
              });
            });
          });
        } else {
          reflection.children?.forEach((groupChild, groupChildIndex) => {
            this.buildUrlsFromGroup(groupChild, {
              parentUrl: url,
              directoryPosition: groupChildIndex + 1,
              directory: null,
              pagePosition: groupChildIndex + 1,
            });
          });
        }
      } else {
        reflection.groups?.forEach((group, groupIndex) => {
          /** CSDK START */
          // generate index.md for each functions group of namespace
          if (group.title === 'Functions') {
            const entryFileName = this.options.getValue('entryFileName') as string;
            const groupUrl = `${url.replace(entryFileName, '')}${this.getPartName(
              slugify(group.title),
              groupIndex,
            )}/${entryFileName}`;

            // clone the reflection to customize the index.md
            const groupReflection = Object.create(reflection);
            groupReflection.name = group.title;

            this.urls.push(
              new UrlMapping(groupUrl, groupReflection as any, this.theme.projectKindTemplate),
            );

            // console.log('------group', group.title, groupUrl);
          }
          /** CSDK END */

          if (group.categories) {
            group.categories.forEach((category, categoryIndex) => {
              // console.log('--------category', category.title);
              category.children.forEach((categoryChild, categoryChildIndex) => {
                // console.log('--------categoryChild', categoryChild.name);
                const mapping = this.getTemplateMapping(categoryChild.kind);
                this.buildUrlsFromGroup(categoryChild, {
                  parentUrl: url,
                  directoryPosition: groupIndex + 1,
                  directory: `${mapping?.directory}/${this.getPartName(
                    category.title,
                    categoryIndex + 1,
                  )}`,
                  pagePosition: categoryChildIndex + 1,
                });
              });
            });
          } else {
            group.children.forEach((groupChild, groupChildIndex) => {
              // console.log('--------groupChild', groupChild.name);
              const mapping = this.getTemplateMapping(groupChild.kind);
              this.buildUrlsFromGroup(groupChild, {
                parentUrl: url,
                directoryPosition: groupIndex + 1,
                directory: mapping?.directory || null,
                pagePosition: groupChildIndex + 1,
              });
            });
          }
        });
      }
    } else if (reflection.parent) {
      this.applyAnchorUrl(reflection, reflection.parent);
    }
  }

  private getUrl(reflection: DeclarationReflection, options: UrlOption) {
    if (this.options.getValue('flattenOutputFiles')) {
      const kindAlias = ReflectionKind.singularString(reflection.kind).split(
        ' ',
      )[0];
      if (options.parentUrl) {
        return `${path
          .dirname(options.parentUrl.split('.').join('/'))
          .split('/')
          .join('.')}.${kindAlias}.${reflection.name.replace(/\//, '_')}.md`;
      }
      const friendlyName = `${reflection.name.replace(/\//, '_')}.md`;
      return reflection.kindOf(ReflectionKind.Module)
        ? friendlyName
        : `${kindAlias}.${friendlyName}`;
    }

    let alias = reflection.getAlias().replace(/^_/, '');

    /** CSDK START */
    // TypeDoc checks and adds a suffix '-#' to an alias if it's a duplicate across all modules
    // This is not what we want as some alias may be the same across modules, so we remove the prefix
    alias = alias.replace(/-\d+$/, '');
    /** CSDK END */

    const parentDir = options.parentUrl
      ? path.dirname(options.parentUrl)
      : null;

    const dir = () => {
      if (reflection.kindOf(ReflectionKind.Namespace)) {
        if (!this.options.getValue('excludeGroups')) {
          return this.getPartName(
            `${options.directory}/${this.getPartName(
              'namespace.' + alias,
              options.pagePosition,
            )}`,
            options.directoryPosition,
          );
        }
        return this.getPartName(alias, options.pagePosition);
      }

      if (
        options.directory &&
        this.options.getValue('excludeGroups') &&
        !options.forceDirectory
      ) {
        return null;
      }

      if (reflection.kindOf(ReflectionKind.Module)) {
        if (path.parse(this.options.getValue('entryFileName')).name === alias) {
          return this.options.getValue('skipIndexPage') &&
            this.options.getValue('readme').endsWith('none')
            ? alias
            : this.getPartName(`module.${alias}`, options.pagePosition);
        }
        return this.getPartName(alias, options.pagePosition);
      }

      return options.directory
        ? this.getPartName(options.directory, options.directoryPosition)
        : `${this.getPartName(
            slugify(ReflectionKind.singularString(reflection.kind)),
            options.pagePosition,
          )}.${alias}`;
    };

    const filename = () => {
      if (
        reflection.kindOf([ReflectionKind.Module, ReflectionKind.Namespace]) &&
        this.options.getValue('outputFileStrategy') ===
          OutputFileStrategy.Modules &&
        !this.childrenIncludeNamespaces(reflection)
      ) {
        return null;
      }
      if (
        reflection.kindOf([ReflectionKind.Module, ReflectionKind.Namespace])
      ) {
        return path.parse(this.options.getValue('entryFileName') as string)
          .name;
      }

      return `${this.getPartName(
        slugify(ReflectionKind.singularString(reflection.kind)),
        options.pagePosition,
      )}.${alias}`;
    };

    return (
      [parentDir, dir(), filename()].filter((part) => Boolean(part)).join('/') +
      '.md'
    );
  }

  private applyAnchorUrl(
    reflection: DeclarationReflection,
    container: Reflection,
  ) {
    if (container.url) {
      if (!reflection.kindOf(ReflectionKind.TypeLiteral)) {
        const anchorPrefix = this.options.getValue('anchorPrefix');
        const anchorId = this.getAnchorId(reflection);

        if (anchorId) {
          if (!this.anchors[container.url]) {
            this.anchors[container.url] = [];
          }

          this.anchors[container.url].push(anchorId);

          const count = this.anchors[container.url]?.filter(
            (id) => id === anchorId,
          )?.length;

          const anchorParts = [anchorId];

          if (count > 1) {
            anchorParts.push(`-${count}`);
          }

          if (anchorPrefix) {
            anchorParts.unshift(`${anchorPrefix}`);
          }

          reflection.url = container.url + '#' + anchorParts.join('');
          reflection.anchor = anchorParts.join('');
        }
      }
      reflection.hasOwnDocument = false;
    }
    if (reflection.parent) {
      reflection.traverse((child) => {
        if (child instanceof DeclarationReflection) {
          this.applyAnchorUrl(child, container);
        }
      });
    }
  }

  private getAnchorId(reflection: DeclarationReflection) {
    const preserveAnchorCasing = this.options.getValue(
      'preserveAnchorCasing',
    ) as boolean;

    const anchorName = this.getAnchorName(reflection);

    if (anchorName) {
      return preserveAnchorCasing ? anchorName : anchorName.toLowerCase();
    }

    return null;
  }

  private getAnchorName(reflection: DeclarationReflection) {
    const namedAnchors = this.options.getValue('namedAnchors');
    const propertiesTableStyle =
      this.options.getValue('propertiesFormat') === 'table';

    if (!namedAnchors) {
      if (reflection.kindOf(ReflectionKind.Property) && propertiesTableStyle) {
        return null;
      }
    }
    return reflection.name;
  }

  private getPartName(part: string, position: number) {
    return this.options.getValue('includeFileNumberPrefixes')
      ? `${String(position).padStart(2, '0')}-${part}`
      : part;
  }

  private childrenIncludeNamespaces(reflection: DeclarationReflection) {
    return reflection.children?.some((child) =>
      child.kindOf(ReflectionKind.Namespace),
    );
  }

  /**
   * Returns the template mapping for a given reflection kind
   * @param kind
   */
  private getTemplateMapping(kind: ReflectionKind): TemplateMapping {
    const getDirectoryName = (reflectionKind: ReflectionKind) => {
      const pluralString = ReflectionKind.pluralString(reflectionKind);
      return this.options.getValue('includeFileNumberPrefixes')
        ? pluralString
        : slugify(pluralString);
    };

    const outputFileStrategy = this.options.getValue('outputFileStrategy');

    const mappings = {
      [ReflectionKind.Module]: {
        template: this.theme.reflectionTemplate,
        directory: null,
        kind: ReflectionKind.Module,
      },
      [ReflectionKind.Namespace]: {
        template: this.theme.reflectionTemplate,
        directory: getDirectoryName(ReflectionKind.Namespace),
        kind: ReflectionKind.Namespace,
      },
    };

    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Class] = {
        template: this.theme.reflectionTemplate,
        directory: getDirectoryName(ReflectionKind.Class),
        kind: ReflectionKind.Class,
      };
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Interface] = {
        isLeaf: false,
        template: this.theme.reflectionTemplate,
        directory: getDirectoryName(ReflectionKind.Interface),
        kind: ReflectionKind.Interface,
      };
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Enum] = {
        template: this.theme.reflectionTemplate,
        directory: getDirectoryName(ReflectionKind.Enum),
        kind: ReflectionKind.Enum,
      };
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Function] = {
        template: this.theme.memberTemplate,
        directory: getDirectoryName(ReflectionKind.Function),
        kind: ReflectionKind.Function,
      };
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.TypeAlias] = {
        template: this.theme.memberTemplate,
        directory: getDirectoryName(ReflectionKind.TypeAlias),
        kind: ReflectionKind.TypeAlias,
      };
    }
    if (outputFileStrategy === OutputFileStrategy.Members) {
      mappings[ReflectionKind.Variable] = {
        template: this.theme.memberTemplate,
        directory: getDirectoryName(ReflectionKind.Variable),
        kind: ReflectionKind.Variable,
      };
    }
    return mappings[kind];
  }
}
