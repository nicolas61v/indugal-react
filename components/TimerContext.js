import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timers, setTimers] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const [orderNumbers, setOrderNumbers] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const saveTimerTimeout = useRef(null);

  useEffect(() => {
    loadData();
    return () => {
      if (saveTimerTimeout.current) {
        clearTimeout(saveTimerTimeout.current);
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => {
        const updatedTimers = { ...prevTimers };
        let hasChanges = false;

        Object.keys(activeTimers).forEach(rectifierId => {
          if (updatedTimers[rectifierId] > 0) {
            updatedTimers[rectifierId]--;
            hasChanges = true;

            if (updatedTimers[rectifierId] === 0) {
              handleCommand(`relay${rectifierId}off`);
              setActiveStates(prev => ({ ...prev, [rectifierId]: `relay${rectifierId}off` }));
              resetOrderNumber(rectifierId);
              setActiveTimers(prev => {
                const newActiveTimers = { ...prev };
                delete newActiveTimers[rectifierId];
                return newActiveTimers;
              });
            }
          }
        });

        if (hasChanges) {
          if (saveTimerTimeout.current) clearTimeout(saveTimerTimeout.current);
          saveTimerTimeout.current = setTimeout(() => saveData(updatedTimers, activeStates, orderNumbers), 1000);
        }

        return hasChanges ? updatedTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers]);

  const loadData = async () => {
    try {
      const storedTimers = await AsyncStorage.getItem('timers');
      const storedStates = await AsyncStorage.getItem('activeStates');
      const storedOrderNumbers = await AsyncStorage.getItem('orderNumbers');
      if (storedTimers) setTimers(JSON.parse(storedTimers));
      if (storedStates) setActiveStates(JSON.parse(storedStates));
      if (storedOrderNumbers) setOrderNumbers(JSON.parse(storedOrderNumbers));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = useCallback(async (newTimers, newStates, newOrderNumbers) => {
    try {
      await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
      await AsyncStorage.setItem('activeStates', JSON.stringify(newStates));
      await AsyncStorage.setItem('orderNumbers', JSON.stringify(newOrderNumbers));
    } catch (error) {
      console.error('Error saving data:', error);
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

  const setOrderNumber = useCallback((rectifierId, orderNumber) => {
    setOrderNumbers((prevOrderNumbers) => {
      const updatedOrderNumbers = { ...prevOrderNumbers, [rectifierId]: orderNumber };
      saveData(timers, activeStates, updatedOrderNumbers);
      return updatedOrderNumbers;
    });
  }, [timers, activeStates, saveData]);

  const resetOrderNumber = useCallback((rectifierId) => {
    setOrderNumbers((prevOrderNumbers) => {
      const updatedOrderNumbers = { ...prevOrderNumbers, [rectifierId]: [0, 0] };
      saveData(timers, activeStates, updatedOrderNumbers);
      return updatedOrderNumbers;
    });
  }, [timers, activeStates, saveData]);

  const stopTimer = useCallback((rectifierId) => {
    setActiveTimers(prev => {
      const newActiveTimers = { ...prev };
      delete newActiveTimers[rectifierId];
      return newActiveTimers;
    });
  }, []);

  const startTimer = useCallback((rectifierId) => {
    setActiveTimers(prev => ({ ...prev, [rectifierId]: true }));
  }, []);

  const setTimerDuration = useCallback((rectifierId, duration) => {
    setTimers((prevTimers) => {
      const updatedTimers = { ...prevTimers, [rectifierId]: duration };
      saveData(updatedTimers, activeStates, orderNumbers);
      return updatedTimers;
    });
  }, [activeStates, orderNumbers, saveData]);

  const setActiveButton = useCallback((rectifierId, state) => {
    setActiveStates((prevStates) => {
      const newStates = { ...prevStates, [rectifierId]: state };
      saveData(timers, newStates, orderNumbers);
      return newStates;
    });
  }, [timers, orderNumbers, saveData]);

  const contextValue = {
    timers,
    startTimer,
    stopTimer,
    setTimerDuration,
    activeStates,
    setActiveButton,
    handleCommand,
    orderNumbers,
    setOrderNumber,
    resetOrderNumber
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};