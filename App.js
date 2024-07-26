import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { TimerProvider } from './components/TimerContext';
import AppNavigator from './components/AppNavigator';
import Toast from 'react-native-toast-message';

const App = () => {
  return (
    <TimerProvider>
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
      <Toast />
    </TimerProvider>
  );
};

export default App;