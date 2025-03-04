import { LoadingDots } from '@/common/components/loading-dots';
import styled from '@emotion/styled';

const Container = styled.div`
  display: flex;
  justify-content: center;
  padding: 10px 0;
`;

export const SmallLoader = () => (
  <Container>
    <LoadingDots color={'grey'} />
  </Container>
);
