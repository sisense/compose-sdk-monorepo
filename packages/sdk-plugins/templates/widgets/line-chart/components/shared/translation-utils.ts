export type RotationType = 'horizontal' | 'diagonal' | 'vertical';

export const getRotationType = (rotation: number): RotationType => {
  const normalizedRotation = Math.abs(rotation) % 180;
  if (normalizedRotation < 20) {
    return 'horizontal';
  } else if (normalizedRotation < 60) {
    return 'diagonal';
  } else if (normalizedRotation < 120) {
    return 'vertical';
  } else if (normalizedRotation < 160) {
    return 'diagonal';
  } else {
    return 'horizontal';
  }
};
