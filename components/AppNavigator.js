import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import RectifierScreen from '../components/RectifierScreen';
import { TimerContext } from '../components/TimerContext';
import ClientDataScreen from '../components/ClientDataScreen';
import styles from '../styles/AppNavigatorStyles';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const { timers, activeStates, orderNumbers } = useContext(TimerContext);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderButton = (title, rectifierId) => (
    <TouchableOpacity
      style={[
        styles.button,
        activeStates[rectifierId] === `relay${rectifierId}on` ? styles.activeButton : null
      ]}
      onPress={() => navigation.navigate('ClientData', { rectifierId })}
      key={rectifierId}
    >
      <Text style={styles.buttonText}>{title}</Text>
      <View style={styles.infoContainer}>
        <View style={styles.timerContainer}>
          <Text style={styles.timerText}>{formatTime(timers[rectifierId] || 0)}</Text>
        </View>
        <View style={styles.orderContainer}>
          <Text style={styles.orderText}>
            {orderNumbers[rectifierId] ? orderNumbers[rectifierId].join('') : '00'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
    <View style={styles.container}>
      <View style={styles.topRectangle} />
      <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <ScrollView contentContainerStyle={styles.buttonColumn}>
          {renderButton('BAÑO 1', 1)}
          {renderButton('BAÑO 2', 2)}
          {renderButton('BAÑO 3', 3)}
        </ScrollView>
        <ScrollView contentContainerStyle={styles.buttonColumn}>
          {renderButton('BAÑO 6', 6)}
          {renderButton('BAÑO 5', 5)}
          {renderButton('BAÑO 4', 4)}
        </ScrollView>
      </View>
    </View>
  </ScrollView>
  );
};

const AppNavigator = () => {
  return (
    <Stack.Navigator initialRouteName="Home">
    <Stack.Screen 
      name="Home" 
      component={HomeScreen} 
      options={{ title: 'Home' }}
    />
    <Stack.Screen 
      name="ClientData" 
      component={ClientDataScreen} 
      options={{ title: 'Datos del Cliente' }}
    />
    <Stack.Screen 
      name="Rectifier" 
      component={RectifierScreen} 
      options={{ title: 'Rectifier' }}
    />
  </Stack.Navigator>
  );
};

export default AppNavigator;
