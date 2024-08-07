import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const TimerContext = createContext();

export const TimerProvider = ({ children }) => {
  const [timers, setTimers] = useState({});
  const [activeStates, setActiveStates] = useState({});
  const [orderNumbers, setOrderNumbers] = useState({});
  const [activeTimers, setActiveTimers] = useState({});
  const [amperageCounts, setAmperageCounts] = useState({});
  const [amperageReductionSchedule, setAmperageReductionSchedule] = useState({});
  const saveTimerTimeout = useRef(null);
  const retryQueue = useRef([]);
  const isProcessingRetry = useRef(false);

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

            // Check if we need to start or continue amperage reduction
            if (updatedTimers[rectifierId] <= 420 && updatedTimers[rectifierId] > 0) {
              handleAmperageReduction(rectifierId, updatedTimers[rectifierId]);
            }

            if (updatedTimers[rectifierId] === 0) {
              handleCommandWithRetry(`relay${rectifierId}off`, rectifierId, false);
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
              setAmperageReductionSchedule(prev => {
                const newSchedule = { ...prev };
                delete newSchedule[rectifierId];
                return newSchedule;
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
  }, [activeTimers, amperageCounts, amperageReductionSchedule]);

  const handleAmperageReduction = (rectifierId, remainingTime) => {
    const currentCount = amperageCounts[rectifierId] || 0;
    const schedule = amperageReductionSchedule[rectifierId];

    if (!schedule) {
      // Initialize the reduction schedule
      const newSchedule = [];
      for (let i = 0; i < currentCount; i++) {
        const reductionTime = Math.floor(300 / currentCount * i);
        newSchedule.push(300 - reductionTime);
      }
      setAmperageReductionSchedule(prev => ({ ...prev, [rectifierId]: newSchedule }));
    } else if (schedule.length > 0 && remainingTime <= schedule[0]) {
      // Time to reduce amperage
      setAmperageCounts(prev => ({
        ...prev,
        [rectifierId]: Math.max(0, prev[rectifierId] - 1)
      }));
      handleCommandWithRetry(`R${rectifierId}DOWN`, rectifierId, true);
      setAmperageReductionSchedule(prev => ({
        ...prev,
        [rectifierId]: prev[rectifierId].slice(1)
      }));
    }
  };

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

  const handleCommandWithRetry = useCallback((command, rectifierId, isLastSevenMinutes) => {
    const retryOperation = async (retryCount = 0) => {
      try {
        const response = await fetch(`http://10.10.0.31/${command}`, { timeout: 3000 });
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.text();
        console.log(`Command ${command} executed successfully:`, data);
      } catch (error) {
        console.error(`Error executing command ${command}:`, error);
        if (isLastSevenMinutes && retryCount < 2) {
          console.log(`Retrying command ${command}. Attempt ${retryCount + 1}`);
          retryQueue.current.push(() => retryOperation(retryCount + 1));
          processRetryQueue();
        }
      }
    };

    retryOperation();
  }, []);

  const processRetryQueue = useCallback(() => {
    if (isProcessingRetry.current || retryQueue.current.length === 0) return;

    isProcessingRetry.current = true;
    const nextRetry = retryQueue.current.shift();
    nextRetry().finally(() => {
      isProcessingRetry.current = false;
      processRetryQueue();
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
    // Reset the amperage reduction schedule when the count is updated
    setAmperageReductionSchedule(prev => {
      const newSchedule = { ...prev };
      delete newSchedule[rectifierId];
      return newSchedule;
    });
  }, [timers, activeStates, orderNumbers, saveData]);

  const contextValue = {
    timers,
    startTimer,
    stopTimer,
    setTimerDuration,
    activeStates,
    setActiveButton,
    handleCommandWithRetry,
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