import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { AlarmProvider } from './components/AlarmContext';
import { TimerProvider } from './components/TimerContext';
import { HistoryProvider } from './components/HistoryContext';
import AppNavigator from './components/AppNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <AlarmProvider>
        <TimerProvider>
          <HistoryProvider>
            <AppNavigator />
          </HistoryProvider>
        </TimerProvider>
      </AlarmProvider>
    </NavigationContainer>
  );
};

export default App;