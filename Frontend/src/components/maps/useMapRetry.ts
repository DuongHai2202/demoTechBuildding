import { useCallback, useState } from 'react';

export function useMapRetry() {
  const [retryKey, setRetryKey] = useState(0);
  const retry = useCallback(() => setRetryKey((current) => current + 1), []);
  return { retryKey, retry };
}
