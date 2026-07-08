import ColorRuntime from 'colorjs.io';

/*
 * colorjs.io@0.4.x ships its `Color` class type split across `types/src/color.d.ts` (the base class)
 * and a module augmentation in `types/src/index.d.ts` (the static `range`/`mix`/`steps` helpers).
 * TypeScript 5.5 tightened the merging of default-exported classes, so resolving the package's
 * default export — through any entry point, including the base file directly — collapses `Color` to
 * an empty shape (`new Color(x)` -> "Expected 0 arguments"; instance members and statics missing).
 *
 * This facade restates the small slice of the `Color` API that sdk-ui uses and exposes it as a thin
 * subclass of the real runtime class, so a single `Color` declaration is both a value and a type (no
 * companion redeclaration). Behavior is byte-for-byte unchanged: the subclass adds nothing and we
 * deliberately stay on colorjs.io 0.4.x because 0.6.x changes the default interpolation color space
 * and visibly shifts chart range-coloring. `range`/`mix`/`steps` return colorjs.io's plain color
 * object (not `Color`), matching the library's real return types so existing call sites still cast
 * their results to `Color`. The cast on the base expression is the only assertion needed to bridge
 * the collapsed package type to this restated one.
 */

/** colorjs.io color-space coordinate accessor: indexable by channel name and by index. */
type SpaceAccessor = Record<string, number> & number[];

/** Minimal shape of the plain color object returned by colorjs.io `range`/`mix`/`steps`. */
interface PlainColor {
  space: unknown;
  coords: number[];
  alpha: number;
}

interface ColorInstance {
  alpha: number;
  hsl: SpaceAccessor;
  hsv: SpaceAccessor;
  srgb: SpaceAccessor;
  set(property: string, value: number): ColorInstance;
  to(space: string): ColorInstance;
  toString(options?: { format?: string }): string;
}

type ColorInput = string | ColorInstance | PlainColor;

interface ColorRangeOptions {
  space?: string;
  outputSpace?: string;
}

interface ColorConstructor {
  new (color: ColorInput): ColorInstance;
  range(
    color1: ColorInput,
    color2: ColorInput,
    options?: ColorRangeOptions,
  ): (percentage: number) => PlainColor;
  mix(
    color1: ColorInput,
    color2: ColorInput,
    ratio?: number,
    options?: ColorRangeOptions,
  ): PlainColor;
  steps(
    color1: ColorInput,
    color2: ColorInput,
    options?: ColorRangeOptions & { steps?: number },
  ): PlainColor[];
}

export class Color extends (ColorRuntime as unknown as ColorConstructor) {}
