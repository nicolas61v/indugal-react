import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timers, setTimers] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const intervalsRef = useRef({});
  const saveTimerTimeout = useRef(null);

  useEffect(() => {
    loadTimers();
    return () => {
      if (saveTimerTimeout.current) {
        clearTimeout(saveTimerTimeout.current);
      }
      Object.values(intervalsRef.current).forEach(clearInterval);
    };
  }, []);

  const loadTimers = async () => {
    try {
      const storedTimers = await AsyncStorage.getItem('timers');
      const storedStates = await AsyncStorage.getItem('activeStates');
      if (storedTimers) setTimers(JSON.parse(storedTimers));
      if (storedStates) setActiveStates(JSON.parse(storedStates));
    } catch (error) {
      console.error('Error loading timers or states:', error);
    }
  };

  const saveTimers = useCallback((newTimers) => {
    if (saveTimerTimeout.current) {
      clearTimeout(saveTimerTimeout.current);
    }
    saveTimerTimeout.current = setTimeout(async () => {
      try {
        await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
      } catch (error) {
        console.error('Error saving timers:', error);
      }
    }, 1000);
  }, []);

  const saveActiveStates = useCallback(async (newStates) => {
    try {
      await AsyncStorage.setItem('activeStates', JSON.stringify(newStates));
    } catch (error) {
      console.error('Error saving active states:', error);
    }
  }, []);

  const handleCommand = useCallback((command) => {
    fetch(`http://192.168.1.75/${command}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(data => console.log(data))
      .catch(error => {
        console.error('Error en el comando:', error);
      });
  }, []);

  const startTimer = useCallback((rectifierId) => {
    if (activeStates[rectifierId] !== `relay${rectifierId}on`) {
      return;
    }

    stopTimer(rectifierId);

    intervalsRef.current[rectifierId] = setInterval(() => {
      setTimers((prevTimers) => {
        const newTime = Math.max((prevTimers[rectifierId] || 0) - 1, 0);
        const updatedTimers = { ...prevTimers, [rectifierId]: newTime };
        
        if (newTime === 0) {
          stopTimer(rectifierId);
          handleCommand(`relay${rectifierId}off`);
          setActiveStates((prevStates) => {
            if (prevStates[rectifierId] !== `relay${rectifierId}off`) {
              const newStates = { ...prevStates, [rectifierId]: `relay${rectifierId}off` };
              saveActiveStates(newStates);
              return newStates;
            }
            return prevStates;
          });
        }

        saveTimers(updatedTimers);
        return updatedTimers;
      });
    }, 1000);
  }, [stopTimer, handleCommand, activeStates, saveTimers, saveActiveStates]);

  const stopTimer = useCallback((rectifierId) => {
    if (intervalsRef.current[rectifierId]) {
      clearInterval(intervalsRef.current[rectifierId]);
      delete intervalsRef.current[rectifierId];
    }
  }, []);

  const setTimerDuration = useCallback((rectifierId, duration) => {
    setTimers((prevTimers) => {
      const updatedTimers = { ...prevTimers, [rectifierId]: duration };
      saveTimers(updatedTimers);
      return updatedTimers;
    });
  }, [saveTimers]);

  const setActiveButton = useCallback((rectifierId, state) => {
    setActiveStates((prevStates) => {
      const newStates = { ...prevStates, [rectifierId]: state };
      saveActiveStates(newStates);
      return newStates;
    });
  }, [saveActiveStates]);

  const contextValue = {
    timers,
    startTimer,
    stopTimer,
    setTimerDuration,
    activeStates,
    setActiveButton,
    handleCommand
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};