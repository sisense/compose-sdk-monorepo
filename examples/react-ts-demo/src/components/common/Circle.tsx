import styled from 'styled-components';

const SvgText = styled.h2`
  position: absolute;
  color: #000;
  font-size: 48px;
  left: 50%;
  top: 33%;
  transform: translate(-50%, -50%);
`;

const Underlay = styled.path`
  stroke-width: 5;
  fill: transparent;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke: #24303a;
`;

const SvgWrapper = styled.svg`
  display: inline-block;
  position: relative;
`;

const SvgContainer = styled.div`
  position: relative;
  text-align: center;
`;

const CircleGraph = styled.path`
  stroke: url(#myGradient-2);
  stroke-width: 5;
  fill: transparent;
  stroke-linecap: round;
  stroke-linejoin: round;
  transition: stroke-dashoffset 0.3s ease;
`;

const Circle = ({ temp }: { temp: number }) => {
  return (
    <SvgContainer>
      <SvgText>{Math.floor((temp / 28000) * 100)}%</SvgText>
      <SvgWrapper id="chart-3" width="90%" viewBox="0 0 100 100">
        <defs>
          <radialGradient id="myGradient-2">
            <stop offset="10%" stopColor={'blue'} />
            <stop offset="95%" stopColor={'hotpink'} />
          </radialGradient>
        </defs>
        <Underlay d="M5,50 A45,45,0 1 1 95,50 A45,45,0 1 1 5,50"></Underlay>
        <CircleGraph
          d="M5,50 A45,45,0 1 1 95,50 A45,45,0 1 1 5,50"
          style={{
            strokeDashoffset: Math.floor((temp / 28000) * 100),
            strokeDasharray: 280,
          }}
        ></CircleGraph>
      </SvgWrapper>
    </SvgContainer>
  );
};
export default Circle;
