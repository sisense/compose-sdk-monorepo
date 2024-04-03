import * as path from 'path';
import { Options, Reflection } from 'typedoc';
import { MarkdownPageEvent } from '../plugin/events';

/* start_imports */
import { breadcrumbs } from './resources/partials/breadcrumbs';
import { commentParts } from './resources/partials/comment.parts';
import { comment } from './resources/partials/comment';
import { footer } from './resources/partials/footer';
import { header } from './resources/partials/header';
import { pageIndex } from './resources/partials/index.page';
import { reflectionIndex } from './resources/partials/index.reflection';
import { declarationMemberAccessor } from './resources/partials/member.declaration.accessort';
import { declarationMemberIdentifier } from './resources/partials/member.declaration.identifier';
import { declarationMember } from './resources/partials/member.declaration';
import { memberHierarchy } from './resources/partials/member.hierarchy';
import { indexSignatureTitle } from './resources/partials/member.indexsignature.title';
import { inheritance } from './resources/partials/member.inheritance';
import { referenceMember } from './resources/partials/member.reference';
import { reflectionMember } from './resources/partials/member.reflection';
import { signatureMemberIdentifier } from './resources/partials/member.signature.identifier';
import { signatureMember } from './resources/partials/member.signature';
import { sources } from './resources/partials/member.sources';
import { memberTitle } from './resources/partials/member.title';
import { memberBadge } from './resources/partials/member.badge';
import { member } from './resources/partials/member';
import { typeDeclarationMember } from './resources/partials/member.type-declaration';
import { members } from './resources/partials/members';
import { navigation } from './resources/partials/navigation';
import { pageTitle } from './resources/partials/page.title';
import { enumMembersTable } from './resources/partials/table.enum-members';
import { parametersTable } from './resources/partials/table.parameters';
import { propertiesTable } from './resources/partials/table.properties';
import { typeParametersTable } from './resources/partials/table.typeparameters';
import { arrayType } from './resources/partials/type.array';
import { conditionalType } from './resources/partials/type.conditional';
import { declarationType } from './resources/partials/type.declaration';
import { functionType } from './resources/partials/type.function';
import { indexAccessType } from './resources/partials/type.index-access';
import { inferredType } from './resources/partials/type.inferred';
import { intersectionType } from './resources/partials/type.intersection';
import { intrinsicType } from './resources/partials/type.intrinsic';
import { literalType } from './resources/partials/type.literal';
import { namedTupleType } from './resources/partials/type.named-tuple';
import { queryType } from './resources/partials/type.query';
import { referenceType } from './resources/partials/type.reference';
import { reflectionType } from './resources/partials/type.reflection';
import { someType } from './resources/partials/type.some';
import { tupleType } from './resources/partials/type.tuple';
import { typeOperatorType } from './resources/partials/type.type-operator';
import { unionType } from './resources/partials/type.union';
import { unknownType } from './resources/partials/type.unknown';
import { memberTemplate } from './resources/templates/member';
import { projectKindTemplate } from './resources/templates/project-kind';
import { projectTemplate } from './resources/templates/project';
import { readmeTemplate } from './resources/templates/read-me';
import { reflectionTemplate } from './resources/templates/reflection';
/* end_imports */

function bind<F, L extends any[], R>(fn: (f: F, ...a: L) => R, first: F) {
  return (...r: L) => fn(first, ...r);
}

/**
 * The render context of the {@link MarkdownTheme}.
 * This follows the implementation of TypeDocs [DefaultThemeRenderContext](https://typedoc.org/api/classes/DefaultThemeRenderContext.html)
 */
export class MarkdownThemeRenderContext {
  constructor(
    public page: MarkdownPageEvent<Reflection> | null,
    public options: Options,
  ) {}

  urlTo = (reflection: Reflection) => {
    return this.relativeURL(reflection.url);
  };

  relativeURL = (url: string | undefined) => {
    const URL_PREFIX = /^(http|ftp)s?:\/\//;
    if (!url) {
      return null;
    }
    if (URL_PREFIX.test(url)) {
      return url;
    } else {
      const relative = path.relative(
        path.dirname(this.page?.url || '.'),
        path.dirname(url),
      );
      return this.parseUrl(
        path.join(relative, path.basename(url)).replace(/\\/g, '/'),
      );
    }
  };

