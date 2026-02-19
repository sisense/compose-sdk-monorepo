import { Arg, FunctionCall } from './types.js';

/**
 * Splits a string by a delimiter, respecting nested structures and strings.
 * Does not split inside parentheses, brackets, braces, or quoted strings.
 *
 * @param str - The string to split
 * @param delimiter - Character to split on (e.g. ',' or ':')
 * @returns Array of trimmed segments
 * @internal
 */
function splitAtDepthZero(str: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = '';
  let depth = 0;
  let inString = false;
  let stringChar: string | null = null;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        current += char;
        continue;
      }
      if ('([{'.includes(char)) depth++;
      if (')]}'.includes(char)) depth--;
      if (char === delimiter && depth === 0) {
        result.push(current.trim());
        current = '';
        continue;
      }
    } else {
      if (char !== stringChar) {
        current += char;
        continue;
      }
      if (nextChar === stringChar) {
        current += char + nextChar;
        i++; // consume escaped quote (for loop will increment again)
        continue;
      }
      inString = false;
      stringChar = null;
      current += char;
      continue;
    }

    current += char;
  }

  if (current.trim()) result.push(current.trim());
  return result;
}

/**
 * Returns the index of the first occurrence of delimiter at depth 0, or -1.
 *
 * @param str - The string to search
 * @param delimiter - Character to find
 * @returns Index of delimiter, or -1
 * @internal
 */
function findDelimiterAtDepthZero(str: string, delimiter: string): number {
  let depth = 0;
  let inString = false;
  let stringChar: string | null = null;

  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    const nextChar = str[i + 1];

    if (!inString) {
      if (char === "'" || char === '"') {
        inString = true;
        stringChar = char;
        continue;
      }
      if ('([{'.includes(char)) depth++;
      if (')]}'.includes(char)) depth--;
      if (char === delimiter && depth === 0) return i;
    } else {
      if (char !== stringChar) continue;
      if (nextChar === stringChar) {
        i++;
        continue;
      }
      inString = false;
      stringChar = null;
    }
  }
  return -1;
}

/**
 * Removes surrounding single or double quotes from a string if present.
 *
 * @param key - The string to unquote
 * @returns Unquoted string
 * @internal
 */
function unquote(key: string): string {
  if ((key.startsWith("'") && key.endsWith("'")) || (key.startsWith('"') && key.endsWith('"'))) {
    return key.slice(1, -1);
  }
  return key;
}

/**
 * Parses a composeCode string to FunctionCall format.
 *
 * Handles function calls like:
 * - "measureFactory.sum(DM.Commerce.Revenue, 'Total Revenue')"
 * - "filterFactory.members(DM.Commerce.Date.Years, ['2024-01-01T00:00:00'], { excludeMembers: true })"
 * - "filterFactory.logic.and(filterFactory.members(...), filterFactory.members(...))"
 *
 * @param composeCode - The composeCode string to parse
 * @returns FunctionCall representation
 * @throws Error if composeCode cannot be parsed
 * @internal
 */
export function parseComposeCodeToFunctionCall(composeCode: string): FunctionCall {
  if (!composeCode || typeof composeCode !== 'string') {
    throw new Error(`Invalid composeCode: expected non-empty string, got ${typeof composeCode}`);
  }

  const trimmed = composeCode.trim();
  if (!trimmed) {
    throw new Error('Invalid composeCode: empty string');
  }

  // Parse function call: functionName(args...)
  const match = trimmed.match(/^([a-zA-Z_$][a-zA-Z0-9_.$]*)\s*\((.*)\)$/);
  if (!match) {
    throw new Error(`Invalid composeCode format: expected function call, got "${trimmed}"`);
  }

  const functionName = match[1];
  const argsString = match[2];

  const args = parseArguments(argsString);

  return {
    function: functionName,
    args,
  };
}

/**
 * Parses function arguments from a string.
 *
 * @param argsString - The arguments string (without outer parentheses)
 * @returns Array of parsed arguments
 * @internal
 */
function parseArguments(argsString: string): Arg[] {
  if (!argsString.trim()) return [];
  return splitAtDepthZero(argsString, ',').map(parseArgumentValue);
}

/**
 * Parses a single argument value.
 *
 * @param value - The argument value string
 * @returns Parsed argument value
 * @internal
 */
function parseArgumentValue(value: string): Arg {
  if (!value) {
    throw new Error('Cannot parse empty argument value');
  }

  // Handle null
  if (value === 'null') {
    return null as unknown as Arg;
  }

  // Handle undefined
  if (value === 'undefined') {
    return undefined as unknown as Arg;
  }

  // Handle booleans
  if (value === 'true') {
    return true as unknown as Arg;
  }
  if (value === 'false') {
    return false as unknown as Arg;
  }

  // Handle numbers
  const numMatch = value.match(/^-?\d+(\.\d+)?$/);
  if (numMatch) {
    return parseFloat(value);
  }

  // Handle strings (single or double quoted)
  if (
    (value.startsWith("'") && value.endsWith("'")) ||
    (value.startsWith('"') && value.endsWith('"'))
  ) {
    const quote = value[0];
    const content = value.slice(1, -1);
    // Unescape quotes: replace '' with ' and "" with "
    return content.replace(new RegExp(`${quote}${quote}`, 'g'), quote);
  }

  // Handle arrays
  if (value.startsWith('[') && value.endsWith(']')) {
    const arrayContent = value.slice(1, -1).trim();
    if (!arrayContent) {
      return [] as unknown as Arg;
    }
    // Parse array elements - arrays typically contain strings or numbers
    // Parse as arguments and convert to string[] (most common case)
    const elements = parseArguments(arrayContent);
    // Check if all elements are strings (most common case for member arrays)
    if (elements.every((el) => typeof el === 'string')) {
      return elements as unknown as Arg; // string[] is valid ArgValue
    }
    // Otherwise return as Arg[] (for arrays containing function calls, etc.)
    return elements as unknown as Arg;
  }

  // Handle objects
  if (value.startsWith('{') && value.endsWith('}')) {
    const objectContent = value.slice(1, -1).trim();
    if (!objectContent) {
      return {} as unknown as Arg;
    }
    // Parse object: key: value pairs
    return parseObject(objectContent) as unknown as Arg;
  }

  // Handle function calls (nested)
  if (value.includes('(') && value.includes(')')) {
    return parseComposeCodeToFunctionCall(value);
  }

  // Handle composeCode references (DM.*)
  if (value.startsWith('DM.')) {
    return value;
  }

  // Fallback: return as string
  return value;
}

/**
 * Parses a single key:value pair string into [key, value].
 *
 * @param pair - The "key: value" string
 * @returns Tuple of [key, value]
 * @internal
 */
function parseKeyValue(pair: string): [string, Arg] {
  const colonIndex = findDelimiterAtDepthZero(pair, ':');
  if (colonIndex === -1) {
    throw new Error(`Invalid object property: expected "key: value", got "${pair}"`);
  }
  const key = unquote(pair.slice(0, colonIndex).trim());
  const value = parseArgumentValue(pair.slice(colonIndex + 1).trim());
  return [key, value];
}

/**
 * Parses an object string to a Record.
 *
 * @param objectContent - The object content (without outer braces)
 * @returns Parsed object
 * @internal
 */
function parseObject(objectContent: string): Record<string, Arg> {
  if (!objectContent.trim()) return {};
  const entries = splitAtDepthZero(objectContent, ',')
    .map(parseKeyValue)
    .filter(([, value]) => value !== null);
  return Object.fromEntries(entries);
}
