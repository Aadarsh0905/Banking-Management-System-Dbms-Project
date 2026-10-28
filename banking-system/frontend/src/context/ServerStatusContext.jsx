// ============================================================
// src/context/ServerStatusContext.jsx
// Monitors Render backend cold-start status & health
// ============================================================
import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { baseURL } from '../services/api';

const ServerStatusContext = createContext(null);

export function ServerStatusProvider({ children }) {
  const [status, setStatus] = useState('checking'); // 'checking' | 'waking' | 'online' | 'offline'
  const [isWaking, setIsWaking] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [latency, setLatency] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [hasWokenUpOnce, setHasWokenUpOnce] = useState(false);
  const [lastChecked, setLastChecked] = useState(null);

  const timerRef = useRef(null);
  const checkInProgressRef = useRef(false);
  const wakingTimeoutRef = useRef(null);
  const userDismissedRef = useRef(false);

  // Health endpoint URL
  const healthUrl = `${baseURL}/actuator/health`;

  // Start seconds timer when checking or waking
  const startTimer = useCallback(() => {
    if (timerRef.current) return;
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // Primary health check function
  const checkHealth = useCallback(async (isManualTrigger = false) => {
    if (checkInProgressRef.current && !isManualTrigger) return;
    checkInProgressRef.current = true;

    const startTime = Date.now();
    startTimer();

    // If after 2.0 seconds the response hasn't returned, server is waking up (cold start)
    if (!wakingTimeoutRef.current) {
      wakingTimeoutRef.current = setTimeout(() => {
        setIsWaking(true);
        setStatus('waking');
        if (!userDismissedRef.current) {
          setShowModal(true);
        }
      }, 2000);
    }

    try {
      // Axios request with generous timeout so Render proxy connection completes on cold boot
      const res = await axios.get(healthUrl, {
        timeout: 65000,
        headers: { 'Cache-Control': 'no-cache', 'Pragma': 'no-cache' }
      });

      const roundTrip = Date.now() - startTime;
      setLatency(roundTrip);
      setLastChecked(new Date());

      if (res.status === 200 && (res.data?.status === 'UP' || res.data?.status || typeof res.data === 'object')) {
        clearTimeout(wakingTimeoutRef.current);
        wakingTimeoutRef.current = null;
        stopTimer();

        setStatus('online');
        setIsOnline(true);
        setIsWaking(false);
        setHasWokenUpOnce(true);

        // Keep modal in success state for 2.4 seconds then smoothly close
        if (showModal) {
          setTimeout(() => {
            setShowModal(false);
          }, 2400);
        }
      } else {
        throw new Error('Health check returned non-UP status');
      }
    } catch (err) {
      // If error occurred and not timed out yet, retry in 3.5s while cold start continues
      clearTimeout(wakingTimeoutRef.current);
      wakingTimeoutRef.current = null;

      // 502/503 or network error typically means container is still booting on Render
      setIsWaking(true);
      setStatus('waking');
      if (!userDismissedRef.current) {
        setShowModal(true);
      }

      // Retry every 3.5 seconds until container comes alive
      setTimeout(() => {
        checkInProgressRef.current = false;
        checkHealth();
      }, 3500);
      return;
    } finally {
      checkInProgressRef.current = false;
    }
  }, [healthUrl, showModal, startTimer, stopTimer]);

  // Initial check on mount
  useEffect(() => {
    checkHealth();

    // Keep-alive heartbeat every 5 minutes while user has tab active
    const heartbeat = setInterval(() => {
      checkHealth();
    }, 5 * 60 * 1000);

    return () => {
      stopTimer();
      clearTimeout(wakingTimeoutRef.current);
      clearInterval(heartbeat);
    };
  }, [checkHealth, stopTimer]);

  const dismissModal = () => {
    userDismissedRef.current = true;
    setShowModal(false);
    setMinimized(true);
  };

  const openModal = () => {
    userDismissedRef.current = false;
    setMinimized(false);
    setShowModal(true);
  };

  return (
    <ServerStatusContext.Provider
      value={{
        status,
        isWaking,
        isOnline,
        elapsedSeconds,
        latency,
        showModal,
        minimized,
        hasWokenUpOnce,
        lastChecked,
        healthUrl,
        dismissModal,
        openModal,
        setShowModal,
        checkHealth: () => checkHealth(true),
      }}
    >
      {children}
    </ServerStatusContext.Provider>
  );
}

export const useServerStatus = () => {
  const context = useContext(ServerStatusContext);
  if (!context) {
    return {
      status: 'online',
      isWaking: false,
      isOnline: true,
      elapsedSeconds: 0,
      latency: 0,
      showModal: false,
      minimized: false,
      hasWokenUpOnce: true,
      lastChecked: null,
      healthUrl: '',
      dismissModal: () => {},
      openModal: () => {},
      setShowModal: () => {},
      checkHealth: () => {},
    };
  }
  return context;
};
