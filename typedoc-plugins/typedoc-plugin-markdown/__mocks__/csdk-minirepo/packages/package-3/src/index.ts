export interface CallableInterface {
  (): string;
}

export interface IndexableInterface {
  [index: number]: string;
}

export interface Animal {
  name?: string;
}

/**
 * Description of Dog
 *
 * @beta
 */
export interface Dog extends Animal {
  /**
   * Breed of dog
   *
   * @beta
   */
  breed: string;

  /**
   * @category Old Stuff (Deprecated)
   * @deprecated Use {@link Dog.breed} instead.
   */
  nickName: string;
}

export interface SomeProps {
  prop1: string;
  prop2: string;
  prop3: string;
}

/**
 * Some config
 *
 * @default []
 */
export interface SomeConfig extends SomeProps {
  /**
   * Comments
   */
  callbacks?: SomeProps & {
    authorized?: (params: { request: boolean; auth: string }) => string;
  };
}

export interface SomePropInterface {
  prop: string;
}

/**
 * This is a function with multiple arguments and a return value.
 *
 * @example
 *
 * ```ts
 * const example=true;
 * ```
 *
 * @param paramZ - This is a string parameter.
 * @param paramG - This is a parameter with intersection type literal.
 * @param paramA
 *   This is a **parameter** pointing to an interface.
 * @returns This is a numeric return value.
 * @beta
 *
 */
export function betaFunction(
  paramZ: string,
  paramG: { prop: string } & { prop: number },
  paramA: SomePropInterface,
): number {
  return 0;
}

/**
 * This is a function that is assigned to a variable.
 *
 * @param someParam  This is some numeric parameter.
 * @returns This is a numeric return value.
 * @alpha
 */
export const alphaFunction = (someParam: number) => {
  return 0;
};

/**
 * This is a function that is assigned to a variable.
 *
 * @param someParam  This is some numeric parameter.
 * @returns This is a numeric return value.
 * @category Some Category
 */
export const someFunction = (someParam: number) => {
  return 0;
};
