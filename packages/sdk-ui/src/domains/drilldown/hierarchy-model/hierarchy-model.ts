import { type Attribute } from '@sisense/sdk-data';

/**
 * A unique identifier representing a hierarchy.
 */
export type HierarchyId = string;

/**
 * Hierarchy with a title and associated levels.
 */
export interface Hierarchy {
  /** Hierarchy title. */
  title: string;
  /** Hierarchy levels. */
  levels: Attribute[];
}

/**
 * Model of Sisense hierarchy defined in the abstractions of Compose SDK.
 */
export interface HierarchyModel extends Hierarchy {
  /** Unique identifier of the hierarchy. */
  id: HierarchyId;
}
