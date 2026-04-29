import { DeclarationReflection, ReflectionKind } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { backTicks, bold } from '../../../support/elements';
import { escapeChars, stripComments, stripLineBreaks } from '../../../support/utils';
import { getDeclarationType, getModifier } from '../../helpers';

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

  const modifier = getModifier(reflection);

  if (modifier) {
    md.push(bold(backTicks(modifier.toLowerCase())));
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
    const useEncodedBrackets = context.options.getValue('useHTMLEncodedBrackets') as boolean;
    name.push(
      bold(
        reflection.name.startsWith('<') ? backTicks(reflection.name) : escapeChars(reflection.name, useEncodedBrackets),
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
      `${context.getAngleBracket('open')}${reflection.typeParameters
        ?.map((typeParameter) => backTicks(typeParameter.name))
        .join(', ')}${context.getAngleBracket('close')}`,
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
