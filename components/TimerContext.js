import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timers, setTimers] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const [orderNumbers, setOrderNumbers] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const [amperageCounts, setAmperageCounts] = useState({});
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

            // Reduce amperage counts in the last 5 minutes
            if (updatedTimers[rectifierId] <= 300 && updatedTimers[rectifierId] > 0) {
              setAmperageCounts(prevCounts => {
                const newCounts = { ...prevCounts };
                const remainingTime = updatedTimers[rectifierId];
                const currentCount = newCounts[rectifierId] || 0;
                const totalReductionTime = Math.min(300, currentCount * 55); // 5 minutes or less if fewer touches
                const reductionInterval = Math.floor(totalReductionTime / currentCount);

                if (remainingTime % reductionInterval === 0 && currentCount > 0) {
                  newCounts[rectifierId] = currentCount - 1;
                  handleCommand(`R${rectifierId}DOWN`);
                }

                return newCounts;
              });
            }

            if (updatedTimers[rectifierId] === 0) {
              handleCommand(`relay${rectifierId}off`);
              setActiveStates(prev => ({ ...prev, [rectifierId]: `relay${rectifierId}off` }));
              resetOrderNumber(rectifierId);
              setActiveTimers(prev => {
                const newActiveTimers = { ...prev };
                delete newActiveTimers[rectifierId];
                return newActiveTimers;
              });
              setAmperageCounts(prev => {
                const newCounts = { ...prev };
                delete newCounts[rectifierId];
                return newCounts;
              });
            }
          }
        });

        if (hasChanges) {
          if (saveTimerTimeout.current) clearTimeout(saveTimerTimeout.current);
          saveTimerTimeout.current = setTimeout(() => saveData(updatedTimers, activeStates, orderNumbers, amperageCounts), 1000);
        }

        return hasChanges ? updatedTimers : prevTimers;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [activeTimers, amperageCounts]);

  const loadData = async () => {
    try {
      const storedTimers = await AsyncStorage.getItem('timers');
      const storedStates = await AsyncStorage.getItem('activeStates');
      const storedOrderNumbers = await AsyncStorage.getItem('orderNumbers');
      const storedAmperageCounts = await AsyncStorage.getItem('amperageCounts');
      if (storedTimers) setTimers(JSON.parse(storedTimers));
      if (storedStates) setActiveStates(JSON.parse(storedStates));
      if (storedOrderNumbers) setOrderNumbers(JSON.parse(storedOrderNumbers));
      if (storedAmperageCounts) setAmperageCounts(JSON.parse(storedAmperageCounts));
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const saveData = useCallback(async (newTimers, newStates, newOrderNumbers, newAmperageCounts) => {
    try {
      await AsyncStorage.setItem('timers', JSON.stringify(newTimers));
      await AsyncStorage.setItem('activeStates', JSON.stringify(newStates));
      await AsyncStorage.setItem('orderNumbers', JSON.stringify(newOrderNumbers));
      await AsyncStorage.setItem('amperageCounts', JSON.stringify(newAmperageCounts));
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
      saveData(timers, activeStates, updatedOrderNumbers, amperageCounts);
      return updatedOrderNumbers;
    });
  }, [timers, activeStates, amperageCounts, saveData]);

  const resetOrderNumber = useCallback((rectifierId) => {
    setOrderNumbers((prevOrderNumbers) => {
      const updatedOrderNumbers = { ...prevOrderNumbers, [rectifierId]: [0, 0] };
      saveData(timers, activeStates, updatedOrderNumbers, amperageCounts);
      return updatedOrderNumbers;
    });
  }, [timers, activeStates, amperageCounts, saveData]);

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
      saveData(updatedTimers, activeStates, orderNumbers, amperageCounts);
      return updatedTimers;
    });
  }, [activeStates, orderNumbers, amperageCounts, saveData]);

  const setActiveButton = useCallback((rectifierId, state) => {
    setActiveStates((prevStates) => {
      const newStates = { ...prevStates, [rectifierId]: state };
      saveData(timers, newStates, orderNumbers, amperageCounts);
      return newStates;
    });
  }, [timers, orderNumbers, amperageCounts, saveData]);

  const updateAmperageCount = useCallback((rectifierId, count) => {
    setAmperageCounts((prevCounts) => {
      const newCounts = { ...prevCounts, [rectifierId]: count };
      saveData(timers, activeStates, orderNumbers, newCounts);
      return newCounts;
    });
  }, [timers, activeStates, orderNumbers, saveData]);

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
    resetOrderNumber,
    amperageCounts,
    updateAmperageCount
  };

  return (
    <TimerContext.Provider value={contextValue}>
      {children}
    </TimerContext.Provider>
  );
};