import LoadingSpinner from '@/common/components/loading-spinner';
import Popper from '@mui/material/Popper';
import DropupSection, { DropupSectionProps } from './common/dropup-section';
import styled from '@emotion/styled';
import { Themable } from '@/theme-provider/types';
import { useThemeContext } from '@/theme-provider/theme-context';

const PopupContent = styled.div<Themable>`
  background-color: ${({ theme }) => theme.aiChat.dropup.backgroundColor};
  border-radius: ${({ theme }) => theme.aiChat.dropup.borderRadius};
  box-shadow: ${({ theme }) => theme.aiChat.dropup.boxShadow};
  padding-top: 8px;
  padding-bottom: 8px;
  display: flex;
  flex-direction: column;
  row-gap: 4px;
`;

export const isCommand = (text: string) => text.startsWith('/');

interface ChatDropupProps {
  recentPrompts: string[];
  suggestions: string[];
  isLoading: boolean;
  onSelection: (q: string) => void;
  anchorEl: HTMLElement | null;
  text: string;
}

export default function ChatDropup({
  recentPrompts,
  suggestions,
  isLoading,
  onSelection,
  anchorEl,
  text,
}: ChatDropupProps) {
  const sections: DropupSectionProps[] = [
    {
      title: '/recent',
      items: recentPrompts,
      onSelect: onSelection,
    },
    {
      title: '/ai suggestions',
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
    >
      <PopupContent style={{ width: anchorEl?.offsetWidth }} theme={themeSettings}>
        {isLoading && <LoadingSpinner />}
        {!isLoading &&
          filteredSections.map((props) => (
            <DropupSection key={props.title} {...props} alwaysExpanded={alwaysExpanded} />
          ))}
      </PopupContent>
    </Popper>
  );
}
