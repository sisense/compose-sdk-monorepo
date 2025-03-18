import { WidgetsPanelLayout } from '@/models';
import { useState } from 'react';
import flow from 'lodash-es/flow';

export type WidgetPanelLayoutManager = {
  manageLayout: (layout: WidgetsPanelLayout) => WidgetsPanelLayout;
  name: string;
};

type UseWidgetPanelLayoutManagement = ({
  layout,
  layoutManagers,
}: {
  layout: WidgetsPanelLayout;
  layoutManagers: WidgetPanelLayoutManager[];
}) => {
  layout: WidgetsPanelLayout;
  setLayout: (newLayout: WidgetsPanelLayout) => void;
};

export const useWidgetsLayoutManagement: UseWidgetPanelLayoutManagement = ({
  layout,
  layoutManagers,
}) => {
  const [forcedLayout, setForcedLayout] = useState<WidgetsPanelLayout | null>(null);
  return {
    layout: forcedLayout || flow(...layoutManagers.map((manager) => manager.manageLayout))(layout),
    setLayout: setForcedLayout,
  };
};
