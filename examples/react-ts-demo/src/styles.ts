/* eslint-disable max-lines */
import styled, { css } from 'styled-components';

interface ButtonInt {
  active?: boolean;
  height?: string;
  bcolor?: string;
  bordercolor?: string;
  color?: string;
}
const Button = styled.button<ButtonInt>`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin: 10px;
  padding: 6px 14px;
  font-family: -apple-system, BlinkMacSystemFont, 'Roboto', sans-serif;
  border-radius: 6px;
  border: none;

  background: #6e6d70;
  box-shadow: 0px 0.5px 1px rgba(0, 0, 0, 0.1), inset 0px 0.5px 0.5px rgba(255, 255, 255, 0.5),
    0px 0px 0px 0.5px rgba(0, 0, 0, 0.12);
  color: #dfdedf;
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;

  &:focus {
    box-shadow: inset 0px 0.8px 0px -0.25px rgba(255, 255, 255, 0.2),
      0px 0.5px 1px rgba(0, 0, 0, 0.1), 0px 0px 0px 3.5px rgba(58, 108, 217, 0.5);
    outline: 0;
  }
`;
interface TextProps {
  align?: string;
  size?: string;
  weight?: string;
}

const TitleStyle = styled.h1<TextProps>`
  margin: 0;
  text-align: ${(p) => p.align};
  font-size: ${(p) => p.size};
  font-weight: ${(p) => p.weight};
`;

const Text = styled.p<TextProps>`
  font-family: 'Archivo', sans-serif;
  text-align: ${(p) => p.align};
  font-size: ${(p) => p.size};
  font-weight: ${(p) => p.weight};
  background: -webkit-linear-gradient(#61bb47, #c1c335);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  padding: 0 20px;
`;

const DashboardStyle = styled.div`
  background-color: #f3f6fa;
`;

const ChartStyle = styled.div`
  border-radius: 3px;
  height: 400px;
  flex: 1;
  background-color: #fff;
  padding: 10px;
`;

const SelectStyle = styled.div`
  position: relative;
  width: 100%;
  min-width: 15ch;
  max-width: 30ch;
  border: 1px solid var(--select-border);
  border-radius: 0.25em;
  padding: 0.25em 0.5em;
  font-size: 1.25rem;
  cursor: pointer;
  line-height: 1.1;
  background-color: #fff;
  background-image: linear-gradient(to top, #f9f9f9, #fff 33%);
  display: grid;
  grid-template-areas: 'select';
  align-items: center;
  &:disabled {
    cursor: not-allowed;
    background-color: #eee;
    background-image: linear-gradient(to top, #ddd, #eee 33%);
  }
  &:after {
    content: '';
    width: 0.8em;
    height: 0.5em;
    background-color: var(--select-arrow);
    clip-path: polygon(100% 0%, 0 0%, 50% 100%);
    grid-area: select;
    justify-self: end;
  }
  span {
  }
  select {
    grid-area: select;
    appearance: none;
    background-color: transparent;
    border: none;
    padding: 0 1em 0 0;
    margin: 0;
    width: 100%;
    font-family: inherit;
    font-size: inherit;
    cursor: inherit;
    line-height: inherit;
    outline: none;
    &:focus + span {
      position: absolute;
      top: -1px;
      left: -1px;
      right: -1px;
      bottom: -1px;
      border: 2px solid var(--select-focus);
      border-radius: inherit;
    }
  }
`;

const Filters = styled.div`
  input {
    height: 24px;
    border-radius: 4px;
    border: 1px solid #b7b2b2;
  }
`;

const FlexBox = styled.div`
  display: flex;
`;

interface ContainerProps {
  direction?: string;
  justify?: string;
  align?: string;
  bbottom?: string;
  height?: string;
  bcolor?: string;
  padding?: string;
  margin?: string;
  overflow?: string;
  grow?: number;
  shrink?: number;
  wrap?: string;
}

const Container = styled(FlexBox)<ContainerProps>`
  flex-direction: ${(p) => p.direction};
  justify-content: ${(p) => p.justify};
  align-items: ${(p) => p.align};
  padding: ${(p) => p.padding};
  border-bottom: ${(p) => p.bbottom};
  height: ${(p) => p.height};
  margin: ${(p) => p.margin};
  background-color: ${(p) => p.bcolor};
  overflow: ${(p) => p.overflow};
  flex-grow: ${(p) => p.grow};
  flex-shrink: ${(p) => p.shrink};
  flex-wrap: ${(p) => p.wrap};
  width: 100%;
`;

const CompositeWrapper = styled(Container)`
  bar-chart {
    flex-grow: 1;
  }
`;

const FlexContainer = styled.div`
  display: flex;
  flex-direction: row;
  overflow: hidden;
  padding: 20px;

  @media (max-width: 1200px) {
    flex-direction: column;
    flex-wrap: nowrap;
  }
`;

const LoaderStyle = styled.div`
  margin: 10px;
  background: #eee;
  background: linear-gradient(90deg, #ececec 8%, #f5f5f5 18%, #ececec 33%);
  background-size: 200% 100%;
  animation: 1s shine linear infinite;
  border-radius: 9px;
  box-shadow: 4px 4px 10px 2px #ccc;
  position: relative;
  @keyframes shine {
    to {
      background-position-x: -200%;
    }
  }
  p {
    padding: 10px;
  }
`;

