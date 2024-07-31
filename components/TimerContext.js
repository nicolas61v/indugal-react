  import React, { createContext, useState, useEffect, useCallback, useRef } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';

  export const TimerContext = createContext();

  export const TimerProvider = ({ children }) => {
    const [timers, setTimers] = useState({});
    const [activeStates, setActiveStates] = useState({});
    const [orderNumbers, setOrderNumbers] = useState({});
    const intervalsRef = useRef({});
    const saveTimerTimeout = useRef(null);

    useEffect(() => {
      loadData();
      return () => {
        if (saveTimerTimeout.current) {
          clearTimeout(saveTimerTimeout.current);
        }
        Object.values(intervalsRef.current).forEach(clearInterval);
      };
    }, []);

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
      if (intervalsRef.current[rectifierId]) {
        clearInterval(intervalsRef.current[rectifierId]);
        delete intervalsRef.current[rectifierId];
      }
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
                saveData(updatedTimers, newStates, orderNumbers);
                return newStates;
              }
              return prevStates;
            });
            resetOrderNumber(rectifierId);
          } else {
            saveData(updatedTimers, activeStates, orderNumbers);
          }

          return updatedTimers;
        });
      }, 1000);
    }, [stopTimer, handleCommand, activeStates, orderNumbers, saveData, resetOrderNumber]);

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