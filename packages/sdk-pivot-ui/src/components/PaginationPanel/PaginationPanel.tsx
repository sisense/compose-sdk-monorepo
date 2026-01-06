import * as React from 'react';

import { TablePagination } from '@sisense/sdk-shared-ui/TablePagination';
import { Tooltip } from '@sisense/sdk-shared-ui/Tooltip';
import cn from 'classnames';

import {
  createCallbackMemoizer,
  createTemplate,
  debug,
  TemplateStringsMap,
} from '../../utils/index.js';
import { LoggerI } from '../../utils/types.js';
import CustomScroll from '../CustomScroll/index.js';
import {
  LIST_WRAPPER,
  NOTIFICATION_WRAPPER,
  PANEL,
  PANEL_DESKTOP,
  PANEL_HIDDEN,
  PANEL_LIMITS_ONLY,
  PANEL_MOBILE,
  PANEL_NOTIFICATION_ONLY,
  PANEL_SHOWED,
  PANEL_WRAPPER,
} from './classes.js';

export type PaginationOptions = {
  isMobile: boolean;
  conjunctionLabel: string;
  resultLabel: string;
  rowsPerPageLabel: string;
  rowsPerPageLabelShort: string;
  notifyLimitsBaseNote: string;
  notifyRowsLimitLabel: string;
  notifyColumnsLimitLabel: string;
  notifyRowsAndColumnsLimitLabel: string;
  notifyTooltipStyle?: React.CSSProperties;
  alertIcon: React.ReactElement;
  numberFormatter?: ((value: number, options: {}) => number) | null;
  style?: {
    fontFamily?: string;
  };
};

export const defaultPaginationOptions: PaginationOptions = {
  isMobile: false,
  conjunctionLabel: 'of',
  resultLabel: 'Results',
  rowsPerPageLabel: 'Results per page',
  rowsPerPageLabelShort: 'Rows',
  notifyLimitsBaseNote:
    'Totals may refer to the complete data if set by the dashboard owner. If available, you can use filters to display fewer rows and columns.',
  notifyRowsLimitLabel: 'The Pivot table is limited to {{recordsCount}} records',
  notifyColumnsLimitLabel: 'The Pivot table is limited to {{columnsCount}} columns',
  notifyRowsAndColumnsLimitLabel:
    'The Pivot table is limited to {{recordsCount}} records and {{columnsCount}} columns',
  alertIcon: <div>!</div>,
  numberFormatter: null,
};

type Props = {
  className?: string;
  itemsCount: number;
  totalItemsCount: number;
  limitReached: boolean;
  limitCount: number;
  columnsCount: number;
  totalColumnsCount: number;
  itemsPerPage: number;
  itemsPerPageOptions: number[];
  activePage: number;
  width: number;
  isAllDataLoaded?: boolean;
  disableInitialCallback?: boolean;
  options?: Partial<PaginationOptions>;
  onHeightChange?: (height: number) => void;
  onPageChange?: (options: { selected: number }) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  style?: {
    fontFamily?: string;
  };
};

type State = {
  pagesCount: number;
  options: PaginationOptions;
};

export class PaginationPanel extends React.PureComponent<Props, State> {
  logger: LoggerI;

  panel?: HTMLDivElement;

  listFirst?: HTMLUListElement;

  listLast?: HTMLUListElement;

  listNumbers?: HTMLUListElement;

  rowsEl?: HTMLDivElement;

  totalEl?: HTMLDivElement;

  notificationEl?: HTMLDivElement;

  oldSize?: boolean;

  notificationStr?: string;

  notificationFallback?: React.ReactElement | null;

  onHeightChangeMemoizer = createCallbackMemoizer(false);

  static defaultProps = {
    isAllDataLoaded: false,
    activePage: 0,
    disableInitialCallback: true,
    className: '',
    options: { ...defaultPaginationOptions },
    onHeightChange: null,
    onPageChange: null,
  };

  constructor(props: Props) {
    super(props);
    const { itemsCount, itemsPerPage, options, style } = this.props;
    this.logger = debug.create('PaginationPanel');
    const pagesCount = Math.ceil(itemsCount / itemsPerPage) || 0;
    const finalOptions: PaginationOptions = { ...defaultPaginationOptions, ...options, style };

    this.state = {
      pagesCount,
      options: finalOptions,
    };
  }

