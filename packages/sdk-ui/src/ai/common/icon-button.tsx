import styled, { CreateStyled } from '@emotion/styled';
import MuiIconButton, {
  type IconButtonProps as MuiIconButtonProps,
} from '@mui/material/IconButton';

import { colors } from '@/themes/colors';

// https://github.com/emotion-js/emotion/issues/2193#issuecomment-958381691
const transientOptions: Parameters<CreateStyled>[1] = {
  shouldForwardProp: (propName: string) => !propName.startsWith('$'),
};

interface IconButtonProps extends MuiIconButtonProps {
  $hoverColor?: string;
}

const IconButton = styled(
  MuiIconButton,
  transientOptions,
)<IconButtonProps>(({ $hoverColor }) => ({
  padding: 2,
  '&.MuiIconButton-root:hover': {
    backgroundColor: $hoverColor ?? colors.interaction.defaultHover,
  },
}));

export default IconButton;
