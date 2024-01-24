type ZipTuples<Keys extends readonly any[], Values extends readonly any[]> = {
  [K in keyof Keys]: [Keys[K], K extends keyof Values ? Values[K] : never];
};

type ZipTuplesAsObject<Keys extends readonly PropertyKey[], Values extends readonly any[]> = {
  [T in ZipTuples<Keys, Values>[number] as T[0]]: T[1];
};

/** @internal */
export type ArgumentsAsObject<
  Fn extends ((...params: readonly any[]) => any) | undefined,
  Keys extends readonly PropertyKey[],
> = ZipTuplesAsObject<Keys, Parameters<NonNullable<Fn>>>;

/** @internal */
export type Arguments<T extends ((...args: any[]) => void) | undefined> = Parameters<
  NonNullable<T>
>;
