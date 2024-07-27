import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, ScrollView } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import RectifierScreen from '../components/RectifierScreen';
import { TimerContext } from '../components/TimerContext';

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
      onPress={() => navigation.navigate('Rectifier', { rectifierId })}
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
    <View style={styles.container}>
      <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
      <View style={styles.buttonContainer}>
        <ScrollView contentContainerStyle={styles.buttonColumn}>
          {renderButton('BAÑO 1', 1)}
          {renderButton('BAÑO 2', 2)}
          {renderButton('BAÑO 3', 3)}
        </ScrollView>
        <ScrollView contentContainerStyle={styles.buttonColumn}>
          {renderButton('BAÑO 4', 4)}
          {renderButton('BAÑO 5', 5)}
          {renderButton('BAÑO 6', 6)}
        </ScrollView>
      </View>
    </View>
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
        name="Rectifier" 
        component={RectifierScreen} 
        options={{ title: 'Rectifier' }}
      />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  logo: {
    width: '80%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  buttonColumn: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#3949ab',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginVertical: 20,
    alignItems: 'center',
    width: 150,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: '#1a237e',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginTop: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 15,
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  orderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 7,
    marginVertical: 5,
  },
  orderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    justifyContent: 'center',
  },
});

export default AppNavigator;