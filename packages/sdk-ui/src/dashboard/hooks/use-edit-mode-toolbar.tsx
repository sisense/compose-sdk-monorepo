import { SVGProps, useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';

import { Button } from '@/common/components/button';
import { useStateWithHistory } from '@/common/hooks/use-state-with-history';
import { WidgetsPanelLayout } from '@/models';
import { useThemeContext } from '@/theme-provider';

const ToolbarContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
`;

const IconButton = styled(Button)`
  width: auto;
  min-width: 0;
  padding: 0;
  background: transparent;
  &:disabled,
  &:hover {
    background: transparent;
  }
`;

const UndoIcon = (props: SVGProps<SVGSVGElement> & { color?: string }) => (
  <svg
    width="30px"
    height="30px"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fill={props.color ?? 'currentColor'}
      d="M7.022 12a5.5 5.5 0 1 1 1.195 3.95l.778-.627A4.5 4.5 0 1 0 8.027 12H9.5a.5.5 0 1 1 0 1h-3a.5.5 0 0 1-.5-.5v-3a.5.5 0 0 1 1 0V12h.022z"
    ></path>
  </svg>
);

const RedoIcon = (props: SVGProps<SVGSVGElement>) => (
  <UndoIcon {...props} style={{ transform: 'scaleX(-1)', ...props?.style }} />
);

/**
 * Props for the useEditModeToolbar hook
 * @internal
 */
export interface UseEditModeToolbarProps {
  /**
   * Initial layout to track history for
   */
  initialLayout: WidgetsPanelLayout;

  /**
   * Optional callback when layout is applied
   */
  onApply?: (layout: WidgetsPanelLayout) => void;

  /**
   * Optional callback when edit is canceled
   */
  onCancel?: () => void;

  /**
   * Maximum number of history entries to store
   * @default 20
   */
  historyCapacity?: number;
}

/**
 * Return type for the useEditModeToolbar hook
 * @internal
 */
export interface UseEditModeToolbarResult {
  /**
   * Current layout state
   */
  layout: WidgetsPanelLayout;

  /**
   * Function to update layout state and track in history
   */
  setLayout: (
    layout: WidgetsPanelLayout | ((prev: WidgetsPanelLayout) => WidgetsPanelLayout),
  ) => void;

  /**
   * Whether there are unsaved changes
   */
  hasChanges: boolean;

  /**
   * Toolbar component with undo, redo, cancel, apply buttons
   */
  toolbar: () => JSX.Element;
}

/**
 * Hook that provides layout state management with history tracking and a toolbar with undo/redo/cancel/apply buttons
 *
 * @param props Configuration options for the toolbar
 * @returns Layout state and toolbar component
 * @internal
 */
export function useEditModeToolbar({
  initialLayout,
  onApply,
  onCancel,
  historyCapacity = 20,
}: UseEditModeToolbarProps): UseEditModeToolbarResult {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const {
    state: layout,
    setState: setLayout,
    undo,
    redo,
    canUndo,
    canRedo,
    currentIndex,
    clearHistory,
  } = useStateWithHistory(initialLayout, { capacity: historyCapacity });

  const prevInitialLayoutRef = useRef(initialLayout);

  const resetLayout = useCallback(() => {
    setLayout(initialLayout);
    clearHistory();
  }, [initialLayout, setLayout, clearHistory]);

  useEffect(() => {
    const initialLayoutChanged =
      JSON.stringify(prevInitialLayoutRef.current) !== JSON.stringify(initialLayout);

    if (initialLayoutChanged) {
      resetLayout();
      prevInitialLayoutRef.current = initialLayout;
    }
  }, [initialLayout, resetLayout]);

  const hasChanges = currentIndex !== 0;

  const handleApply = useCallback(() => {
    onApply?.(layout);
    clearHistory();
  }, [layout, onApply, clearHistory]);

  const handleCancel = useCallback(() => {
    resetLayout();
    onCancel?.();
  }, [onCancel, resetLayout]);

  const toolbar = useCallback(
    () => (
      <ToolbarContainer>
        <IconButton onClick={undo} disabled={!canUndo} title={t('dashboard.toolbar.undo')}>
          <UndoIcon color={themeSettings.dashboard.toolbar.primaryTextColor} />
        </IconButton>
        <IconButton onClick={redo} disabled={!canRedo} title={t('dashboard.toolbar.redo')}>
          <RedoIcon color={themeSettings.dashboard.toolbar.primaryTextColor} />
        </IconButton>
        <span className="csdk-ml-[8px]">
          <Button type="secondary" onClick={handleCancel} title={t('dashboard.toolbar.cancel')}>
            {t('dashboard.toolbar.cancel')}
          </Button>
        </span>
        <span className="csdk-ml-[8px]">
          <Button
            type="primary"
            onClick={handleApply}
            disabled={!hasChanges}
            title={t('dashboard.toolbar.apply')}
          >
            {t('dashboard.toolbar.apply')}
          </Button>
        </span>
      </ToolbarContainer>
    ),
    [
      canUndo,
      canRedo,
      hasChanges,
      handleApply,
      handleCancel,
      undo,
      redo,
      t,
      themeSettings.dashboard.toolbar.primaryTextColor,
    ],
  );

  return {
    layout,
    setLayout,
    hasChanges,
    toolbar,
  };
}
