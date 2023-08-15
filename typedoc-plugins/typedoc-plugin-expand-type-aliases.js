//@ts-check

// Supports: typedoc@0.23

// Temporary solution until a formal plugin is created
// References:
// https://github.com/TypeStrong/typedoc/issues/1258
// https://github.com/TypeStrong/typedoc/issues/1696
// https://github.com/TypeStrong/typedoc/issues/521

const {
  Converter,
  ReflectionKind,
  TypeScript: ts,
  UnknownType,
} = require('typedoc');

/** @param {import("typedoc").Application} param0 */
exports.load = function ({ application }) {
  const printer = ts.createPrinter();

  /** @type {Map<import("typedoc").DeclarationReflection, UnknownType>} */
  const typeOverrides = new Map();

  application.converter.on(
    Converter.EVENT_CREATE_DECLARATION,
    /**
     *
     * @param {import("typedoc/dist/lib/converter/context").Context} context
     * @param {import("typedoc").DeclarationReflection} reflection
     */
    (context, reflection) => {
      const node =
        context.project.getSymbolFromReflection(reflection)?.declarations?.[0];

      if (reflection.kind === ReflectionKind.TypeAlias && node) {
        if (reflection.comment?.getTag('@expandType')) {
          reflection.comment.removeTags('@expandType');

          const type = context.checker.getTypeAtLocation(node);
          const typeNode = context.checker.typeToTypeNode(
            type,
            node.getSourceFile(),
            ts.NodeBuilderFlags.InTypeAlias,
          );

          typeOverrides.set(
            reflection,
            new UnknownType(
              printer.printNode(
                ts.EmitHint.Unspecified,
                typeNode,
                node.getSourceFile(),
              ),
            ),
          );
        }
      }
    },
  );

  application.converter.on(Converter.EVENT_RESOLVE_BEGIN, () => {
    for (const [refl, type] of typeOverrides) {
      refl.type = type;
    }
    typeOverrides.clear();
  });
};
