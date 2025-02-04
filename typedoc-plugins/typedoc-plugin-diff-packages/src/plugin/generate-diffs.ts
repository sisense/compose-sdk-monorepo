import { DeclarationReflection, ProjectReflection } from 'typedoc';
import { ReflectionKind } from './options/custom-maps';

type ReflectionMap = {
  packageName: string;
  // indexed map of children by name
  children: Record<string, DeclarationReflection>;
  // non matching keys to compute parity percentage
  nonMatchingKeys: string[];
};
type ReflectionMaps = ReflectionMap[];

const isType = (child: DeclarationReflection) => {
  return ['Interface', 'TypeAlias'].some((kind) => ReflectionKind[child.kind] === kind);
};

const shouldSkipChild = (child: DeclarationReflection) => {
  const isInternal = child?.comment?.modifierTags?.has('@internal');
  const hasDescription = child?.comment !== undefined;

  return isInternal || isType(child) || !hasDescription;
};

/**
 * Indexes packages by name.
 *
 * These indexes are used to match reflections by name/key across packages.
 *
 * @param project - The project reflection.
 * @returns The indexed packages.
 */
function indexPackages(project: ProjectReflection): ReflectionMaps[] {
  const indexedPackages: ReflectionMaps = [];
  const indexedTypes: ReflectionMaps = [];

  project.children?.forEach((packageReflection) => {
    const packageMap: ReflectionMap = {
      packageName: packageReflection.name,
      children: {},
      nonMatchingKeys: [],
    };
    const typesMap: ReflectionMap = {
      packageName: packageReflection.name,
      children: {},
      nonMatchingKeys: [],
    };

    packageReflection.children
      ?.filter((child) => (process.env.FULL_DIFF_REPORT ? true : !shouldSkipChild(child)))
      .forEach((child) => {
        const destination = isType(child) ? typesMap : packageMap;
        destination.children[child.name] = child;

        // Angular has service methods instead of hooks.
        // so we need to index those service methods as well.
        if (child.name.endsWith('Service')) {
          child.children?.forEach((grandChild) => {
            const key = grandChild.name;
            grandChild.name = `${child.name}.${grandChild.name}`;
            destination.children[key] = grandChild;
          });
        }
      });

    indexedPackages.push(packageMap);
    indexedTypes.push(typesMap);
  });

  return [indexedPackages, indexedTypes];
}

const calculateParityPercentage = (keyCount: number, nonMatchingKeyCount: number): number => {
  return ((keyCount - nonMatchingKeyCount) / keyCount) * 100;
};

/**
 * Generates the diff table header.
 * @param indexedPackages - The indexed packages.
 * @returns The diff table header.
 */
function generateDiffTableHeader(indexedPackages: ReflectionMaps): string {
  const keyCount = Object.keys(indexedPackages[0].children).length;

  const headerRow = indexedPackages
    .map((packageMap) => {
      const parityPercentage = calculateParityPercentage(
        keyCount,
        packageMap.nonMatchingKeys.length,
      );

      if (parityPercentage === 100) {
        return packageMap.packageName;
      } else {
        return `${packageMap.packageName} (${parityPercentage.toFixed(2)}% parity)`;
      }
    })
    .join(' | ');
  const separatorRow = indexedPackages.map(() => '---').join(' | ');

  return `| ${headerRow} |\n| ${separatorRow} |\n`;
}

function matchReflection(packageMap: ReflectionMap, key: string): string {
  if (packageMap.children[key]) {
    return packageMap.children[key].name;
  }

  // Angular components contain a suffix of 'Component' in their name.
  if (packageMap.children[`${key}Component`]) {
    return packageMap.children[`${key}Component`].name;
  }

  // Angular has service methods instead of hooks.
  // try to match hook name to service method name.
  if (key.startsWith('use')) {
    const newKey = key.charAt(3).toLowerCase() + key.slice(4);
    if (packageMap.children[newKey]) {
      return packageMap.children[newKey].name;
    }
  }

  // add non matching keys to compute parity percentage
  packageMap.nonMatchingKeys.push(key);

  return '';
}

/**
 * Generates the diff table data.
 * @param indexedPackages - The indexed packages.
 * @returns The diff table data.
 */
function generateDiffTableData(indexedPackages: ReflectionMaps): string {
  const keys = Object.keys(indexedPackages[0].children);

  return keys
    .map((key) => {
      let row = '';
      indexedPackages.forEach((packageMap) => {
        row += `| ${matchReflection(packageMap, key)} `;
      });
      return row;
    })
    .filter((row) => (process.env.FULL_DIFF_REPORT ? true : row.includes('|  ')))
    .join('\n');
}

/**
 * Generates the diff table.
 * @param indexedPackages - The indexed packages.
 * @returns The diff table string
 */
function generateDiffTable(indexedPackages: ReflectionMaps): string {
  // early return if all packages are empty
  if (
    indexedPackages.every((item) => {
      return Object.keys(item.children).length === 0 && item.nonMatchingKeys.length === 0;
    })
  )
    return '';

  const data = generateDiffTableData(indexedPackages);
  const header = generateDiffTableHeader(indexedPackages);

  return `${header}${data}`;
}

export function generateDiffs(project: ProjectReflection): string {
  const [indexedPackages, indexedTypes] = indexPackages(project);
  const elementsDiff = generateDiffTable(indexedPackages);
  const typesDiff = generateDiffTable(indexedTypes);
  let output = elementsDiff;
  if (typesDiff) {
    output += '\n\n## Types\n\n' + typesDiff;
  }
  return output;
}
