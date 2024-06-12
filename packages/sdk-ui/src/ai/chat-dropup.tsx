import LoadingSpinner from '@/common/components/loading-spinner';
import Popper from '@mui/material/Popper';
import DropupSection, { DropupSectionProps } from './common/dropup-section';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider/theme-context';

const PopupContent = styled.div<Themable>`
  font-family: ${({ theme }) => theme.typography.fontFamily};
  font-size: ${({ theme }) => theme.aiChat.primaryFontSize[0]};
  line-height: ${({ theme }) => theme.aiChat.primaryFontSize[1]};
  background-color: ${({ theme }) => theme.aiChat.dropup.backgroundColor};
  border-radius: ${({ theme }) => theme.aiChat.dropup.borderRadius};
  box-shadow: ${({ theme }) => theme.aiChat.dropup.boxShadow};
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  row-gap: 4px;
`;

const ErrorMessage = styled.div<Themable>`
  font-size: ${({ theme }) => theme.aiChat.primaryFontSize[0]};
  line-height: ${({ theme }) => theme.aiChat.primaryFontSize[1]};
  color: ${({ theme }) => theme.aiChat.dropup.items.textColor};
  padding: 4px 12px;
`;

export const isCommand = (text: string) => text.startsWith('/');

interface ChatDropupProps {
  recentPrompts: string[];
  suggestions: string[];
  isLoading: boolean;
  onSelection: (q: string) => void;
  anchorEl: HTMLElement | null;
  text: string;
  recommendationsError: boolean;
}

export default function ChatDropup({
  recentPrompts,
  suggestions,
  isLoading,
  onSelection,
  anchorEl,
  text,
  recommendationsError,
}: ChatDropupProps) {
  const sections: DropupSectionProps[] = [
    {
      title: '/recent searches',
      items: recentPrompts,
      onSelect: onSelection,
    },
    {
      title: '/ai recommendations',
      items: suggestions,
      onSelect: onSelection,
    },
  ];

  const filteredSections = sections.filter(
    (section) => section.title.slice(0, text.length) === text,
  );

  const { themeSettings } = useThemeContext();

  const alwaysExpanded = filteredSections.length === 1;

  return (
    <Popper
      open={isCommand(text) && filteredSections.length > 0}
      anchorEl={anchorEl}
      placement={'top-start'}
      modifiers={[
        {
          name: 'offset',
          options: {
            offset: [0, 4],
          },
        },
      ]}
      sx={{ zIndex: 2 }}
    >
      <PopupContent style={{ width: anchorEl?.offsetWidth }} theme={themeSettings}>
        {isLoading && <LoadingSpinner />}
        {!isLoading &&
          !recommendationsError &&
          filteredSections.map((props) => (
            <DropupSection key={props.title} {...props} alwaysExpanded={alwaysExpanded} />
          ))}
        {recommendationsError && (
          <ErrorMessage theme={themeSettings}>
            Recommendations aren't available right now. Try again in a few minutes.
          </ErrorMessage>
        )}
      </PopupContent>
    </Popper>
  );
}
