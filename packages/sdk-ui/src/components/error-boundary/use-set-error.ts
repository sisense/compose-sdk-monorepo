import { useState } from 'react';

export const useSetError = () => {
  const [error, setError] = useState<Error>();
  if (error) {
    throw error;
  }

  return setError;
};
