import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import { CloseIcon } from '@/common/icons/close-icon';
import { ReactNode } from 'react';
import { BreadcrumbsArrowsIcon } from '@/common/icons/breadcrumbs-arrows-arrow-icon';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider';

/** A header for the popover with a title and a flow path. */
export const PopoverHeader = (props: PopoverHeaderProps) => {
  const { themeSettings } = useThemeContext();
  return (
    <HeaderContainer theme={themeSettings}>
      <HeaderLeftContent>
        <HeaderTitle theme={themeSettings}>{props.title}</HeaderTitle>
        <HeaderDivider theme={themeSettings} />
        <FlowPath flowPath={props.flowPath} />
      </HeaderLeftContent>
      <CloseButton onClick={props.onClose} />
    </HeaderContainer>
  );
};

type PopoverHeaderProps = {
  title: string;
  flowPath: FlowStep[];
  onClose?: () => void;
};

type FlowStep = {
  title: string;
  isCurrentStep: boolean;
};

const HeaderContainer = styled.div<Themable>`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: ${({ theme }) => theme.general.popover.header.backgroundColor};
  color: ${({ theme }) => theme.general.popover.header.textColor};
  display: flex;
  padding: 12px 16px 12px 24px;
`;

const HeaderLeftContent = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  flex: 1 0 0;
`;

const HeaderTitle = styled.span<Themable>`
  color: ${({ theme }) => theme.general.popover.header.textColor};
  font-size: 15px;
  font-style: normal;
  font-weight: 600;
  line-height: 20px;
`;

const HeaderDivider = styled.div<Themable>`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.general.popover.header.textColor};
`;

const FlowPathContainer = styled.div`
  display: flex;
  align-items: center;
  font-size: 13px;
  font-style: normal;
  line-height: 16px;
`;

type Activable = {
  isActive: boolean;
};

const FlowPathStep = styled.span<Activable>`
  font-weight: ${({ isActive }) => (isActive ? 700 : 400)};
  font-size: 13px;
  font-style: normal;

  line-height: 16px;
  letter-spacing: 0.1px;
`;

const FlowPathDivider = styled.div<Themable>`
  display: flex;
  align-items: center;
  width: 24px;
  height: 24px;
  svg path {
    fill: ${({ theme }) => theme.general.popover.header.textColor};
  }
`;

const FlowPath = (props: { flowPath: FlowStep[] }) => {
  const { themeSettings } = useThemeContext();
  return (
    <FlowPathContainer>
      {props.flowPath
        .map((step) => {
          return (
            <FlowPathStep key={step.title} isActive={step.isCurrentStep}>
              {step.title}
            </FlowPathStep>
          );
        })
        .reduce<ReactNode[]>((acc, currentStep) => {
          if (acc.length === 0) {
            return [currentStep];
          }
          return [
            ...acc,
            <FlowPathDivider key={currentStep.key} theme={themeSettings}>
              <BreadcrumbsArrowsIcon key={currentStep.key} />
            </FlowPathDivider>,
            currentStep,
          ];
        }, [])}
    </FlowPathContainer>
  );
};

const CloseButton = (props: { onClick?: () => void }) => {
  return (
    <CloseIconButton onClick={props.onClick} data-testid="popover-close-button">
      <CloseIcon />
    </CloseIconButton>
  );
};

const CloseIconButton = styled(IconButton)`
  padding: 0;
  width: 24;
  height: 24;
`;
