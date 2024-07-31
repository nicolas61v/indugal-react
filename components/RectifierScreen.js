import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, Animated } from 'react-native';
import { TimerContext } from '../components/TimerContext';
import styles from '../styles/RectifierScreenStyles';

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
  const [isPreparing, setIsPreparing] = useState(false);
  const [amperageCount, setAmperageCount] = useState(0);
  const [preparationTime, setPreparationTime] = useState(120); // 2 minutes in seconds
  const preparationProgress = useRef(new Animated.Value(1)).current;

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

  useEffect(() => {
    let interval;
    if (isPreparing) {
      interval = setInterval(() => {
        setPreparationTime((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(interval);
            handleInitiate();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);

      preparationProgress.setValue(1); // Reset the progress bar to full
      Animated.timing(preparationProgress, {
        toValue: 0, // Animate to empty over 2 minutes
        duration: 120000, // 2 minutes
        useNativeDriver: false,
      }).start();
    } else {
      clearInterval(interval);
      setPreparationTime(120);
      preparationProgress.setValue(1); // Mantener la barra completa cuando no se esté preparando
    }

    return () => clearInterval(interval);
  }, [isPreparing]);

  const handleInitiate = () => {
    setIsPreparing(false);
    setActiveButton(rectifierId, `relay${rectifierId}on`);
    handleCommand(`relay${rectifierId}on`);
    setTimerDuration(rectifierId, timer);
    startTimer(rectifierId);
  };

  const handlePrepare = () => {
    const newPreparingState = !isPreparing;
    setIsPreparing(newPreparingState);
    setActiveButton(rectifierId, `relay${rectifierId}off`);
    handleCommand(`relay${rectifierId}off`);
    if (!newPreparingState) {
      stopTimer(rectifierId);
      setAmperageCount(0);
    }
  };

  const handleAmpChange = async (command) => {
    if (!isPreparing) {
      Alert.alert(
        "Acción no permitida",
        "El ajuste de voltaje solo está disponible en modo preparación.",
        [{ text: "OK" }]
      );
      return;
    }

    try {
      const response = await fetch(`http://192.168.1.75/${command}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        if (data.action === "UP") {
          setAmperageCount(prev => prev + 1);
        } else if (data.action === "DOWN") {
          setAmperageCount(prev => Math.max(0, prev - 1));
        }
      }
    } catch (error) {
      console.error('Error en el comando:', error);
      Alert.alert("Error", "No se pudo ajustar el amperaje.");
    }
  };

  const renderButton = (title, command, isControlButton) => (
    <TouchableOpacity
      style={[
        styles.button,
        isControlButton && command === `relay${rectifierId}on` && activeButton === command ? styles.activeButton : null,
        isControlButton && command === `relay${rectifierId}off` && isPreparing ? styles.preparingButton : null,
        isControlButton && command === `relay${rectifierId}off` && !isPreparing ? styles.prepareButton : null,
        (!isControlButton && !isPreparing) ? styles.disabledButton : null,
      ]}
      onPress={() => {
        if (!isControlButton && !isPreparing) {
          Alert.alert(
            "Acción no permitida",
            "El ajuste de voltaje solo está disponible en modo preparación.",
            [{ text: "OK" }]
          );
          return;
        }
        if (command === `relay${rectifierId}off`) {
          handlePrepare();
          return;
        }
        if (command === `relay${rectifierId}on`) {
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
          handleInitiate();
        } else if (isPreparing && (command === `R${rectifierId}UP` || command === `R${rectifierId}DOWN`)) {
          handleAmpChange(command);
        }
      }}
    >
      <Text style={styles.buttonText}>{isPreparing && command === `relay${rectifierId}off` ? 'PREPARAR' : title}</Text>
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
      <View style={styles.titleContainer}>
        <Text style={styles.title}>BAÑO {rectifierId}</Text>
        <Text style={styles.amperageCount}>Toques: {amperageCount}</Text>
      </View>
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
        <View style={styles.preparationBarContainer}>
          <Animated.View 
            style={[
              styles.preparationBar,
              {
                width: preparationProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                }),
              },
            ]}
          />
          {isPreparing && <Text style={styles.preparationTime}>{formatTime(preparationTime)}</Text>}
        </View>
        <View style={styles.buttonRow}>
          {renderButton('SUBIR  AMP', `R${rectifierId}UP`, false)}
          {renderButton('BAJAR AMP', `R${rectifierId}DOWN`, false)}
        </View>
        <View style={styles.buttonRow}>
          {renderButton('INICIAR', `relay${rectifierId}on`, true)}
          {renderButton('PREPARAR', `relay${rectifierId}off`, true)}
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

export default RectifierScreen;
