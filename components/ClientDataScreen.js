import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import styles from '../styles/ClientDataStyles';

const ClientDataScreen = ({ navigation, route }) => {
  const { rectifierId } = route.params;
  const [document, setDocument] = useState('');
  const [orderNumber, setOrderNumber] = useState('');

  const isFormComplete = () => {
    return document && orderNumber;
  };

  const handleNext = () => {
    if (isFormComplete()) {
      navigation.navigate('Rectifier', {
        rectifierId,
        clientData: { document, orderNumber }
      });
    } else {
      alert('Por favor, complete todos los campos antes de continuar.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollViewContainer}>
      <View style={styles.container}>
        <Text style={styles.title}>Datos del Cliente y Proceso</Text>

        <Text style={styles.label}>Documento (ID de factura o baño)</Text>
        <TextInput
          style={styles.input}
          value={document}
          onChangeText={setDocument}
          placeholder="Ingrese el documento"
        />

        <Text style={styles.label}>Orden No.</Text>
        <TextInput
          style={styles.input}
          value={orderNumber}
          onChangeText={setOrderNumber}
          placeholder="Ingrese el número de orden"
        />

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
