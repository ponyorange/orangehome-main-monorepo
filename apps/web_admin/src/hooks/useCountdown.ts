import { useState, useEffect, useCallback } from 'react';

/**
 * 倒计时 Hook
 */
export function useCountdown(
  initialSeconds = 60
): [number, () => void, () => void, boolean] {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => setCount((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    setIsRunning(false);
  }, [count]);

  const start = useCallback(() => {
    setCount(initialSeconds);
    setIsRunning(true);
  }, [initialSeconds]);

  const reset = useCallback(() => {
    setCount(0);
    setIsRunning(false);
  }, []);

  return [count, start, reset, isRunning];
}
