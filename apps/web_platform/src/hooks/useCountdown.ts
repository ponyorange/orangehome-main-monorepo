import { useState, useEffect, useCallback } from 'react';

/**
 * 倒计时 Hook
 * @param initialSeconds 初始秒数
 * @returns [倒计时, 开始倒计时, 重置倒计时, 是否正在倒计时]
 */
export function useCountdown(
  initialSeconds: number = 60
): [number, () => void, () => void, boolean] {
  const [count, setCount] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (count > 0) {
      const timer = setTimeout(() => {
        setCount(count - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setIsRunning(false);
    }
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
