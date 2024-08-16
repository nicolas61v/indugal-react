import React, { useContext, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { TimerContext } from '../components/TimerContext';
import styles from '../styles/ClientDataStyles';

const ClientDataScreen = ({ navigation, route }) => {
  const { rectifierId } = route.params;
  const { orderNumbers, setOrderNumber, documentNumbers, setDocumentNumber } = useContext(TimerContext);
  const [documentValue, setDocumentValue] = useState([0, 0, 0, 0, 0]);
  const [orderValue, setOrderValue] = useState([0, 0]);

  useEffect(() => {
    if (documentNumbers[rectifierId]) {
      setDocumentValue(documentNumbers[rectifierId]);
    }
    if (orderNumbers[rectifierId]) {
      setOrderValue(orderNumbers[rectifierId]);
    }
  }, [rectifierId, documentNumbers, orderNumbers]);

  const isFormComplete = () => {
    return documentValue.some(digit => digit !== 0) && orderValue.some(digit => digit !== 0);
  };

  const handleNext = () => {
    if (isFormComplete()) {
      setOrderNumber(rectifierId, orderValue);
      setDocumentNumber(rectifierId, documentValue);
      navigation.navigate('Rectifier', {
        rectifierId,
        clientData: { 
          document: documentValue.join(''), 
          orderNumber: orderValue.join('') 
        }
      });
    } else {
      alert('Por favor, complete todos los campos antes de continuar.');
    }
  };

  const adjustValue = (setter, value, index, adjustment) => {
    setter(prev => {
      const newValue = [...prev];
      newValue[index] = (newValue[index] + adjustment + 10) % 10;
      return newValue;
    });
  };

  const renderDigitInput = (value, setter, digits) => (
    <View style={styles.valueContainer}>
      {value.map((digit, index) => (
        <View key={index} style={styles.digitContainer}>
          <TouchableOpacity
            style={styles.digitButton}
            onPress={() => adjustValue(setter, value, index, 1)}
          >
            <Text style={styles.digitButtonText}>▲</Text>
          </TouchableOpacity>
          <View style={styles.digitBox}>
            <Text style={styles.digitText}>{digit}</Text>
          </View>
          <TouchableOpacity
            style={styles.digitButton}
            onPress={() => adjustValue(setter, value, index, -1)}
          >
            <Text style={styles.digitButtonText}>▼</Text>
          </TouchableOpacity>
        </View>
      ))}
    </View>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
        <View style={styles.squareBox} />
        <View style={styles.infoContainer}>
          <Text style={styles.title}>Datos del Cliente y Proceso</Text>
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Documento (ID de factura o baño)</Text>
          {renderDigitInput(documentValue, setDocumentValue, 5)}
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Orden No.</Text>
          {renderDigitInput(orderValue, setOrderValue, 2)}
        </View>
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.menuButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>MENU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.button,
              styles.nextButton,
              !isFormComplete() && styles.disabledButton
            ]}
            onPress={handleNext}
            disabled={!isFormComplete()}
          >
            <Text style={styles.buttonText}>SIGUIENTE</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default ClientDataScreen;