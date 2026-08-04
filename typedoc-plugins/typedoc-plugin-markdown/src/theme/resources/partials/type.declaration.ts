import { DeclarationReflection, SomeType } from 'typedoc';

import { MarkdownThemeRenderContext } from '../..';
import { backTicks } from '../../../support/elements';
import { getDeclarationType } from '../../helpers';

/**
 * @category Partials
 */
export function declarationType(
  context: MarkdownThemeRenderContext,
  declarationReflection: DeclarationReflection,
  collapse = false,
): string {
  if (collapse) {
    return backTicks('object');
  }

  if (declarationReflection.indexSignatures || declarationReflection.children) {
    let indexSignature = '';
    const declarationIndexSignatures = declarationReflection.indexSignatures;
    if (declarationIndexSignatures?.length) {
      const key = declarationIndexSignatures[0].parameters
        ? declarationIndexSignatures[0].parameters.map(
            (param) => `\`[${param.name}: ${param.type}]\``,
          )
        : '';
      const obj = context.someType(declarationIndexSignatures[0].type as SomeType);
      indexSignature = `${key}: ${obj}; `;
    }

    const types =
      declarationReflection.children &&
      declarationReflection.children.map((obj, index) => {
        const name: string[] = [];
        if (Boolean(obj.getSignature || Boolean(obj.setSignature))) {
          name.push(context.declarationMemberAccessor(obj));
        } else {
          // Carry the optionality marker through, otherwise an inline object type renders
          // `color`: `string` for a `color?: string` member and reads as required.
          name.push(backTicks(`${obj.name}${obj.flags.isOptional ? '?' : ''}`));
        }

        const theType = getDeclarationType(obj) as SomeType;

        const typeString = context.someType(theType);

        return `${name.join(' ')}: ${indentBlock(typeString)};\n `;
      });

    if (indexSignature) {
      types?.unshift(indexSignature);
    }
    return types ? `\\{\n  ${types.join(' ')}}` : '\\{}';
  }
  return '\\{}';
}

function indentBlock(content: string) {
  const lines = content.split('\n');
  return lines
    .filter((line) => Boolean(line.length))
    .map((line, i) => {
      if (i === 0) {
        return line;
      }
      if (i === lines.length - 1) {
        return ` ${line}`;
      }
      return `  ${line}`;
    })
    .join('\n');
}
