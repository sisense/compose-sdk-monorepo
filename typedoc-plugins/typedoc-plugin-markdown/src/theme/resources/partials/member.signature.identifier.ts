import { ParameterReflection, SignatureReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { backTicks, bold } from '../../../support/elements';
import { escapeChars } from '../../../support/utils';

/**
 * @category Partials
 */
export function signatureMemberIdentifier(
  context: MarkdownThemeRenderContext,
  signature: SignatureReflection,
): string {
  const md: string[] = [];

  if (signature.parent?.getSignature) {
    md.push('get ');
  }

  if (signature.parent?.setSignature) {
    md.push('set ');
  }

  // if (signature.parent && signature.parent.flags?.length > 0) {
  //   md.push(signature.parent.flags.map((flag) => `\`${flag.toLowerCase()}\``).join(' ') + ' ');
  // }

  if (!['__call', '__type'].includes(signature.name)) {
    md.push(bold(escapeChars(signature.name)));
  }

  if (signature.typeParameters) {
    md.push(
      `<${signature.typeParameters
        .map((typeParameter) => backTicks(typeParameter.name))
        .join(', ')}>`,
    );
  }

  const getParameters = (parameters: ParameterReflection[] = []) => {
    const firstOptionalParamIndex = parameters.findIndex((parameter) => parameter.flags.isOptional);
    return parameters
      .map((param, i) => {
        const paramsmd: string[] = [parameters.length > 2 ? '\n  ' : ''];
        if (param.flags.isRest) {
          paramsmd.push('...');
        }
        const paramItem = `${backTicks(param.name)}${
          param.flags.isOptional || (firstOptionalParamIndex !== -1 && i > firstOptionalParamIndex)
            ? '?'
            : ''
        }`;
        paramsmd.push(paramItem);
        if (param.defaultValue) {
          paramsmd.push(` = ${backTicks(param.defaultValue)}`);
        }
        return paramsmd.join('');
      })
      .join(`,${parameters.length > 2 ? '' : ' '}`);
  };

  /** CSDK START */
  // hide function parameters based on configuration
  const shownParameters = signature.parameters
    ? signature.parameters.filter((param: any) => {
        const hiddenFunctionParameters =
          (context.options.getValue('hiddenFunctionParameters') as string[]) || [];
        return !hiddenFunctionParameters.includes(param.name);
      })
    : [];

  md.push(shownParameters.length > 0 ? `(${getParameters(shownParameters)})` : '()');
  /** CSDK END */

  if (signature.type) {
    md.push(`: ${context.someType(signature.type, true)}`);
  }

  return md.join('');
}
