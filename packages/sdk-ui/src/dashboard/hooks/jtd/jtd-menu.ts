import { getJtdClickHandler, getJtdClickHandlerForMultiplePoints } from './jtd-handlers';
import { JtdCoreData, JtdContext, JtdActions } from './jtd-types';

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
  const multipleDrillTargets = coreData.jtdConfig.drillTargets.length > 1;

  // Use drillToDashboardRightMenuCaption if provided, otherwise use translated default
  const menuCaption =
    coreData.jtdConfig.drillToDashboardRightMenuCaption ||
    actions.translate!('jumpToDashboard.defaultCaption');

  if (multipleDrillTargets) {
    return {
      caption: menuCaption,
      subItems: [
        {
          items: coreData.jtdConfig.drillTargets.map((drillTarget) => ({
            caption: drillTarget.caption,
            onClick: getJtdClickHandler(
              {
                ...coreData,
                drillTarget,
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

  const drillTarget = coreData.jtdConfig.drillTargets[0];
  return {
    caption: `${menuCaption} ${drillTarget.caption}`,
    onClick: getJtdClickHandler(
      {
        ...coreData,
        drillTarget,
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
  if (!coreData.jtdConfig) {
    return null;
  }
  const multipleDrillTargets = coreData.jtdConfig.drillTargets.length > 1;

  // Use drillToDashboardRightMenuCaption if provided, otherwise use translated default
  const menuCaption =
    coreData.jtdConfig.drillToDashboardRightMenuCaption ||
    actions.translate!('jumpToDashboard.defaultCaption');

  if (multipleDrillTargets) {
    return {
      caption: menuCaption,
      subItems: [
        {
          items: coreData.jtdConfig.drillTargets.map((drillTarget) => ({
            caption: drillTarget.caption,
            onClick: getJtdClickHandlerForMultiplePoints(
              {
                ...coreData,
                drillTarget,
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

  const drillTarget = coreData.jtdConfig.drillTargets[0];
  return {
    caption: `${menuCaption} ${drillTarget.caption}`,
    onClick: getJtdClickHandlerForMultiplePoints(
      {
        ...coreData,
        drillTarget,
      },
      context,
      {
        openModal: actions.openModal,
      },
    ),
  };
};
