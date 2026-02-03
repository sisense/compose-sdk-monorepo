import styled from '@/infra/styled';
import { LoadingDots } from '@/shared/components/loading-dots';

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
