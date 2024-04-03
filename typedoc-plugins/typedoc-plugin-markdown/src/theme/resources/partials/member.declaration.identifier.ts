import { DeclarationReflection, ReflectionKind } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { backTicks, bold } from '../../../support/elements';
import {
  escapeChars,
  stripComments,
  stripLineBreaks,
} from '../../../support/utils';
import { getDeclarationType } from '../../helpers';

/**
 * @category Partials
 */
export function declarationMemberIdentifier(
  context: MarkdownThemeRenderContext,
  reflection: DeclarationReflection,
): string {
  const md: string[] = [];

  const useCodeBlocks = context.options.getValue('identifiersAsCodeBlocks');

  const declarationType = getDeclarationType(reflection);

  if (
    reflection.flags?.length &&
    !reflection.flags.isRest &&
    !reflection.flags.isOptional
  ) {
    md.push(
      reflection.flags
        .map((flag) => bold(backTicks(flag.toLowerCase())))
        .join(' '),
    );
  }

  if (reflection.kindOf(ReflectionKind.Variable) && !reflection.flags.isConst) {
    md.push(backTicks('let'));
  }

  if (reflection.flags.isRest) {
    md.push('...');
  }

  const name: string[] = [];

  if (Boolean(reflection.getSignature || Boolean(reflection.setSignature))) {
    name.push(context.declarationMemberAccessor(reflection));
  } else {
    name.push(
      bold(
        reflection.name.startsWith('<')
          ? backTicks(reflection.name)
          : escapeChars(reflection.name),
      ),
    );
  }

  if (reflection.flags.isOptional) {
    name.push('?');
  }

  if (declarationType) {
    name.push(':');
  }

  md.push(name.join(''));

  if (reflection.typeParameters) {
    md.push(
      `<${reflection.typeParameters
        ?.map((typeParameter) => backTicks(typeParameter.name))
        .join(', ')}>`,
    );
  }

  if (declarationType) {
    md.push(`${context.someType(declarationType, !useCodeBlocks)}`);
  }

  if (reflection.defaultValue && reflection.defaultValue !== '...') {
    md.push(`= \`${stripLineBreaks(stripComments(reflection.defaultValue))}\``);
  }

  return md.join(' ');
}