  componentDidMount() {
    const { activePage, disableInitialCallback } = this.props;

    this.provideHeightUpdate();
    if (!disableInitialCallback) {
      this.notifyOnPageChange(activePage);
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props) {
    let nextState: Partial<State> | null = null;

    if (
      nextProps.itemsCount !== this.props.itemsCount ||
      nextProps.itemsPerPage !== this.props.itemsPerPage
    ) {
      nextState = nextState || {};
      const pagesCount = Math.ceil(nextProps.itemsCount / nextProps.itemsPerPage) || 0;
      nextState.pagesCount = pagesCount;
    }

    if (
      nextProps.itemsCount !== this.props.itemsCount ||
      nextProps.itemsPerPage !== this.props.itemsPerPage ||
      nextProps.activePage !== this.props.activePage ||
      nextProps.totalItemsCount !== this.props.totalItemsCount ||
      nextProps.columnsCount !== this.props.columnsCount ||
      nextProps.totalColumnsCount !== this.props.totalColumnsCount ||
      nextProps.limitReached !== this.props.limitReached ||
      nextProps.limitCount !== this.props.limitCount
    ) {
      this.notificationStr = undefined;
    }

    if (nextProps.options !== this.props.options) {
      nextState = nextState || {};
      const options: PaginationOptions = { ...defaultPaginationOptions, ...nextProps.options };
      nextState.options = options;
    }

    // eslint-disable-next-line max-lines
    const nextPropsOptions = nextProps.options || {};
    const thisPropsOptions = this.props.options || {};
    if (
      nextProps.width !== this.props.width ||
      nextProps.itemsCount !== this.props.itemsCount ||
      nextProps.totalItemsCount !== this.props.totalItemsCount ||
      nextProps.columnsCount !== this.props.columnsCount ||
      nextProps.totalColumnsCount !== this.props.totalColumnsCount ||
      nextProps.limitReached !== this.props.limitReached ||
      nextProps.limitCount !== this.props.limitCount ||
      nextProps.itemsPerPage !== this.props.itemsPerPage ||
      nextProps.activePage !== this.props.activePage ||
      nextPropsOptions.isMobile !== thisPropsOptions.isMobile
    ) {
      this.oldSize = undefined;
    }

    if (nextState) {
      // @ts-ignore
      this.setState(nextState);
    }
  }

  componentDidUpdate() {
    this.provideHeightUpdate();
  }

  getHeight(): number {
    if (this.panel) {
      return this.panel.offsetHeight || 0;
    }
    return 0;
  }

  getNotificationStr() {
    const { itemsCount, itemsPerPage, activePage, totalColumnsCount, columnsCount, limitCount } =
      this.props;
    const { options } = this.state;
    const { notifyRowsLimitLabel, notifyColumnsLimitLabel, notifyRowsAndColumnsLimitLabel } =
      options || {};

    let from = activePage * itemsPerPage + 1;
    if (from < 0) {
      from = 0;
    }
    let to = from + itemsPerPage - 1;
    if (to > itemsCount) {
      to = itemsCount;
    }

    const rowsLimitReached = this.isRowsLimitReached(this.props);
    const columnsLimitReached = this.isColumnsLimitReached(this.props);
    let notificationLabelTemplate = (() => '') as (templateData: TemplateStringsMap) => string;
    if (rowsLimitReached && columnsLimitReached) {
      notificationLabelTemplate = createTemplate(notifyRowsAndColumnsLimitLabel || '');
    } else if (rowsLimitReached) {
      notificationLabelTemplate = createTemplate(notifyRowsLimitLabel || '');
    } else if (columnsLimitReached) {
      notificationLabelTemplate = createTemplate(notifyColumnsLimitLabel || '');
    }

    let rowsCount = itemsCount;
    let recordsCount = limitCount;
    if (this.props.options) {
      const formatterMask = {
        type: 'number',
        separated: true,
        abbreviations: { k: true, m: true },
      };
      const { numberFormatter } = this.props.options;
      if (numberFormatter) {
        rowsCount = numberFormatter(rowsCount, formatterMask);
        recordsCount = numberFormatter(recordsCount, formatterMask);
      }
    }

    this.notificationStr = notificationLabelTemplate({
      columnsCount,
      totalColumnsCount,
      rowsCount,
      recordsCount,
    });

    this.notificationFallback = <div />;
    if (totalColumnsCount === 0 && columnsCount === 0) {
      this.notificationFallback = null;
    }
    return {
      notificationStr: this.notificationStr,
      notificationFallback: this.notificationFallback,
    };
  }

  isRowsLimitReached(props: Props = this.props): boolean {
    return props.limitReached;
  }

  isColumnsLimitReached(props: Props = this.props): boolean {
    return props.totalColumnsCount > props.columnsCount;
  }

  /**
   * Notify about paginator container height change
   *
   * @returns {void}
   * @private
   */
  provideHeightUpdate() {
    const { onHeightChange } = this.props;

    if (onHeightChange && this.panel) {
      this.onHeightChangeMemoizer({
        callback: ({ offsetHeight }: { offsetHeight: number }) => {
          onHeightChange(offsetHeight);
        },
        indices: {
          offsetHeight: this.getHeight(),
        },
      });
    }
  }

  /**
   *  Callback for Parent Components
   *
   * @param {number} selectedItem - selected page number
   * @returns {void}
   * @private
   */
  notifyOnPageChange(selectedItem: number) {
    const { onPageChange } = this.props;
    if (typeof onPageChange !== 'undefined' && typeof onPageChange === 'function') {
      onPageChange({ selected: selectedItem });
    }
  }

  /**
   *  Function-handler to select provided page
   *
   * @param {number} selected - selected page number
   * @param {Event} e - standard DOM event
   * @returns {void}
   * @private
   */
  handlePageSelected = (selected: number) => {
    const pageIndex = selected === 0 ? selected : selected - 1;

    // if (e && e.preventDefault) {
    //   e.preventDefault();
    // }

    if (this.props.activePage === pageIndex) {
      return;
    }

    this.notifyOnPageChange(pageIndex);
  };

  onRowsPerPageChange = (itemsPerPage: number) => {
    const { onItemsPerPageChange } = this.props;
    if (typeof onItemsPerPageChange !== 'undefined' && typeof onItemsPerPageChange === 'function') {
      onItemsPerPageChange(itemsPerPage);
    }
  };

  panelRef = (elem: HTMLDivElement | null) => {
    if (elem) {
      this.panel = elem;
    }
  };

  render() {
    const {
      className,
      activePage,
      itemsPerPage,
      itemsPerPageOptions,
      itemsCount,
      totalItemsCount,
    } = this.props;
    const { pagesCount, options } = this.state;
    const {
      isMobile,
      alertIcon,
      conjunctionLabel,
      resultLabel,
      rowsPerPageLabel,
      rowsPerPageLabelShort,
      notifyLimitsBaseNote,
      notifyTooltipStyle,
    } = options;

    const isOnlyTotalRowsVisible = totalItemsCount > itemsCount && pagesCount === 1;

    const isPaginationShowed = activePage > -1;
    const isNotificationVisible =
      this.isRowsLimitReached(this.props) || this.isColumnsLimitReached(this.props);
    const isAllHidden = !isPaginationShowed && !isOnlyTotalRowsVisible && !isNotificationVisible;

    const panelClass = cn(
      className,
      PANEL,
      isAllHidden ? PANEL_HIDDEN : '',
      isPaginationShowed ? PANEL_SHOWED : '',
      isMobile ? PANEL_MOBILE : PANEL_DESKTOP,
      isOnlyTotalRowsVisible ? PANEL_LIMITS_ONLY : '',
      isNotificationVisible ? PANEL_NOTIFICATION_ONLY : '',
    );

    const { notificationStr, notificationFallback } = this.getNotificationStr();

    const scrollStyle = { width: '100%', height: '' };

    return (
      <div className="sis-scope">
        <div className={panelClass} data-html2canvas-ignore="true" ref={this.panelRef}>
          <CustomScroll style={scrollStyle} autoHeight={true}>
            <div className={PANEL_WRAPPER}>
              {notificationStr ? (
                <div className={NOTIFICATION_WRAPPER} title={notificationStr}>
                  <Tooltip
                    title={
                      <p>
                        <b>{notificationStr}</b>
                        <br />
                        <span>{notifyLimitsBaseNote}</span>
                      </p>
                    }
                    placement="top-start"
                    slotProps={{
                      tooltip: {
                        sx: {
                          borderRadius: 0,
                          ...notifyTooltipStyle,
                        },
                      },
                      arrow: {
                        sx: {
                          color: notifyTooltipStyle?.backgroundColor,
                        },
                      },
                    }}
                    arrow
                  >
                    {/*
                      Wrapping alertIcon in a span is required for MUI Tooltip to work correctly
                      when using Preact bridges (Angular/Vue). MUI Tooltip needs to attach refs
                      and DOM event listeners to its child element. Without a native HTML element
                      wrapper, the ref may point to a Preact virtual node instead of a real DOM
                      element, causing "getAttribute is not a function" errors.
                      See: https://mui.com/material-ui/react-tooltip/#custom-child-element
                    */}
                    <span>{alertIcon}</span>
                  </Tooltip>
                </div>
              ) : (
                notificationFallback
              )}

              <div className={LIST_WRAPPER}>
                <TablePagination
                  count={itemsCount}
                  page={activePage + 1}
                  rowsPerPage={itemsPerPage}
                  displayedLabelRows={{
                    conjunction: conjunctionLabel,
                    result: resultLabel,
                  }}
                  rowsPerPageOptions={itemsPerPageOptions}
                  labelRowsPerPage={rowsPerPageLabel}
                  labelRowsPerPageShort={rowsPerPageLabelShort}
                  dataTestId="TablePagination"
                  onPageChange={this.handlePageSelected}
                  onRowsPerPageChange={this.onRowsPerPageChange}
                  style={this.props.style}
                />
              </div>
            </div>
          </CustomScroll>
        </div>
      </div>
    );
  }
}

export default PaginationPanel;
