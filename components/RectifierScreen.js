import React, { useContext, useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Alert } from 'react-native';
import { TimerContext } from '../components/TimerContext';  // Ajusta la ruta si es necesario

const RectifierScreen = ({ route, navigation }) => {
  const { rectifierId } = route.params;
  const { 
    timers, 
    startTimer, 
    stopTimer, 
    setTimerDuration, 
    activeStates, 
    setActiveButton, 
    handleCommand,
    orderNumbers,
    setOrderNumber
  } = useContext(TimerContext);

  const timer = timers[rectifierId] || 0;
  const activeButton = activeStates[rectifierId] || null;
  const [localOrderValue, setLocalOrderValue] = useState(orderNumbers[rectifierId] || [0, 0]);

  useEffect(() => {
    if (activeButton === `relay${rectifierId}on`) {
      startTimer(rectifierId);
    }
  }, [timer, activeButton, rectifierId, startTimer]);

  useEffect(() => {
    if (timer === 0) {
      setOrderNumber(rectifierId, localOrderValue);
    }
  }, [timer, localOrderValue, rectifierId, setOrderNumber]);

  const renderButton = (title, command, isControlButton) => (
    <TouchableOpacity
      style={[
        styles.button,
        isControlButton && activeButton === command ? styles.activeButton : null,
        (!isControlButton && activeButton !== `relay${rectifierId}on`) ? styles.disabledButton : null,
      ]}
      onPress={() => {
        if (!isControlButton && activeButton !== `relay${rectifierId}on`) {
          Alert.alert(
            "Acción no permitida",
            "El ajuste de voltaje solo está disponible en modo manual.",
            [{ text: "OK" }]
          );
          return;
        }
        if (isControlButton && command === `relay${rectifierId}on`) {
          if (timer === 0 || localOrderValue.every(digit => digit === 0)) {
            let missingItems = [];
            if (timer === 0) missingItems.push("tiempo");
            if (localOrderValue.every(digit => digit === 0)) missingItems.push("número de orden");
            
            Alert.alert(
              "Información incompleta",
              `Falta establecer: ${missingItems.join(" y ")}`,
              [{ text: "OK" }]
            );
            return;
          }
        }
        handleCommand(command);
        if (isControlButton) {
          setActiveButton(rectifierId, command);
          if (command === `relay${rectifierId}on`) {
            setTimerDuration(rectifierId, timer);
            startTimer(rectifierId);
          } else {
            stopTimer(rectifierId);
          }
        }
      }}
    >
      <Text style={styles.buttonText}>{title}</Text>
    </TouchableOpacity>
  );

  const adjustTimer = (adjustment) => {
    const newTime = Math.max(timer + adjustment * 60, 0);
    setTimerDuration(rectifierId, newTime);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const adjustOrderValue = (index, adjustment) => {
    if (timer === 0) {
      setLocalOrderValue(prev => {
        const newValue = [...prev];
        newValue[index] = (newValue[index] + adjustment + 10) % 10;
        return newValue;
      });
    } else {
      Alert.alert(
        "Acción no permitida",
        "El número de orden solo se puede cambiar cuando el temporizador está en 0.",
        [{ text: "OK" }]
      );
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
      <Text style={styles.title}>BAÑO {rectifierId}</Text>
      <View style={styles.contentContainer}>
        <View style={styles.controlsRow}>
          <View style={styles.timerContainer}>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustTimer(5)}
            >
              <Text style={styles.adjustButtonText}>+5 Min</Text>
            </TouchableOpacity>
            <View style={styles.timerBox}>
              <Text style={styles.timerText}>{formatTime(timer)}</Text>
            </View>
            <TouchableOpacity
              style={styles.adjustButton}
              onPress={() => adjustTimer(-5)}
            >
              <Text style={styles.adjustButtonText}>-5 Min</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.orderValueContainer}>
            {localOrderValue.map((digit, index) => (
              <View key={index} style={styles.digitContainer}>
                <TouchableOpacity
                  style={styles.digitButton}
                  onPress={() => adjustOrderValue(index, 1)}
                >
                  <Text style={styles.digitButtonText}>▲</Text>
                </TouchableOpacity>
                <View style={styles.digitBox}>
                  <Text style={styles.digitText}>{digit}</Text>
                </View>
                <TouchableOpacity
                  style={styles.digitButton}
                  onPress={() => adjustOrderValue(index, -1)}
                >
                  <Text style={styles.digitButtonText}>▼</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        </View>
        <View style={styles.buttonRow}>
          {renderButton('SUBIR VOLTAJE', `R${rectifierId}UP`, false)}
          {renderButton('BAJAR VOLTAJE', `R${rectifierId}DOWN`, false)}
        </View>
        <View style={styles.buttonRow}>
          {renderButton('CONTROL MANUAL', `relay${rectifierId}on`, true)}
          {renderButton('CONTROL REMOTO', `relay${rectifierId}off`, true)}
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>MENU</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingTop: 10,
  },
  logo: {
    width: '80%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 10,
  },
  title: {
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: 25,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#3949ab',
    padding: 10,
    marginBottom: 10,
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  adjustButton: {
    backgroundColor: '#3949ab',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 10,
    marginVertical: 10,
  },
  adjustButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  timerBox: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#3949ab',
    borderRadius: 10,
    marginHorizontal: 5,
  },
  timerText: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#3949ab',
  },
  contentContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginBottom: 20,
  },
  timerContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3949ab',
    borderRadius: 10,
    padding: 10,
    marginRight: 10,
  },
  orderValueContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3949ab',
    borderRadius: 10,
    padding: 10,
    marginLeft: 10,
  },
  digitContainer: {
    alignItems: 'center',
  },
  digitButton: {
    backgroundColor: '#3949ab',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 5,
    marginVertical: 5,
  },
  digitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  digitBox: {
    paddingVertical: 2,
    paddingHorizontal: 14,
    borderWidth: 2,
    borderColor: '#3949ab',
    borderRadius: 5,
    marginVertical: 2,
  },
  digitText: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#3949ab',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#3949ab',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginHorizontal: 5,
    flex: 1,
    alignItems: 'center',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  activeButton: {
    backgroundColor: '#b71c1c',
  },
  backButton: {
    marginTop: 20,
    backgroundColor: '#3949ab',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 20,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
    opacity: 0.5,
  },  
});

export default RectifierScreen;