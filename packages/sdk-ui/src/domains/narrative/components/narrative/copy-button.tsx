import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import IconButton from '@mui/material/IconButton';

import { useThemeContext } from '@/infra/contexts/theme-provider';
import Tooltip from '@/modules/ai/common/tooltip';
import { MIN_TOUCH_TARGET_SIZE } from '@/shared/const';

/** How long the copied confirmation stays before the button returns to its resting glyph. */
const COPIED_FEEDBACK_MS = 4000;

/** Copy glyph exported from the reference design. */
function CopyIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M13.5 0C14.8807 0 16 1.11929 16 2.5V10.5C16 11.8807 14.8807 13 13.5 13H13V13.5C13 14.8807 11.8807 16 10.5 16H2.5C1.11948 15.9998 3.29779e-05 14.8806 0 13.5V5.5C1.28842e-07 4.11941 1.11946 3.0002 2.5 3H3V2.5C3 1.11941 4.11946 0.000197899 5.5 0H13.5ZM2.5 4C1.67174 4.0002 1 4.67169 1 5.5V13.5C1.00003 14.3283 1.67176 14.9998 2.5 15H10.5C11.3284 15 12 14.3284 12 13.5V5.5C12 4.67157 11.3284 4 10.5 4H2.5ZM5.5 1C4.67174 1.0002 4 1.6717 4 2.5V3H10.5C11.8807 3 13 4.11929 13 5.5V12H13.5C14.3284 12 15 11.3284 15 10.5V2.5C15 1.67157 14.3284 1 13.5 1H5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

/** Confirmation checkmark exported from the reference design's copied state. */
function CopiedIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g transform="translate(3.572 4.068)">
        <path
          d="M7.94918 0.209331C8.10973 -0.0152148 8.4218 -0.0673393 8.64645 0.0931198C8.87104 0.253593 8.92298 0.565714 8.76266 0.790385L3.70992 7.86363L0.146447 4.30015C-0.0488155 4.10489 -0.0488156 3.78838 0.146447 3.59312C0.341714 3.39792 0.658236 3.39788 0.853478 3.59312L3.58297 6.32261L7.94918 0.209331Z"
          fill="currentColor"
        />
      </g>
    </svg>
  );
}

/**
 * Renders the header action that copies the generated narrative to the clipboard, formatting preserved.
 * @remarks
 * Presentational: it receives the ready-made copy text and knows nothing about the narrative
 * state. Injection into the widget header is wired separately.
 * @param props - Component props.
 * @param props.copyText - The narrative as plain text with formatting preserved.
 * @returns The copy button.
 * @internal
 */
export function NarrativeCopyButton({ copyText }: { copyText: string }) {
  const { t } = useTranslation();
  const { themeSettings } = useThemeContext();
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  useEffect(() => () => clearTimeout(timeoutRef.current), []);

  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(copyText);
      setCopied(true);
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setCopied(false), COPIED_FEEDBACK_MS);
    } catch {
      // Clipboard access denied or unavailable (non-secure context); the action stays inert.
    }
  }, [copyText]);

  const color = themeSettings.widget.header.titleTextColor;

  return (
    <Tooltip title={copied ? t('narrativeWidget.copied') : t('narrativeWidget.copy')}>
      {/* A disabled button fires no pointer events, so the tooltip anchors on the wrapper. */}
      <span style={{ display: 'inline-flex' }}>
        <IconButton
          onClick={copy}
          // While the confirmation shows, the button is inert: same colour, no hover state.
          disabled={copied}
          aria-label={copied ? t('narrativeWidget.copied') : t('narrativeWidget.copy')}
          sx={{
            p: 0,
            ...MIN_TOUCH_TARGET_SIZE,
            color,
            '&.Mui-disabled': { color },
            ...(copied ? { '&:hover': { backgroundColor: 'transparent' } } : {}),
          }}
          data-testid="csdk-narrative-copy-button"
        >
          {copied ? <CopiedIcon /> : <CopyIcon />}
        </IconButton>
      </span>
    </Tooltip>
  );
}
