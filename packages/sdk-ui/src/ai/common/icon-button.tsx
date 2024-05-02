import styled, { CreateStyled } from '@emotion/styled';
import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';

import { colors } from '@/themes/colors';
import { CompleteThemeSettings } from '@/types';
import { getSlightlyDifferentColor } from '@/utils/color';

// https://github.com/emotion-js/emotion/issues/2193#issuecomment-958381691
const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

interface IconButtonProps extends MuiIconButtonProps {
  $themeSettings?: CompleteThemeSettings;
}

const IconButton = styled(
  MuiIconButton,
  transientOptions,
)<IconButtonProps>(({ $themeSettings }) => ({
  padding: 2,
  '&.MuiIconButton-root:hover': {
    backgroundColor: $themeSettings
      ? getSlightlyDifferentColor($themeSettings.chart.backgroundColor)
      : colors.interaction.defaultHover,
  },
}));

export default IconButton;
