import { getJtdClickHandler, getJtdClickHandlerForMultiplePoints } from './jtd-handlers';
import { JtdActions, JtdContext, JtdCoreData } from './jtd-types';

export const jumpToDashboardMenuId = 'jump-to-dashboard-menu';

/**
 * Get the JTD menu item for a specific data point of the specific widget
 *
 * @param coreData - Core data (config, widget props, point)
 * @param context - Context data (filters)
 * @param actions - Action functions
 * @returns The JTD menu item
 * @internal
 */
export const getJumpToDashboardMenuItem = (
  coreData: JtdCoreData,
  context: JtdContext,
  actions: Pick<JtdActions, 'openModal' | 'translate'>,
) => {
  if (!coreData.jtdConfig) {
    return null;
  }
  const multipleJumpTargets = coreData.jtdConfig.jumpTargets.length > 1;

  // Use jumpToDashboardRightMenuCaption if provided, otherwise use translated default
  const menuCaption =
    coreData.jtdConfig.jumpToDashboardRightMenuCaption ||
    actions.translate!('jumpToDashboard.defaultCaption');

  if (multipleJumpTargets) {
    return {
      caption: menuCaption,
      subItems: [
        {
          items: coreData.jtdConfig.jumpTargets.map((jumpTarget) => ({
            caption: jumpTarget.caption,
            onClick: getJtdClickHandler(
              {
                ...coreData,
                jumpTarget,
              },
              context,
              {
                openModal: actions.openModal,
              },
            ),
          })),
        },
      ],
    };
  }

  const jumpTarget = coreData.jtdConfig.jumpTargets[0];
  return {
    caption: `${menuCaption} ${jumpTarget.caption}`,
    onClick: getJtdClickHandler(
      {
        ...coreData,
        jumpTarget,
      },
      context,
      {
        openModal: actions.openModal,
      },
    ),
  };
};

/**
 * Get the JTD menu item for multiple data points of the specific widget
 *
 * @param coreData - Core data (config, widget props, points)
 * @param context - Context data (filters)
 * @param actions - Action functions
 * @returns The JTD menu item
 * @internal
 */
export const getJumpToDashboardMenuItemForMultiplePoints = (
  coreData: JtdCoreData,
  context: JtdContext,
  actions: Pick<JtdActions, 'openModal' | 'translate'>,
) => {
  if (!coreData.jtdConfig || coreData.jtdConfig.jumpTargets.length === 0) {
    return null;
  }
  const multipleJumpTargets = coreData.jtdConfig.jumpTargets.length > 1;

  // Use jumpToDashboardRightMenuCaption if provided, otherwise use translated default
  const menuCaption =
    coreData.jtdConfig.jumpToDashboardRightMenuCaption ||
    actions.translate!('jumpToDashboard.defaultCaption');

  if (multipleJumpTargets) {
    return {
      caption: menuCaption,
      subItems: [
        {
          items: coreData.jtdConfig.jumpTargets.map((jumpTarget) => ({
            caption: jumpTarget.caption,
            onClick: getJtdClickHandlerForMultiplePoints(
              {
                ...coreData,
                jumpTarget,
              },
              context,
              {
                openModal: actions.openModal,
              },
            ),
          })),
        },
      ],
    };
  }

  const jumpTarget = coreData.jtdConfig.jumpTargets[0];
  return {
    caption: `${menuCaption} ${jumpTarget.caption}`,
    onClick: getJtdClickHandlerForMultiplePoints(
      {
        ...coreData,
        jumpTarget,
      },
      context,
      {
        openModal: actions.openModal,
      },
    ),
  };
};
