import type { Attribute, DataSource, Filter, MembersFilter } from '@sisense/sdk-data';
import { MembersFilter as MembersFilterClass } from '@sisense/sdk-data';
import { FunctionComponent, useMemo, useRef } from 'react';
import { BasicMemberFilterTile } from './basic-member-filter-tile';
import { Member } from './members-reducer';
import { asSisenseComponent } from '../../../decorators/component-decorators/as-sisense-component';
import { useExecuteQueryInternal } from '../../../query-execution/use-execute-query';

/**
 * @internal
 */
class MembersFilterInternal extends MembersFilterClass {
  internal = true;

  constructor(attribute: Attribute, members: string[]) {
    super(attribute, members);
    this.internal = true;
  }
}

/**
 * Props for {@link MemberFilterTile}
 */
export interface MemberFilterTileProps {
  /** Title for the filter tile, which is rendered into the header */
  title: string;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent Sisense Context.
   */
  dataSource?: DataSource;
  /** Attribute to filter on. A query will run to fetch all this attribute's members */
  attribute: Attribute;
  /** Source filter object. Caller is responsible for keeping track of filter state */
  filter: Filter | null;
  /** Callback indicating when the source member filter object should be updated */
  onChange: (filter: Filter | null) => void;
  /** List of filters this filter is dependent on */
  parentFilters?: Filter[];
}

/**
 * UI component that allows the user to select members to include/exclude in a
 * filter. A query is executed against the provided data source to fetch
 * all members that are selectable.
 *
 * @example
 * Below is an example for filtering countries in the `Country` dimension of the `Sample ECommerce` data model.
 * ```tsx
 * const [countryFilter, setCountryFilter] = useState<Filter | null>(null);
 *
 * return (
 * <MemberFilterTile
 *   title={'Country'}
 *   attribute={DM.Country.Country}
 *   filter={countryFilter}
 *   onChange={setCountryFilter}
 * />
 * );
 * ```
 *
 * <img src="media://member-filter-tile-example-1.png" width="300px" />
 * @param props - Member filter tile props
 * @returns Member filter tile component
 * @group Filter Tiles
 */
export const MemberFilterTile: FunctionComponent<MemberFilterTileProps> = asSisenseComponent({
  componentName: 'MemberFilterTile',
})((props) => {
  const { title, attribute, filter, dataSource, onChange, parentFilters } = props;
  const initialFilter = useRef(filter);

  // TODO: this is a temporary fix for useExecuteQuery so the reference to
  // "dimensions" does not change on every render, causing infinite rerenders.
  const dimensions = useMemo(() => [attribute], [attribute]);

  const { data, error } = useExecuteQueryInternal({
    dataSource,
    dimensions,
    filters: parentFilters,
  });

  const memberFilter = filter as MembersFilter;
  const queryMembers = useMemo(() => (!data ? [] : data.rows.map((r) => r[0])), [data]);

  const selectedMembers: Member[] = useMemo(
    () =>
      queryMembers
        .filter((qM) => (memberFilter?.members || []).includes(qM.data))
        .map((qM) => ({
          key: qM.data as string,
          title: qM.text ?? (qM.data as string),
        })),
    [memberFilter?.members, queryMembers],
  );

  const allMembers: Member[] = useMemo(
    () =>
      queryMembers.map((t) => ({
        key: t.data as string,
        title: t.text ?? (t.data as string),
      })),
    [queryMembers],
  );

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return (
    <BasicMemberFilterTile
      title={title}
      allMembers={allMembers}
      initialSelectedMembers={selectedMembers}
      shouldUpdateSelectedMembers={
        initialFilter.current !== filter && !(filter as MembersFilterInternal)?.internal
      }
      onUpdateSelectedMembers={(members) => {
        onChange(new MembersFilterInternal(attribute, members));
      }}
      isDependent={parentFilters && parentFilters.length > 0}
    />
  );
});
