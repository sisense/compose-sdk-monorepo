import emotionStyled, { CreateStyled } from '@emotion/styled';

import { withCssSelectorPrefix } from './with-css-selector-prefix';

// Styled instance with applied custom decorators
const styled = withCssSelectorPrefix(emotionStyled);

export type { CreateStyled };
export default styled;
