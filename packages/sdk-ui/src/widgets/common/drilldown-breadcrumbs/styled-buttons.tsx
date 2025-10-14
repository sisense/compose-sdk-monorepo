import styled from '@emotion/styled';
import IconButton from '@mui/material/IconButton';

export const StyledPrevButton = styled(IconButton)`
  && {
    position: absolute;
    left: 0;
    right: auto;
    margin: auto;
    bottom: 0;
    top: 0;
    z-index: 10;
    background: linear-gradient(to right, white 30%, rgba(255, 255, 255, 0) 100%);
    display: inline-flex;

    span[aria-label='prev-item'] {
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-right: 5px solid #000;
      color: transparent;
      opacity: 0.3;

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;

export const StyledNextButton = styled(IconButton)`
  && {
    position: absolute;
    left: auto;
    right: 0;
    margin: auto;
    bottom: 0;
    top: 0;
    z-index: 10;
    background: linear-gradient(to right, rgba(255, 255, 255, 0) 0, white 70%);
    display: inline-flex;

    span[aria-label='next-item'] {
      width: 0;
      height: 0;
      border-top: 6px solid transparent;
      border-bottom: 6px solid transparent;
      border-left: 5px solid #000;
      color: transparent;
      opacity: 0.3;

      &:hover {
        opacity: 0.8;
      }
    }
  }
`;
