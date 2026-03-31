import React from 'react';

import { Navigator } from '@sisense/sdk-ui';

import { TogglerSection } from '../shared/TogglerSection.js';

export const AutoZoomSection = ({
  onClick,
  navigator,
}: {
  navigator?: Navigator;
  onClick: (autoZoom: Navigator) => void;
}) => {
  return (
    <div>
      <TogglerSection
        label="Auto Zoom"
        checked={!!navigator?.enabled}
        checkedBackground={true}
        onClick={() => onClick({ ...(navigator ?? {}), enabled: !navigator?.enabled })}
      />
    </div>
  );
};
