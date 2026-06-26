'use client';

import { useState, useEffect } from 'react';

export function useCountdown(initialSeconds: number) {
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);

  const start = () => {
    setSeconds(initialSeconds);
    setIsActive(true);
  };

  useEffect(() => {
    if (!isActive) return;
    if (seconds <= 0) { setIsActive(false); return; }
    const timer = setTimeout(() => setSeconds(s => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [seconds, isActive]);

  return { seconds, isActive, start };
}
