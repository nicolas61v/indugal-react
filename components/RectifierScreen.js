import React, { useContext, useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Image, Alert, ScrollView, Modal, ActivityIndicator } from 'react-native';
import { Audio } from 'expo-av';
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
    amperageCounts,
    updateAmperageCount,
    handleStopWithGradualReduction,
  } = useContext(TimerContext);
  
  const timer = timers[rectifierId] || 0;
  const activeButton = activeStates[rectifierId] || null;
  const amperageCount = amperageCounts[rectifierId] || 0;
  const lastAmpChangeTime = useRef(0);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const soundObject = useRef(new Audio.Sound());
  const alarmTimeout = useRef(null);

  useEffect(() => {
    loadSound();
    return () => {
      unloadSound();
    };
  }, []);

  const loadSound = async () => {
    try {
      await soundObject.current.loadAsync(require('../assets/alarm.mp3'));
    } catch (error) {
      console.error('Error loading sound', error);
    }
  };

  const unloadSound = async () => {
    try {
      await soundObject.current.unloadAsync();
    } catch (error) {
      console.error('Error unloading sound', error);
    }
  };

  useEffect(() => {
    if (activeButton === `relay${rectifierId}on`) {
      startTimer(rectifierId);
    }
  }, [timer, activeButton, rectifierId, startTimer]);

  useEffect(() => {
    const playAlarm = async () => {
      try {
        await soundObject.current.setPositionAsync(0);
        await soundObject.current.playAsync();
      } catch (error) {
        console.error('Error playing sound', error);
      }
    };

    if (timer === 20 && activeButton === `relay${rectifierId}on`) {
      playAlarm();
      alarmTimeout.current = setTimeout(() => {
        soundObject.current.stopAsync();
      }, 30000);  // Stop the alarm after 30 seconds
    }

    return () => {
      if (alarmTimeout.current) {
        clearTimeout(alarmTimeout.current);
      }
      soundObject.current.stopAsync();
    };
  }, [timer, activeButton, rectifierId]);

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
    Alert.alert(
      "Detener y Reiniciar",
      "Se detendrá el proceso y se reiniciará el temporizador. ¿Desea continuar?",
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Continuar", onPress: () => {
          soundObject.current.stopAsync();  // Stop the alarm if it's playing
          if (alarmTimeout.current) {
            clearTimeout(alarmTimeout.current);
          }
          startGradualReduction();
        }}
      ]
    );
  };

  const startGradualReduction = () => {
    setIsLoading(true);
    handleStopWithGradualReduction(rectifierId, setLoadingProgress).then(() => {
      setIsLoading(false);
      setLoadingProgress(0);
      Alert.alert(
        "Reducción Completa",
        "Todos los toques han sido reducidos a cero.",
        [{ text: "OK" }]
      );
    });
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
      return; // Ignore if less than 0.5 seconds have passed
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

  const renderButton = (title, commandOrFunction, isControlButton) => (
    <TouchableOpacity
      style={[
        styles.button,
        isControlButton && (
          (title === 'INICIAR' && activeButton === `relay${rectifierId}on`) ||
          (title === 'PAUSAR' && activeButton === 'pause') ||
          (title === 'DETENER' && activeButton === `relay${rectifierId}off`)
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
        if (title === 'DETENER') {
          handlePrepare();
        } else if (title === 'PAUSAR') {
          handlePause();
        } else if (title === 'INICIAR') {
          if (timer === 0) {
            Alert.alert(
              "Información incompleta",
              "Falta establecer el tiempo",
              [{ text: "OK" }]
            );
            return;
          }
          handleInitiate();
        } else if (activeButton === `relay${rectifierId}on` && (commandOrFunction === `R${rectifierId}UP` || commandOrFunction === `R${rectifierId}DOWN`)) {
          handleAmpChange(commandOrFunction);
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

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
        <View style={styles.squareBox} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>BAÑO {rectifierId}</Text>
          <Text style={styles.amperageCount}>Toques: {amperageCount}</Text>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.controlsRow}>
            <View style={styles.timerContainer}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => adjustTimer(5)}>
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
          <View style={styles.navigationButtonsContainer}>
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.navigationButtonText}>CLIENTE</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.navigationButton}
              onPress={() => navigation.navigate('Home')}>
              <Text style={styles.navigationButtonText}>MENU</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      
      <Modal
        transparent={true}
        animationType="fade"
        visible={isLoading}
        onRequestClose={() => {}}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={styles.modalText}>Reduciendo toques...</Text>
            <Text style={styles.modalText}>{`Progreso: ${Math.round(loadingProgress * 100)}%`}</Text>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

export default RectifierScreen;