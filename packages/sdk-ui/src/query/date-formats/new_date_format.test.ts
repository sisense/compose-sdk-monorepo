import { newDateFormat } from './new_date_format';

it('replaces text with a static string replacement (replace single character with multiple)', () => {
  const dateFormat = newDateFormat('EaEa', 'a', function () {
    return '__';
  });
  expect(dateFormat).toBe('E__E__');
});

it('replaces text with a static string replacement (replace multiple characters with single)', () => {
  const dateFormat = newDateFormat('aaaaBCaDaaEa', 'aa', function () {
    return 'x';
  });
  expect(dateFormat).toBe('xxBCaDxEa');
});

it('replaces text with a static string replacement, using a RegExp `|` boolean OR condition as the searchText', () => {
  const dateFormat = newDateFormat('yyypABCypyp', 'yp|yyyp', function () {
    return 'xz';
  });
  expect(dateFormat).toBe('xzABCxzxz');
});

it('replaces text regardless of the searchText boolean `|` OR condition order', () => {
  const dateFormat = newDateFormat('yyypABCypyp', 'yyyp|yp', function () {
    return 'xz';
  });
  expect(dateFormat).toBe('xzABCxzxz');
});

it('replaces text, by using the matched text', () => {
  const dateFormat = newDateFormat('yyypABCyp', 'yp|yyyp', function (match: string) {
    return String(match.length);
  });
  expect(dateFormat).toBe('4ABC2');
});

it('returns the original date format when no match is found', () => {
  const dateFormat = newDateFormat('Ea', 'b', function () {
    return '_';
  });
  expect(dateFormat).toBe('Ea');
});

it('returns the original date format when the search text is empty', () => {
  const dateFormat = newDateFormat('Ea', '', function () {
    return '_';
  });
  expect(dateFormat).toBe('Ea');
});

it('does not replace search text that is contained inside single quotes', () => {
  const dateFormat = newDateFormat("'EEE'", 'EEE', function () {
    return '_';
  });
  expect(dateFormat).toBe("'EEE'");
});
