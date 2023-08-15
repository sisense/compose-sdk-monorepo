/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { FloatStyle } from '../../styles';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function FloatingPop({ children, showPop }: any) {
  return <FloatStyle showPop={showPop}>{children}</FloatStyle>;
}

export default FloatingPop;
