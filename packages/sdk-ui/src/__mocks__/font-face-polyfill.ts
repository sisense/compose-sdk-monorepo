// Polifill for FontFace class to avoid error in tests
// https://developer.mozilla.org/en-US/docs/Web/API/FontFace

export class FontFaceMock {
  family: string;

  source: string;

  descriptors: unknown;

  constructor(family: string, source: string, descriptors?: unknown) {
    this.family = family;
    this.source = source;
    this.descriptors = descriptors;
  }

  load(): Promise<FontFaceMock> {
    return Promise.resolve(this);
  }
}

globalThis.FontFace = FontFaceMock as never;
