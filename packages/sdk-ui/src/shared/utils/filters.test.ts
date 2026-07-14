import { createAttribute, DimensionalLevelAttribute } from '@sisense/sdk-data';
import type { Attribute } from '@sisense/sdk-data';
import { describe, expect, it } from 'vitest';

import { isSameAttribute } from './filters.js';

/**
 * FilterWidget↔filter identity-key contract vectors.
 *
 * MIRRORED in PrismWebClient:
 * `tests/unit_tests/specs/dashboarding/filterwidget.module/services/filterWidgetIdentity.test.js`
 *
 * Fusion derives the linked filter by `dimLevelKey(jaql)` = `dim|level|bucket`;
 * CSDK derives it by `isSameAttribute` (expression + granularity, where granularity
 * encodes level AND minute bucket via `translateJaqlToGranularity`). Both matchers
 * must agree on every vector — an edit that breaks a vector in either repo means
 * the two derivations have silently diverged. Keep the tables in sync.
 */
const DATE_DIM = '[Commerce.Date (Calendar)]';

type JaqlVector = { dim: string; level?: string; bucket?: string };

const IDENTITY_VECTORS: ReadonlyArray<{
  name: string;
  a: JaqlVector;
  b: JaqlVector;
  same: boolean;
}> = [
  {
    name: 'same plain dim',
    a: { dim: '[Country.Country]' },
    b: { dim: '[Country.Country]' },
    same: true,
  },
  {
    name: 'different dim',
    a: { dim: '[Country.Country]' },
    b: { dim: '[Brand.Brand]' },
    same: false,
  },
  {
    name: 'same dim and level',
    a: { dim: DATE_DIM, level: 'years' },
    b: { dim: DATE_DIM, level: 'years' },
    same: true,
  },
  {
    name: 'same dim, different level',
    a: { dim: DATE_DIM, level: 'years' },
    b: { dim: DATE_DIM, level: 'months' },
    same: false,
  },
  {
    name: 'level vs no level',
    a: { dim: DATE_DIM, level: 'years' },
    b: { dim: DATE_DIM },
    same: false,
  },
  {
    name: 'same minute bucket',
    a: { dim: DATE_DIM, level: 'minutes', bucket: '15' },
    b: { dim: DATE_DIM, level: 'minutes', bucket: '15' },
    same: true,
  },
  {
    name: 'different minute bucket',
    a: { dim: DATE_DIM, level: 'minutes', bucket: '15' },
    b: { dim: DATE_DIM, level: 'minutes', bucket: '30' },
    same: false,
  },
];

/** Builds an Attribute from a Fusion-style jaql the same way runtime translation does. */
function attributeFromJaql(jaql: JaqlVector): Attribute {
  const granularity = jaql.level
    ? DimensionalLevelAttribute.translateJaqlToGranularity(jaql)
    : undefined;
  return createAttribute({
    name: jaql.dim,
    expression: jaql.dim,
    type: jaql.level ? 'datelevel' : 'text',
    ...(granularity ? { granularity } : {}),
  });
}

describe('isSameAttribute — identity-key contract vectors (mirrored in PWC)', () => {
  IDENTITY_VECTORS.forEach(({ name, a, b, same }) => {
    it(`${name} → ${same ? 'same' : 'different'} key`, () => {
      expect(isSameAttribute(attributeFromJaql(a), attributeFromJaql(b))).toBe(same);
    });
  });
});
