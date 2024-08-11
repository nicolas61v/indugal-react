import React, { useContext, useEffect, useState, useRef } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView } from 'react-native';
import { TimerContext } from '../components/TimerContext';
import styles from '../styles/RectifierScreenStyles';

const RectifierScreen = ({ route, navigation }) => {
  const { rectifierId, clientData } = route.params;
  const { 
    timers, 
    startTimer, 
    stopTimer, 
    setTimerDuration, 
    activeStates, 
    setActiveButton, 
    handleCommandWithRetry,
    orderNumbers,
    setOrderNumber,
    amperageCounts,
    updateAmperageCount
  } = useContext(TimerContext);
  
  const timer = timers[rectifierId] || 0;
  const activeButton = activeStates[rectifierId] || null;
  const [localOrderValue, setLocalOrderValue] = useState(orderNumbers[rectifierId] || [0, 0]);
  const amperageCount = amperageCounts[rectifierId] || 0;
  const lastAmpChangeTime = useRef(0);

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

  const handleInitiate = () => {
    setActiveButton(rectifierId, `relay${rectifierId}on`);
    handleCommandWithRetry(`relay${rectifierId}on`, rectifierId, false);
    setTimerDuration(rectifierId, timer);
    startTimer(rectifierId);
  };
  
  const handlePause = () => {
    setActiveButton(rectifierId, 'pause');
    handleCommandWithRetry(`relay${rectifierId}off`, rectifierId, false);
    stopTimer(rectifierId);
  };
  
  const handlePrepare = () => {
    setActiveButton(rectifierId, `relay${rectifierId}off`);
    handleCommandWithRetry(`relay${rectifierId}off`, rectifierId, false);
    stopTimer(rectifierId);
    updateAmperageCount(rectifierId, 0);
  };

  const handleAmpChange = async (command) => {
    if (activeButton !== `relay${rectifierId}on`) {
      Alert.alert(
        "Acción no permitida",
        "El ajuste de voltaje solo está disponible en modo activo.",
        [{ text: "OK" }]
      );
      return;
    }

    const now = Date.now();
    if (now - lastAmpChangeTime.current < 500) {
      return; // Ignore if less than 0.3 seconds have passed
    }
    lastAmpChangeTime.current = now;

    try {
      const response = await fetch(`http://10.10.0.31/${command}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      if (data.success) {
        if (data.action === "UP") {
          updateAmperageCount(rectifierId, amperageCount + 1);
        } else if (data.action === "DOWN") {
          updateAmperageCount(rectifierId, Math.max(0, amperageCount - 1));
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
        isControlButton && (
          (command === `relay${rectifierId}on` && activeButton === `relay${rectifierId}on`) ||
          (command === 'pause' && activeButton === 'pause') ||
          (command === `relay${rectifierId}off` && activeButton === `relay${rectifierId}off`)
        ) ? styles.activeButton : null,
        (!isControlButton && activeButton !== `relay${rectifierId}on`) ? styles.disabledButton : null,
      ]}
      onPress={() => {
        if (!isControlButton && activeButton !== `relay${rectifierId}on`) {
          Alert.alert(
            "Acción no permitida",
            "El ajuste de voltaje solo está disponible en modo activo.",
            [{ text: "OK" }]
          );
          return;
        }
        if (command === `relay${rectifierId}off`) {
          handlePrepare();
        } else if (command === 'pause') {
          handlePause();
        } else if (command === `relay${rectifierId}on`) {
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
        } else if (activeButton === `relay${rectifierId}on` && (command === `R${rectifierId}UP` || command === `R${rectifierId}DOWN`)) {
          handleAmpChange(command);
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
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <View style={styles.topRectangle} />
        <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
        <View style={styles.titleContainer}>
          <Text style={styles.title}>BAÑO {rectifierId}</Text>
          <Text style={styles.amperageCount}>Toques: {amperageCount}</Text>
        </View>
        <View style={styles.contentContainer}>

        <View style={styles.controlsRow}>
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
        </View>
        <View style={styles.separatorBar} />
        <View style={styles.buttonRow}>
          {renderButton('▼', `R${rectifierId}DOWN`, false)}
          {renderButton('▲', `R${rectifierId}UP`, false)}
        </View>
        <View style={styles.buttonRow}>
          {renderButton('INICIAR', `relay${rectifierId}on`, true)}
          {renderButton('PAUSAR', 'pause', true)}
          {renderButton('DETENER', `relay${rectifierId}off`, true)}
        </View>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>MENU</Text>
        </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default RectifierScreen;