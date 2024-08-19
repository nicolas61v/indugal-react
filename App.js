import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TimerProvider } from './components/TimerContext';
import { HistoryProvider } from './components/HistoryContext';
import AppNavigator from './components/AppNavigator';

const App = () => {
  return (
    <NavigationContainer>
      <TimerProvider>
        <HistoryProvider>
          <AppNavigator />
        </HistoryProvider>
      </TimerProvider>
    </NavigationContainer>
  );
};

export default App;