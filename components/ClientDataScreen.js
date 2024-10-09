import React, { useContext, useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Modal, Alert } from 'react-native';
import { TimerContext } from '../components/TimerContext';
import { HistoryContext } from '../components/HistoryContext';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import styles from '../styles/ClientDataStyles';

const ClientDataScreen = ({ navigation, route }) => {
  const { rectifierId } = route.params;
  const { orderNumbers, setOrderNumber, documentNumbers, setDocumentNumber } = useContext(TimerContext);
  const { addHistoryEntry, getHistoryForBath } = useContext(HistoryContext);
  const [documentValue, setDocumentValue] = useState([0, 0, 0, 0, 0]);
  const [orderValue, setOrderValue] = useState([0, 0]);
  const [modalVisible, setModalVisible] = useState(false);

  const reversedHistory = useMemo(() => {
    const history = getHistoryForBath(rectifierId);
    return [...history].reverse();
  }, [getHistoryForBath, rectifierId]);

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
      const currentDate = new Date();
      const newHistoricalEntry = {
        date: currentDate.toLocaleDateString(),
        time: currentDate.toLocaleTimeString(),
        document: documentValue.join(''),
        orderNumber: orderValue.join('')
      };

      const currentHistory = getHistoryForBath(rectifierId);

      const isDuplicate = currentHistory.some(entry => 
        entry.document === newHistoricalEntry.document &&
        entry.orderNumber === newHistoricalEntry.orderNumber &&
        entry.date === newHistoricalEntry.date
      );

      if (!isDuplicate) {
        addHistoryEntry(rectifierId, newHistoricalEntry);
      }

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
      Alert.alert('Error', 'Por favor, complete todos los campos antes de continuar.');
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

  const generateCSV = (data) => {
    const header = 'Fecha,Hora,Documento,Orden No.\n';
    const rows = data.map(entry => 
      `${entry.date},${entry.time},${entry.document},${entry.orderNumber}`
    ).join('\n');
    return header + rows;
  };

  const downloadCSV = async () => {
    try {
      const csvContent = generateCSV(reversedHistory);
      const fileName = `historial_bano_${rectifierId}_${new Date().toISOString().split('T')[0]}.csv`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, csvContent, { encoding: FileSystem.EncodingType.UTF8 });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(filePath);
      } else {
        Alert.alert('Error', 'Sharing is not available on this device');
      }
    } catch (error) {
      console.error('Error downloading CSV:', error);
      Alert.alert('Error', 'Failed to download CSV file');
    }
  };

  const renderHistoricalDataModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={() => setModalVisible(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalView}>
          <Text style={styles.modalTitle}>Historial de Datos</Text>
          <ScrollView style={styles.modalScrollView}>
            {reversedHistory.map((entry, index) => (
              <View key={index} style={styles.historicalEntry}>
                <Text style={styles.historicalEntryText}>Fecha: {entry.date}</Text>
                <Text style={styles.historicalEntryText}>Hora: {entry.time}</Text>
                <Text style={styles.historicalEntryText}>Documento: {entry.document}</Text>
                <Text style={styles.historicalEntryText}>Orden No.: {entry.orderNumber}</Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.closeButton]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.buttonText}>Cerrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.button, styles.downloadButton]}
              onPress={downloadCSV}
            >
              <Text style={styles.buttonText}>Descargar CSV</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Image source={require('../assets/indugalLogo.png')} style={styles.logo} />
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
            style={[styles.button, styles.historyButton]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.buttonText}>HISTORIAL</Text>
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
      {renderHistoricalDataModal()}
    </ScrollView>
  );
};

export default ClientDataScreen;