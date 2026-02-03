/**
 * Context-based transformer type for pure functional transformations
 */
export type ContextfulTransformer<T, C = void> = (ctx: C) => (input: Readonly<T>) => T;

/**
 * Contextless transformer type for pure functional transformations
 */
export type Transformer<T> = (input: Readonly<T>) => T;