const NavBarStyle = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 70px;
  margin: 0;
  background-color: #e3e3e3;
  ul {
    list-style-type: none;
    padding: 0 0 0 40px;
  }
  a {
    color: black;
    text-decoration: none;
    border-bottom: 2px solid #e3e3e3;
    &.selected {
      border-bottom: 2px solid black;
    }
    &:hover {
      cursor: pointer;
    }
    padding: 20px 20px;
    &:active,
    &:hover {
      border-bottom: 2px solid #3791ff;
    }
  }
`;

const MainWrapper = styled.div`
  display: flex;
  flex-direction: row;
`;

const RightContent = styled.div`
  margin-left: 120px;
  width: 100%;
`;

const UserToolBarStyle = styled.div`
  padding: 0 40px 0 0;
  display: flex;
  align-items: center;
`;

interface UserImageProps {
  src?: string;
  title: string;
}

const UserImageStyle = styled.img<UserImageProps>`
  width: 45px;
  height: 45px;
  border-radius: 30px;
`;

const UserInfoStyle = styled.div`
  margin: 0;
  padding: 0 20px;
  h3 {
    font-size: 13px;
  }
  p {
    font-size: 10px;
    color: #756969;
  }
`;

const NavSideStyle = styled.ul`
  height: 100vh;
  display: flex;
  flex-direction: column;
  margin: 0;
  background-color: #000000;
  vertical-align: center;
  overflow-y: auto;
  position: fixed;
  z-index: 1;
  width: 120px;
  padding: 10px 0;
  a {
    font-size: 30px;
    color: white;
    text-decoration: none;
    height: 90px;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    &:hover {
      background-color: #5a7aa0;
    }
    &.selected {
      background-color: #3791ff;
    }
  }
  a:first-of-type {
    margin: 10px 0;
  }
  &:first-child {
    &:hover {
      cursor: pointer;
      background-color: #000000;
    }
  }
`;

const OverviewStyle = styled.div`
  padding: 20px;
  height: 100vh;
`;

const ChartContainer = styled.div`
  position: relative;
  min-height: 400px;
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-template-rows: repeat(auto-fill, auto-fill);
  grid-row-gap: 0.5em;
  grid-column-gap: 1em;
`;

interface ModalProps {
  visible?: boolean;
}

const ModalContainer = styled.div<ModalProps>`
  position: absolute;
  opacity: ${(p) => (p.visible ? '1' : '0')};
  visibility: ${(p) => (p.visible ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease-in, visibility 0.3s ease-in;
  overflow: hidden;
  border-radius: 9px;
  top: 30vh;
  left: 15vw;
  display: flex;
  flex-direction: column;
  background-color: #dfddda;
  box-shadow: -1px 4px 13px 3px #858585;
  padding: 20px;
  z-index: 9999;
  /* min-height: 500px; */
  max-height: 500px;
  align-items: flex-end;
  span {
    cursor: pointer;
  }
`;

interface MeasureProps {
  color?: string;
}
const MeasureArrows = styled.span<MeasureProps>`
  display: flex;
  font-size: 30px;
  color: ${(p) => p.color};
`;

interface ToggleProps {
  active?: boolean;
}

const ToggleWrapper = styled.div<ToggleProps>`
  display: flex;
  border-radius: 30px;
  background-color: ${(p) => (p.active ? '#30d730' : '#ccc')};
  width: 66px;
  height: 33px;
  cursor: pointer;
`;

const ToggleContainer = styled(Container)`
  p {
    margin: 10px;
  }
`;

const InnerToggle = styled.div<ToggleProps>`
  width: 33px;
  height: 33px;
  border-radius: 30px;
  background-color: ${(p) => (p.active ? '#ccc' : '#918686')};
  transition: background-color 0.3s ease-in, transform 0.3s ease-in;
  transform: ${(p) => (p.active ? css`translateX(100%)` : css`translateX(0)`)};
  cursor: pointer;
`;

const TableContainer = styled.div``;

interface FloatInter {
  showPop?: boolean;
}
const FloatStyle = styled.div<FloatInter>`
  opacity: ${(p) => (p.showPop ? 1 : 0)};
  visibility: ${(p) => (p.showPop ? 'visible' : 'hidden')};
  transition: opacity 0.3s ease-out;
  position: absolute;
  right: 20px;
  top: 75px;
  display: flex;
  flex-direction: column;
  padding: 10px;
  background: #fff;
  border-radius: 10px;
  z-index: 999;
  box-shadow: 1px 4px 6px #ccc;
  ul {
    padding: 0;
    li {
      display: flex;
      align-items: center;
      list-style-type: none;
      border-radius: 7px;
      margin: 5px;
      padding: 5px;
      cursor: pointer;
      &:hover {
        background-color: #ccc;
      }
    }
  }
`;

const UserWrapper = styled(Container)`
  cursor: pointer;
  align-items: center;
  margin: 0 10px;
  padding: 5px;
  &:hover {
    background: #ccc;
    border-radius: 10px;
  }
`;

const Input = styled.input`
  border-radius: 20px;
  margin-left: 10px;
  width: 20em;
`;

export {
  UserWrapper,
  FloatStyle,
  TitleStyle,
  DashboardStyle,
  ChartStyle,
  SelectStyle,
  Filters,
  Container,
  FlexBox,
  LoaderStyle,
  MainWrapper,
  NavBarStyle,
  NavSideStyle,
  RightContent,
  OverviewStyle,
  UserToolBarStyle,
  UserImageStyle,
  UserInfoStyle,
  FlexContainer,
  Button,
  Text,
  ChartContainer,
  ModalContainer,
  MeasureArrows,
  ToggleWrapper,
  InnerToggle,
  TableContainer,
  CompositeWrapper,
  ToggleContainer,
  Input,
};
