import semverSatisfies from 'semver/functions/satisfies';

import type { Module, ModuleRequirement } from './types.js';

/** Normalised view of a `ModuleRequirement`. */
interface NormalizedRequirement {
  name: string;
  optional: boolean;
  requiredVersion?: string;
}

/** A module after graph resolution, with its normalised requirements attached. */
export interface ResolvedModule {
  module: Module;
  requirements: NormalizedRequirement[];
  /**
   * Names of soft requirements that were absent or version-incompatible at boot.
   * Integrations targeting these names are silently dropped.
   */
  missingOptionalTargets: Set<string>;
}

const normalizeRequirement = (requirement: ModuleRequirement): NormalizedRequirement => {
  if (typeof requirement === 'string') {
    return { name: requirement, optional: false };
  }
  return {
    name: requirement.name,
    optional: requirement.optional ?? false,
    requiredVersion: requirement.requiredVersion,
  };
};

const normalizeSdkVersion = (version: string): string => version.split('-')[0].trim() || version;

const versionSatisfies = (version: string, range: string): boolean => {
  const trimmed = range.trim();
  if (!trimmed) return false;
  return semverSatisfies(normalizeSdkVersion(version), trimmed);
};

/**
 * Recursively expands a module's `includes`, returning every module reachable
 * from the given roots.
 * Deduplicates by `name`; on a name conflict with a different `version`, throws.
 */
const flattenModules = (modules: ReadonlyArray<Module>) => {
  const modulesByName = new Map<string, Module>();

  const visit = (module: Module): void => {
    const existing = modulesByName.get(module.name);
    if (existing) {
      if (existing === module) return;
      if (existing.version !== module.version) {
        throw new Error(
          `[Module] Conflicting versions for "${module.name}": "${existing.version}" vs "${module.version}".`,
        );
      }
      // Same name & version, treat as equivalent and skip re-visit to avoid cycles.
      return;
    }
    modulesByName.set(module.name, module);
    for (const included of module.includes ?? []) {
      visit(included);
    }
  };

  for (const module of modules) {
    visit(module);
  }

  return {
    modules: Array.from(modulesByName.values()),
    modulesByName,
  };
};

const validateRequirement = (
  module: Module,
  requirement: NormalizedRequirement,
  modulesByName: ReadonlyMap<string, Module>,
): { satisfied: boolean } => {
  const target = modulesByName.get(requirement.name);
  if (!target) {
    if (requirement.optional) {
      return { satisfied: false };
    }
    throw new Error(
      `[Module] "${module.name}" requires "${requirement.name}", but it is not registered.`,
    );
  }

  if (
    requirement.requiredVersion &&
    !versionSatisfies(target.version, requirement.requiredVersion)
  ) {
    if (requirement.optional) {
      return { satisfied: false };
    }
    throw new Error(
      `[Module] "${module.name}" requires "${requirement.name}" ` +
        `version ${requirement.requiredVersion}, but registered version is "${target.version}".`,
    );
  }

  return { satisfied: true };
};

const validateIntegrations = (
  module: Module,
  resolved: ResolvedModule,
  modulesByName: ReadonlyMap<string, Module>,
): void => {
  const { integrations } = module;
  if (!integrations) return;

  const declaredRequirementNames = new Set(resolved.requirements.map((r) => r.name));

  for (const targetName of Object.keys(integrations)) {
    if (!declaredRequirementNames.has(targetName)) {
      throw new Error(
        `[Module] "${module.name}" has integrations to "${targetName}" but does not declare ` +
          `it in "requires".`,
      );
    }

    if (resolved.missingOptionalTargets.has(targetName)) {
      // Soft requirement absent — drop silently per contract.
      continue;
    }

    const target = modulesByName.get(targetName);
    // Guaranteed by validation above (hard requirement) or the soft-missing branch.
    if (!target) continue;

    const contribution: unknown = integrations[targetName];
    if (contribution === null || typeof contribution !== 'object') {
      throw new Error(
        `[Module] "${module.name}" integration to "${targetName}" must be an object.`,
      );
    }

    const targetApi: Record<string, unknown> = target.api ?? {};
    const contributionFields = Object.keys(contribution as Record<string, unknown>);
    for (const fieldName of contributionFields) {
      if (!(fieldName in targetApi)) {
        throw new Error(
          `[Module] "${module.name}" contributes to unknown field "${fieldName}" of "${targetName}".`,
        );
      }
    }
  }
};

/**
 * Topologically sorts modules so that every module appears after its `requires` targets.
 */
const topologicallySort = (resolvedModules: ReadonlyArray<ResolvedModule>): ResolvedModule[] => {
  const byName = new Map<string, ResolvedModule>();
  resolvedModules.forEach((entry) => byName.set(entry.module.name, entry));

  const sorted: ResolvedModule[] = [];
  const visiting = new Set<string>();
  const visited = new Set<string>();

  const visit = (entry: ResolvedModule, path: string[]): void => {
    if (visited.has(entry.module.name)) return;
    if (visiting.has(entry.module.name)) {
      throw new Error(
        `[Module] Circular dependency detected: ${[...path, entry.module.name].join(' → ')}.`,
      );
    }
    visiting.add(entry.module.name);

    for (const requirement of entry.requirements) {
      const dependency = byName.get(requirement.name);
      if (dependency) {
        visit(dependency, [...path, entry.module.name]);
      }
    }

    visiting.delete(entry.module.name);
    visited.add(entry.module.name);
    sorted.push(entry);
  };

  for (const entry of resolvedModules) {
    visit(entry, []);
  }

  return sorted;
};

/**
 * Builds the validated, topologically-ordered module graph from the given roots.
 *
 * - Recursively expands `includes` and dedupes by `name` (versions must match).
 * - Validates every hard `requires` target is present and its version satisfies
 *   any declared `requiredVersion`.
 * - Drops contributions to soft requirements (`optional: true`) that are missing
 *   or version-incompatible.
 * - Validates each integration targets a declared requirement and a known field
 *   on the target's `api`.
 * - Returns modules sorted so each appears after its requirements.
 */
export const buildModuleGraph = (modules: ReadonlyArray<Module>): ResolvedModule[] => {
  const { modules: flattenedModules, modulesByName } = flattenModules(modules);

  const resolvedModules: ResolvedModule[] = flattenedModules.map((module) => ({
    module,
    requirements: (module.requires ?? []).map(normalizeRequirement),
    missingOptionalTargets: new Set<string>(),
  }));

  // First pass: validate requires (presence + version) and record missing optional targets.
  for (const entry of resolvedModules) {
    for (const requirement of entry.requirements) {
      const { satisfied } = validateRequirement(entry.module, requirement, modulesByName);
      if (!satisfied) {
        entry.missingOptionalTargets.add(requirement.name);
      }
    }
  }

  // Second pass: validate integrations once we know which optional targets are missing.
  for (const entry of resolvedModules) {
    validateIntegrations(entry.module, entry, modulesByName);
  }

  return topologicallySort(resolvedModules);
};
