import React, { createContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const HistoryContext = createContext();

export const HistoryProvider = ({ children }) => {
  const [history, setHistory] = useState({});

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const storedHistory = await AsyncStorage.getItem('bathHistory');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  };

  const saveHistory = useCallback(async (newHistory) => {
    try {
      await AsyncStorage.setItem('bathHistory', JSON.stringify(newHistory));
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }, []);

  const addHistoryEntry = useCallback((rectifierId, entry) => {
    setHistory((prevHistory) => {
      const updatedHistory = {
        ...prevHistory,
        [rectifierId]: [...(prevHistory[rectifierId] || []), entry]
      };
      saveHistory(updatedHistory);
      return updatedHistory;
    });
  }, [saveHistory]);

  const getHistoryForBath = useCallback((rectifierId) => {
    return history[rectifierId] || [];
  }, [history]);

  const contextValue = {
    addHistoryEntry,
    getHistoryForBath
  };

  return (
    <HistoryContext.Provider value={contextValue}>
      {children}
    </HistoryContext.Provider>
  );
};