  parseUrl(url: string) {
    return encodeURI(url);
  }

  /* start_resources */

  // templates
  /** @hidden */
  memberTemplate = bind(memberTemplate, this);
  /** @hidden */
  projectKindTemplate = bind(projectKindTemplate, this);
  /** @hidden */
  projectTemplate = bind(projectTemplate, this);
  /** @hidden */
  readmeTemplate = bind(readmeTemplate, this);
  /** @hidden */
  reflectionTemplate = bind(reflectionTemplate, this);

  // partials
  /** @hidden */
  breadcrumbs = bind(breadcrumbs, this);
  /** @hidden */
  commentParts = bind(commentParts, this);
  /** @hidden */
  comment = bind(comment, this);
  /** @hidden */
  footer = bind(footer, this);
  /** @hidden */
  header = bind(header, this);
  /** @hidden */
  pageIndex = bind(pageIndex, this);
  /** @hidden */
  reflectionIndex = bind(reflectionIndex, this);
  /** @hidden */
  declarationMemberAccessor = bind(declarationMemberAccessor, this);
  /** @hidden */
  declarationMemberIdentifier = bind(declarationMemberIdentifier, this);
  /** @hidden */
  declarationMember = bind(declarationMember, this);
  /** @hidden */
  memberHierarchy = bind(memberHierarchy, this);
  /** @hidden */
  indexSignatureTitle = bind(indexSignatureTitle, this);
  /** @hidden */
  inheritance = bind(inheritance, this);
  /** @hidden */
  referenceMember = bind(referenceMember, this);
  /** @hidden */
  reflectionMember = bind(reflectionMember, this);
  /** @hidden */
  signatureMemberIdentifier = bind(signatureMemberIdentifier, this);
  /** @hidden */
  signatureMember = bind(signatureMember, this);
  /** @hidden */
  sources = bind(sources, this);
  /** @hidden */
  memberTitle = bind(memberTitle, this);
  /** CSDK START */
  /** @hidden */
  memberBadge = bind(memberBadge, this);
  /** CSDK END */
  /** @hidden */
  member = bind(member, this);
  /** @hidden */
  typeDeclarationMember = bind(typeDeclarationMember, this);
  /** @hidden */
  members = bind(members, this);
  /** @hidden */
  navigation = bind(navigation, this);
  /** @hidden */
  pageTitle = bind(pageTitle, this);
  /** @hidden */
  enumMembersTable = bind(enumMembersTable, this);
  /** @hidden */
  parametersTable = bind(parametersTable, this);
  /** @hidden */
  propertiesTable = bind(propertiesTable, this);
  /** @hidden */
  typeParametersTable = bind(typeParametersTable, this);
  /** @hidden */
  arrayType = bind(arrayType, this);
  /** @hidden */
  conditionalType = bind(conditionalType, this);
  /** @hidden */
  declarationType = bind(declarationType, this);
  /** @hidden */
  functionType = bind(functionType, this);
  /** @hidden */
  indexAccessType = bind(indexAccessType, this);
  /** @hidden */
  inferredType = bind(inferredType, this);
  /** @hidden */
  intersectionType = bind(intersectionType, this);
  /** @hidden */
  intrinsicType = bind(intrinsicType, this);
  /** @hidden */
  literalType = bind(literalType, this);
  /** @hidden */
  namedTupleType = bind(namedTupleType, this);
  /** @hidden */
  queryType = bind(queryType, this);
  /** @hidden */
  referenceType = bind(referenceType, this);
  /** @hidden */
  reflectionType = bind(reflectionType, this);
  /** @hidden */
  someType = bind(someType, this);
  /** @hidden */
  tupleType = bind(tupleType, this);
  /** @hidden */
  typeOperatorType = bind(typeOperatorType, this);
  /** @hidden */
  unionType = bind(unionType, this);
  /** @hidden */
  unknownType = bind(unknownType, this);
  /* end_resources */
}
