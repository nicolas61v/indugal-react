import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/ClientDataStyles';

const ClientDataScreen = ({ navigation, route }) => {
  const { rectifierId } = route.params;
  const [document, setDocument] = useState('');
  const [client, setClient] = useState('');
  const [product, setProduct] = useState('');
  const [process, setProcess] = useState('');
  const [totalKg, setTotalKg] = useState('');
  const [kgPerBath, setKgPerBath] = useState('');

  const processes = [
    'Galvanizado electrolítico',
    'Galvanizado en caliente',
    'Anodizado',
    'Niquelado',
    'Cromado'
  ];

  const isFormComplete = () => {
    return document && client && product && process && totalKg && kgPerBath;
  };

  const handleNext = () => {
    if (isFormComplete()) {
      navigation.navigate('Rectifier', {
        rectifierId,
        clientData: { document, client, product, process, totalKg, kgPerBath }
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

      <Text style={styles.label}>Cliente</Text>
      <TextInput
        style={styles.input}
        value={client}
        onChangeText={setClient}
        placeholder="Nombre del cliente"
      />

      <Text style={styles.label}>Producto</Text>
      <TextInput
        style={styles.input}
        value={product}
        onChangeText={setProduct}
        placeholder="¿Qué se está procesando?"
      />

      <Text style={styles.label}>Proceso</Text>
      <Picker
        selectedValue={process}
        onValueChange={(itemValue) => setProcess(itemValue)}
        style={styles.picker}
      >
        <Picker.Item label="Seleccione un proceso" value="" />
        {processes.map((proc, index) => (
          <Picker.Item key={index} label={proc} value={proc} />
        ))}
      </Picker>

      <Text style={styles.label}>KG totales</Text>
      <TextInput
        style={styles.input}
        value={totalKg}
        onChangeText={setTotalKg}
        placeholder="Cantidad total de producto"
        keyboardType="numeric"
      />

      <Text style={styles.label}>KG por bañada</Text>
      <TextInput
        style={styles.input}
        value={kgPerBath}
        onChangeText={setKgPerBath}
        placeholder="Cantidad por baño"
        keyboardType="numeric"
      />

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.menuButton]}
            onPress={() => navigation.navigate('Home')}
          >
            <Text style={styles.buttonText}>MENU</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.nextButton, !isFormComplete() && styles.disabledButton]}
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