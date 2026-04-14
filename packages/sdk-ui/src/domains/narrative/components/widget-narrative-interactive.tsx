import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useTranslation } from 'react-i18next';

import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import debounce from 'lodash-es/debounce';

import type { NarrativeRequest } from '@/infra/api/narrative/narrative-api-types.js';
import { sendAiFeedback } from '@/infra/api/narrative/send-ai-feedback.js';
import { useSisenseContext } from '@/infra/contexts/sisense-context/sisense-context';
import { useThemeContext } from '@/infra/contexts/theme-provider';
import { Themable } from '@/infra/contexts/theme-provider/types';
import { useHover } from '@/shared/hooks/use-hover';

import { NarrativeCollapsible } from './narrative-collapsible.js';
import {
  NARRATIVE_TOP_SLOT_LEADING_GUTTER_PX,
  NARRATIVE_TOP_SLOT_TRAILING_GUTTER_PX,
  NarrativeTopSlotShell,
} from './narrative-top-slot-shell.js';

export type WidgetNarrativeInteractiveProps = {
  summary: string;
  narrativeRequest: NarrativeRequest;
};

const NarrativeTopSlotRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 10px;
  width: 100%;
  box-sizing: border-box;
  padding-left: ${NARRATIVE_TOP_SLOT_LEADING_GUTTER_PX}px;
  padding-right: ${NARRATIVE_TOP_SLOT_TRAILING_GUTTER_PX}px;
`;

const IconDiv = styled.div<Themable>`
  align-self: flex-start;
`;

const FeedbackColumn = styled.div<Themable>`
  display: flex;
  flex-direction: column;
  row-gap: ${({ theme }) => theme.aiChat.body.gapBetweenMessages};
