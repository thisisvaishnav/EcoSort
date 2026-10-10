import { useState, useEffect, useRef, useCallback } from 'react';

export interface CountdownTimerState {
  timeLeft: number;       // seconds remaining
  isWarning: boolean;     // 30s or fewer left
  isUrgent: boolean;      // 10s or fewer left
  isExpired: boolean;     // 0s reached
  isRunning: boolean;
}

export interface CountdownTimerControls {
  start: () => void;
  pause: () => void;
  reset: () => void;
}

/**
 * Countdown timer hook for the Waste Detective level.
 * Returns live state and control functions.
 *
 * @param seconds - Total duration in seconds (default 90)
 */
export function useCountdownTimer(seconds: number = 90): CountdownTimerState & CountdownTimerControls {
  const [timeLeft, setTimeLeft] = useState(seconds);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const durationRef = useRef(seconds);

  useEffect(() => {
    durationRef.current = seconds;
  }, [seconds]);

  const stop = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const start = useCallback(() => {
    stop();
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stop();
          setIsRunning(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [stop]);

  const pause = useCallback(() => {
    stop();
    setIsRunning(false);
  }, [stop]);

  const reset = useCallback(() => {
    stop();
    setIsRunning(false);
    setTimeLeft(durationRef.current);
  }, [stop]);

  // Cleanup on unmount
  useEffect(() => {
    return () => stop();
  }, [stop]);

  return {
    timeLeft,
    isWarning: timeLeft <= 30 && timeLeft > 0,
    isUrgent: timeLeft <= 10 && timeLeft > 0,
    isExpired: timeLeft === 0,
    isRunning,
    start,
    pause,
    reset,
  };
}
