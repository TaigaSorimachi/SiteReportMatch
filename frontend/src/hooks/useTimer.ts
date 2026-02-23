import { useState, useEffect, useCallback } from 'react';

export function useTimer(startTime: Date | null) {
  const [elapsed, setElapsed] = useState(0);
  const [breakTotal, setBreakTotal] = useState(0);
  const [isOnBreak, setIsOnBreak] = useState(false);
  const [breakStart, setBreakStart] = useState<Date | null>(null);

  useEffect(() => {
    if (!startTime) return;
    const id = setInterval(() => {
      const now = Date.now();
      const total = Math.floor((now - startTime.getTime()) / 1000);
      const breakExtra = isOnBreak && breakStart
        ? Math.floor((now - breakStart.getTime()) / 1000)
        : 0;
      setElapsed(Math.max(0, total - breakTotal - breakExtra));
    }, 1000);
    return () => clearInterval(id);
  }, [startTime, breakTotal, isOnBreak, breakStart]);

  const startBreak = useCallback(() => {
    setIsOnBreak(true);
    setBreakStart(new Date());
  }, []);

  const endBreak = useCallback(() => {
    if (breakStart) {
      setBreakTotal((t) => t + Math.floor((Date.now() - breakStart.getTime()) / 1000));
    }
    setIsOnBreak(false);
    setBreakStart(null);
  }, [breakStart]);

  return { elapsed, breakTotal, isOnBreak, startBreak, endBreak };
}
