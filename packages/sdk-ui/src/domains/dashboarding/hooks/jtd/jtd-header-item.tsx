import { useTranslation } from 'react-i18next';

import Tooltip from '@mui/material/Tooltip';

import { asBuiltInHeaderItem, HeaderItem } from '@/domains/shared/header';
import { WidgetHeaderTargets } from '@/domains/widgets/shared/widget-header/widget-header-targets';
import { JtdJumpableIcon } from '@/shared/icons/jtd-jumpable-icon';

/**
 * Renders the "jump to dashboard" icon with its tooltip, shown at the head of a jumpable widget's header.
 */
const JtdJumpableIconWithTooltip = () => {
  const { t } = useTranslation();

  return (
    <Tooltip title={t('jumpToDashboard.jumpableTooltip')} placement="top" arrow>
      <div>
        <JtdJumpableIcon />
      </div>
    </Tooltip>
  );
};

/**
 * Builds the built-in JTD-icon header item, which advertises that the widget can jump to a dashboard.
 *
 * @returns The header item, marked as a built-in so it may claim its reserved id.
 * @internal
 */
export const createJtdIconItem = (): HeaderItem =>
  asBuiltInHeaderItem({
    id: WidgetHeaderTargets.JtdIcon,
    component: () => <JtdJumpableIconWithTooltip />,
  });
