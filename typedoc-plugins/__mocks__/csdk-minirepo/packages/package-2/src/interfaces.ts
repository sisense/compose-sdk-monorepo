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