`;

function NarrativeAiIcon({ theme }: Themable) {
  const iconColor = theme.general.brandColor;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="-2 -3 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.0533 3.62671e-06C12.0557 -9.45649e-05 12.0577 0.00181346 12.0578 0.00422597C12.1926 3.98958 15.4422 7.18501 19.4491 7.23273C19.4494 7.23273 19.4496 7.23296 19.4496 7.23325C19.4496 7.23356 19.4494 7.23381 19.4491 7.23382C15.3869 7.2822 12.1029 10.5659 12.054 14.628C12.054 14.6283 12.0538 14.6285 12.0535 14.6285C12.0532 14.6285 12.0529 14.6283 12.0529 14.628C12.0047 10.6218 8.80995 7.37281 4.8253 7.23765C4.82287 7.23757 4.82095 7.23552 4.82105 7.2331C4.82114 7.23081 4.82301 7.22897 4.8253 7.2289C8.75488 7.0956 11.9163 3.93392 12.0491 0.004224C12.0492 0.00194873 12.051 9.62326e-05 12.0533 3.62671e-06Z"
        fill={iconColor}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9.0973 12.7759C7.1172 12.7236 5.51984 11.1352 5.45331 9.1587C5.45326 9.1573 5.45209 9.1562 5.4507 9.15625C5.44938 9.1563 5.44832 9.15738 5.44828 9.15869C5.38204 11.1266 3.79825 12.7098 1.83009 12.7751C1.82969 12.7752 1.82936 12.7755 1.82935 12.7759C1.82933 12.7763 1.82967 12.7767 1.83009 12.7767C3.8264 12.8429 5.42727 14.4708 5.45019 16.4778C5.45019 16.4781 5.45045 16.4784 5.45077 16.4784C5.45111 16.4784 5.4514 16.4781 5.4514 16.4778C5.47442 14.4622 7.089 12.8289 9.0973 12.7759Z"
        fill={iconColor}
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2.8778 2.15728C2.87779 2.15701 2.8779 2.15674 2.8781 2.15655C2.87874 2.15591 2.87983 2.15638 2.87981 2.15728C2.87934 2.17566 2.87911 2.1941 2.87911 2.21259C2.87911 3.36434 3.78842 4.30371 4.92829 4.35195C3.78842 4.40019 2.87911 5.33955 2.87911 6.4913C2.87911 6.56284 2.88262 6.63356 2.88947 6.7033C2.89045 6.7133 2.8783 6.71912 2.87119 6.71202C2.86894 6.70976 2.86781 6.70662 2.86813 6.70344C2.87499 6.63366 2.8785 6.56289 2.8785 6.4913C2.8785 5.33956 1.96921 4.40021 0.829346 4.35195C1.96921 4.30369 2.8785 3.36433 2.8785 2.21259C2.8785 2.1941 2.87827 2.17566 2.8778 2.15728ZM5.16566 4.35485C5.16834 4.35503 5.16981 4.35179 5.16791 4.34989C5.16732 4.3493 5.1665 4.34899 5.16567 4.34905C5.14802 4.35023 5.13031 4.3512 5.11255 4.35195C5.13031 4.3527 5.14801 4.35367 5.16566 4.35485Z"
        fill={iconColor}
      />
    </svg>
  );
}

function ThumbsUpGlyph({ color }: { color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5798 14.7911C18.8749 14.4146 19.0165 14.011 18.9985 13.5954C18.9804 13.1377 18.7757 12.7793 18.607 12.5595C18.8027 12.0715 18.878 11.3036 18.2245 10.7073C17.7456 10.2705 16.9325 10.0748 15.806 10.1289C15.014 10.1651 14.3513 10.3127 14.3243 10.3187H14.3213C14.1708 10.3458 14.011 10.3789 13.8484 10.4151C13.8363 10.2223 13.8696 9.74345 14.2248 8.66522C14.6465 7.38231 14.6225 6.40041 14.1466 5.74397C13.6466 5.05425 12.8485 5 12.6136 5C12.3877 5 12.1799 5.09336 12.0324 5.26499C11.6981 5.6535 11.7373 6.37026 11.7793 6.70158C11.3818 7.76777 10.2676 10.382 9.32479 11.1077C9.30668 11.1198 9.2917 11.1349 9.27671 11.1499C8.99949 11.4421 8.81287 11.7583 8.68642 12.0353C8.50861 11.939 8.30687 11.8848 8.08995 11.8848H6.25291C5.56014 11.8848 5 12.448 5 13.1377V18.0318C5 18.7244 5.56323 19.2847 6.25291 19.2847H8.08995C8.35803 19.2847 8.60804 19.2003 8.81287 19.0557L9.52051 19.1401C9.62905 19.1551 11.5565 19.3991 13.5352 19.36C13.8935 19.387 14.2309 19.402 14.5441 19.402C15.0832 19.402 15.5531 19.36 15.9445 19.2756C16.8661 19.0798 17.4957 18.6884 17.8148 18.1131C18.0588 17.6734 18.0588 17.2366 18.0197 16.9596C18.6191 16.4175 18.7244 15.8181 18.7033 15.3965C18.6913 15.1525 18.637 14.9447 18.5798 14.7911ZM6.25291 18.4715C6.00896 18.4715 5.81324 18.2727 5.81324 18.0318V13.1346C5.81324 12.8908 6.0119 12.6949 6.25291 12.6949H8.08995C8.33393 12.6949 8.52981 12.8937 8.52981 13.1346V18.0287C8.52981 18.2727 8.33096 18.4685 8.08995 18.4685H6.25291V18.4715ZM17.8088 14.4387C17.6823 14.5712 17.6582 14.7731 17.7547 14.9298C17.7547 14.9327 17.878 15.1436 17.8932 15.4327C17.9142 15.8272 17.7245 16.1765 17.327 16.4747C17.1854 16.5831 17.1282 16.7699 17.1885 16.9385C17.1885 16.9415 17.3179 17.3391 17.1072 17.7156C16.9052 18.0769 16.4566 18.3359 15.7759 18.4804C15.2309 18.5979 14.4898 18.6191 13.5805 18.5468H13.5383C11.6017 18.589 9.64403 18.3359 9.62302 18.3329H9.61994L9.31583 18.2967C9.3339 18.2125 9.34286 18.1221 9.34286 18.0318V13.1346C9.34286 13.0052 9.32185 12.8787 9.28567 12.7612C9.33992 12.5595 9.49051 12.1106 9.84582 11.7281C11.1981 10.6559 12.5203 7.03893 12.5775 6.88232C12.6016 6.81908 12.6075 6.74981 12.5956 6.68058C12.5443 6.34323 12.5624 5.93058 12.6347 5.80718C12.7943 5.81015 13.225 5.85529 13.484 6.21365C13.7912 6.63837 13.7791 7.39733 13.4478 8.40316C12.9419 9.93624 12.8997 10.7433 13.3003 11.0987C13.4991 11.2764 13.7641 11.2855 13.9569 11.2162C14.1406 11.174 14.3153 11.1378 14.4809 11.1108C14.4929 11.1077 14.508 11.1048 14.52 11.1017C15.4447 10.8999 17.1011 10.7765 17.6763 11.3005C18.1642 11.7462 17.8179 12.3365 17.7788 12.3998C17.6673 12.5684 17.7004 12.7883 17.851 12.9238C17.854 12.9268 18.1702 13.225 18.1852 13.6256C18.1973 13.8935 18.0708 14.1677 17.8088 14.4387Z"
        fill={color}
      />
    </svg>
  );
}

function ThumbsDownGlyph({ color }: { color: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18.5798 9.61098C18.8749 9.98744 19.0165 10.391 18.9985 10.8066C18.9804 11.2643 18.7757 11.6227 18.607 11.8426C18.8027 12.3305 18.878 13.0984 18.2245 13.6947C17.7456 14.1315 16.9325 14.3273 15.806 14.2732C15.014 14.237 14.3513 14.0893 14.3243 14.0833H14.3213C14.1708 14.0562 14.011 14.0231 13.8484 13.9869C13.8363 14.1797 13.8696 14.6585 14.2249 15.7367C14.6465 17.0196 14.6225 18.0016 14.1466 18.6581C13.6466 19.3478 12.8485 19.4019 12.6136 19.4019C12.3877 19.4019 12.1799 19.3086 12.0324 19.137C11.6981 18.7484 11.7373 18.0317 11.7793 17.7004C11.3818 16.6342 10.2676 14.02 9.32479 13.2943C9.30668 13.2822 9.2917 13.2671 9.27671 13.2521C8.99949 12.9599 8.81287 12.6437 8.68642 12.3667C8.50861 12.463 8.30687 12.5173 8.08995 12.5173H6.25291C5.56014 12.5173 5 11.954 5 11.2643L5 6.37029C5 5.67764 5.56323 5.11738 6.25291 5.11738H8.08995C8.35803 5.11738 8.60804 5.20179 8.81287 5.34635L9.52051 5.26191C9.62905 5.24692 11.5565 5.00297 13.5352 5.04209C13.8935 5.01502 14.2309 5 14.5441 5C15.0832 5 15.5531 5.04209 15.9445 5.12649C16.8661 5.32222 17.4957 5.71366 17.8148 6.28898C18.0588 6.72865 18.0588 7.16543 18.0197 7.44247C18.6191 7.98454 18.7244 8.58394 18.7033 9.00555C18.6913 9.2495 18.637 9.4573 18.5798 9.61098ZM6.25291 5.93058C6.00896 5.93058 5.81324 6.12939 5.81324 6.37029V11.2674C5.81324 11.5112 6.0119 11.7071 6.25291 11.7071H8.08995C8.33393 11.7071 8.52981 11.5083 8.52981 11.2674V6.37338C8.52981 6.12939 8.33096 5.93352 8.08995 5.93352H6.25291V5.93058ZM17.8088 9.96331C17.6823 9.83083 17.6582 9.6289 17.7547 9.47229C17.7547 9.46935 17.878 9.25849 17.8932 8.96937C17.9142 8.5748 17.7245 8.22555 17.327 7.92731C17.1854 7.81893 17.1282 7.63217 17.1885 7.46351C17.1885 7.46057 17.3179 7.06291 17.1072 6.68645C16.9052 6.32516 16.4566 6.06619 15.7759 5.92162C15.2309 5.80413 14.4899 5.78293 13.5805 5.85529H13.5383C11.6017 5.81309 9.64403 6.06619 9.62302 6.06912H9.61994L9.31583 6.1053C9.3339 6.18955 9.34286 6.27998 9.34286 6.37029V11.2674C9.34286 11.3968 9.32185 11.5233 9.28567 11.6408C9.33992 11.8425 9.49051 12.2914 9.84582 12.6739C11.1982 13.7461 12.5203 17.3631 12.5775 17.5197C12.6017 17.583 12.6075 17.6521 12.5956 17.7214C12.5443 18.0587 12.5624 18.4715 12.6347 18.5949C12.7943 18.5919 13.225 18.5467 13.484 18.1883C13.7912 17.7636 13.7791 17.0046 13.4478 15.9988C12.9419 14.4657 12.8997 13.6587 13.3003 13.3033C13.4991 13.1256 13.7641 13.1165 13.9569 13.1858C14.1406 13.228 14.3153 13.2641 14.4809 13.2912C14.4929 13.2943 14.508 13.2973 14.52 13.3003C15.4447 13.5021 17.1011 13.6255 17.6763 13.1015C18.1642 12.6558 17.8179 12.0655 17.7788 12.0022C17.6673 11.8336 17.7004 11.6137 17.851 11.4782C17.854 11.4752 18.1702 11.177 18.1852 10.7764C18.1973 10.5085 18.0708 10.2343 17.8088 9.96331Z"
        fill={color}
      />
    </svg>
  );
}

function NarrativeFeedbackRow({
  narrativeTargetKey,
  visible,
  onSend,
  themeSettings,
}: {
  /** Changes when the narrative content changes; used only to reset local feedback UI state. */
  narrativeTargetKey: string;
  visible: boolean;
  onSend: (rating: -1 | 1) => void;
  themeSettings: Themable['theme'];
}) {
  const [clicked, setClicked] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    setClicked(false);
  }, [narrativeTargetKey]);

  const onClick = useCallback(
    (type: 'up' | 'down') => {
      setClicked(true);
      onSend(type === 'up' ? 1 : -1);
    },
    [onSend],
  );

  const styles = `csdk-transition-opacity csdk-delay-150 csdk-duration-500 ${
    clicked ? 'csdk-opacity-0' : 'csdk-opacity-100'
  }`;

  const iconColor = themeSettings.aiChat.icons.color;
  const hoverBg = themeSettings.aiChat.icons.feedbackIcons.hoverColor;

  if (!visible) {
    return null;
  }

  return (
    <div className={`csdk-flex csdk-items-center ${styles}`}>
      <Tooltip title={t('ai.buttons.correctResponse')}>
        <IconButton
          aria-label="thumbs-up"
          onClick={() => onClick('up')}
          disabled={clicked}
          size="small"
          sx={{
            padding: '2px',
            '&:hover': { backgroundColor: hoverBg },
          }}
        >
          <ThumbsUpGlyph color={iconColor} />
        </IconButton>
      </Tooltip>
      <Tooltip title={t('ai.buttons.incorrectResponse')}>
        <IconButton
          aria-label="thumbs-down"
          onClick={() => onClick('down')}
          disabled={clicked}
          size="small"
          sx={{
            padding: '2px',
            '&:hover': { backgroundColor: hoverBg },
          }}
        >
          <ThumbsDownGlyph color={iconColor} />
        </IconButton>
      </Tooltip>
    </div>
  );
}

function NarrativeFeedbackShell({
  narrativeTargetKey,
  sourceId,
  data,
  type,
  buttonVisibility,
  renderContent,
}: {
  /** Changes when the narrative target changes; forwarded for feedback row state reset only. */
  narrativeTargetKey: string;
  sourceId: string;
  data: object;
  type: string;
  buttonVisibility: 'onHover' | 'always' | 'never';
  renderContent: (buttonRow: ReactElement) => ReactNode;
}) {
  const { app } = useSisenseContext();
  const httpClient = app?.httpClient;
  const { themeSettings } = useThemeContext();

  const sendFeedbackCallback = useCallback(
    (rating: -1 | 1) => {
      if (!httpClient) {
        return;
      }
      void sendAiFeedback(httpClient, {
        sourceId,
        type,
        data,
        rating,
      });
    },
    [httpClient, sourceId, data, type],
  );

  const sendFeedback = useMemo(() => debounce(sendFeedbackCallback, 200), [sendFeedbackCallback]);

  useEffect(() => {
    return () => {
      sendFeedback.cancel();
    };
  }, [sendFeedback]);

  const [ref, hovering] = useHover<HTMLDivElement>();

  const areButtonsVisible = useMemo(
    () => buttonVisibility === 'always' || (buttonVisibility === 'onHover' && hovering),
    [hovering, buttonVisibility],
  );

  return (
    <FeedbackColumn ref={ref} theme={themeSettings}>
      {renderContent(
        <NarrativeFeedbackRow
          narrativeTargetKey={narrativeTargetKey}
          visible={areButtonsVisible}
          onSend={sendFeedback}
          themeSettings={themeSettings}
        />,
      )}
    </FeedbackColumn>
  );
}

/**
 * Chart-area narrative text with optional thumbs feedback; mirrors legacy ChartInsights without `modules/ai`.
 *
 * @internal
 */
export function WidgetNarrativeInteractive({
  summary,
  narrativeRequest,
}: WidgetNarrativeInteractiveProps) {
  const { themeSettings } = useThemeContext();

  return (
    <NarrativeFeedbackShell
      narrativeTargetKey={summary}
      sourceId={narrativeRequest.jaql.datasource.title}
      data={narrativeRequest}
      type="chart/insights"
      buttonVisibility="always"
      renderContent={(buttonRow) => (
        <NarrativeTopSlotShell theme={themeSettings}>
          <NarrativeTopSlotRow>
            <IconDiv theme={themeSettings}>
              <NarrativeAiIcon theme={themeSettings} />
            </IconDiv>
            <NarrativeCollapsible text={summary} />
            {buttonRow}
          </NarrativeTopSlotRow>
        </NarrativeTopSlotShell>
      )}
    />
  );
}
