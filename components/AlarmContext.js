import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { Audio } from 'expo-av';

export const AlarmContext = createContext();

export const AlarmProvider = ({ children }) => {
  const [activeAlarms, setActiveAlarms] = useState({});
  const [soundLoaded, setSoundLoaded] = useState(false);
  const soundObject = useRef(new Audio.Sound());
  const alarmIntervals = useRef({});
  const alarmDurations = useRef({});

  useEffect(() => {
    loadSound();
    return () => {
      unloadSound();
    };
  }, []);

  const loadSound = async () => {
    try {
      await soundObject.current.loadAsync(require('../assets/alarm2.mp3'));
      setSoundLoaded(true);
    } catch (error) {
      console.error('Error loading sound', error);
    }
  };

  const unloadSound = async () => {
    if (soundLoaded) {
      try {
        await soundObject.current.unloadAsync();
      } catch (error) {
        console.error('Error unloading sound', error);
      }
    }
  };

  const playAlarmLoop = async (rectifierId) => {
    if (soundLoaded) {
      try {
        await soundObject.current.setPositionAsync(0);
        await soundObject.current.playAsync();
        alarmDurations.current[rectifierId] += 1500; // Increment by 1.5 seconds

        if (alarmDurations.current[rectifierId] >= 30000) {
          stopAlarm(rectifierId);
        }
      } catch (error) {
        console.error('Error playing sound', error);
      }
    } else {
      console.warn('Attempted to play sound before it was loaded');
    }
  };

  const startAlarm = useCallback((rectifierId) => {
    if (!activeAlarms[rectifierId] && soundLoaded) {
      alarmDurations.current[rectifierId] = 0;
      playAlarmLoop(rectifierId);
      alarmIntervals.current[rectifierId] = setInterval(() => playAlarmLoop(rectifierId), 1500);
      setActiveAlarms(prev => ({ ...prev, [rectifierId]: true }));
    }
  }, [activeAlarms, soundLoaded]);

  const stopAlarm = useCallback((rectifierId) => {
    if (alarmIntervals.current[rectifierId]) {
      clearInterval(alarmIntervals.current[rectifierId]);
      delete alarmIntervals.current[rectifierId];
    }
    delete alarmDurations.current[rectifierId];
    if (soundLoaded) {
      soundObject.current.stopAsync();
    }
    setActiveAlarms(prev => {
      const newAlarms = { ...prev };
      delete newAlarms[rectifierId];
      return newAlarms;
    });
  }, [soundLoaded]);

  const stopAllAlarms = useCallback(() => {
    Object.keys(activeAlarms).forEach(rectifierId => {
      stopAlarm(rectifierId);
    });
  }, [stopAlarm, activeAlarms]);

  const contextValue = {
    activeAlarms,
    startAlarm,
    stopAlarm,
    stopAllAlarms,
  };

  return (
    <AlarmContext.Provider value={contextValue}>
      {children}
    </AlarmContext.Provider>
  );
};