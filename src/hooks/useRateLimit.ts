import { useState, useEffect } from 'react';
import { checkRateLimit, RateLimitConfig, formatRemainingTime } from '../lib/rateLimit';

export function useRateLimit(key: string, config: RateLimitConfig) {
  const [isAllowed, setIsAllowed] = useState(true);
  const [remainingTime, setRemainingTime] = useState(0);

  useEffect(() => {
    if (remainingTime > 0) {
      const timer = setInterval(() => {
        const { allowed, remainingTime: newTime } = checkRateLimit(key, config);
        setIsAllowed(allowed);
        setRemainingTime(newTime);
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [remainingTime, key]);

  const checkLimit = () => {
    const { allowed, remainingTime } = checkRateLimit(key, config);
    setIsAllowed(allowed);
    setRemainingTime(remainingTime);
    return allowed;
  };

  return {
    isAllowed,
    remainingTime,
    checkLimit,
    formattedTime: formatRemainingTime(remainingTime)
  };
}