import React, { useContext, useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, Image, ScrollView, Animated } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import RectifierScreen from '../components/RectifierScreen';
import { TimerContext } from '../components/TimerContext';
import { AlarmContext } from '../components/AlarmContext';
import ClientDataScreen from '../components/ClientDataScreen';
import styles from '../styles/AppNavigatorStyles';

const Stack = createStackNavigator();

const HomeScreen = ({ navigation }) => {
  const { timers, activeStates, orderNumbers } = useContext(TimerContext);
  const { activeAlarms } = useContext(AlarmContext);
  const animatedValues = useRef({});

  useEffect(() => {
    Object.keys(activeAlarms).forEach(rectifierId => {
      if (!animatedValues.current[rectifierId]) {
        animatedValues.current[rectifierId] = new Animated.Value(0);
      }
      Animated.loop(
        Animated.sequence([
          Animated.timing(animatedValues.current[rectifierId], {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(animatedValues.current[rectifierId], {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    });
  }, [activeAlarms]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const renderButton = (title, rectifierId) => {
    const isActive = activeStates[rectifierId] === `relay${rectifierId}on`;
    const isAlarming = activeAlarms[rectifierId];

    const buttonStyle = [
      styles.button,
      isActive ? styles.activeButton : null,
    ];

    if (isAlarming && animatedValues.current[rectifierId]) {
      buttonStyle.push({
        backgroundColor: animatedValues.current[rectifierId].interpolate({
          inputRange: [0, 1],
          outputRange: ['#3F51B5', '#FF0000'],
        }),
      });
    }

    const rippleStyle = isAlarming && animatedValues.current[rectifierId] ? {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255,255,255,0.3)',
      borderRadius: 10,
      opacity: animatedValues.current[rectifierId].interpolate({
        inputRange: [0, 1],
        outputRange: [0, 0.6],
      }),
      transform: [
        {
          scale: animatedValues.current[rectifierId].interpolate({
            inputRange: [0, 1],
            outputRange: [0.8, 1.2],
          }),
        },
      ],
    } : null;

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('ClientData', { rectifierId })}
        key={rectifierId}
      >
        <Animated.View style={buttonStyle}>
          {rippleStyle && <Animated.View style={rippleStyle} />}
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
        </Animated.View>
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.topRectangle} />
        <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
        <View style={styles.squareBox} />
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