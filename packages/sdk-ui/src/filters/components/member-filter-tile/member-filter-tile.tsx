import type { Attribute, DataSource, Filter, MembersFilter } from '@sisense/sdk-data';
import { filters as filterFactory } from '@sisense/sdk-data';
import { FunctionComponent, useMemo } from 'react';
import { BasicMemberFilterTile } from './basic-member-filter-tile';
import { Member } from './members-reducer';
import { asSisenseComponent } from '../../../decorators/as-sisense-component';
import { useExecuteQuery } from '../../../query-execution/use-execute-query';

/**
 * Props for {@link MemberFilterTile}
 */
export interface MemberFilterTileProps {
  /** Title for the filter tile, which is rendered into the header */
  title: string;
  /**
   * Data source the query is run against - e.g. `Sample ECommerce`
   *
   * If not specified, the query will use the `defaultDataSource` specified in the parent {@link SisenseContextProvider} component.
   */
  dataSource?: DataSource;
  /** Attribute to filter on. A query will be run to fetch all this attribute's members */
  attribute: Attribute;
  /** Source filter object. Caller is responsible for keeping track of filter state */
  filter: Filter | null;
  /** Callback indicating when the source member filter object should be updated */
  onChange: (filter: Filter | null) => void;
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
 */
export const MemberFilterTile: FunctionComponent<MemberFilterTileProps> = asSisenseComponent({
  componentName: 'MemberFilterTile',
})((props) => {
  const { title, attribute, filter, dataSource, onChange } = props;

  // TODO: this is a temporary fix for useExecuteQuery so the reference to
  // "dimensions" does not change on every render, causing infinite rerenders.
  const dimensions = useMemo(() => [attribute], [attribute]);

  const { data } = useExecuteQuery({ dataSource, dimensions });
  if (!data) {
    return null;
  }

  const memberFilter = filter as MembersFilter;
  const selectedMembersData = memberFilter?.members || [];
  const queryMembers = data.rows.map((r) => r[0]);
  const allMembers: Member[] = queryMembers.map((t) => ({
    key: t.data as string,
    title: t.text ?? (t.data as string),
  }));
  const selectedMembers: Member[] = queryMembers
    .filter((qM) => selectedMembersData.includes(qM.data))
    .map((qM) => ({
      key: qM.data as string,
      title: qM.text ?? (qM.data as string),
    }));

  if (selectedMembers.length !== selectedMembersData.length) {
    console.warn(
      `Some initially selected members were ignored. You may want to check your initialization logic for the "${title}" filter`,
    );
  }

  return (
    <BasicMemberFilterTile
      title={title}
      allMembers={allMembers}
      initialSelectedMembers={selectedMembers}
      onUpdateSelectedMembers={(members) => onChange(filterFactory.members(attribute, members))}
    />
  );
});
