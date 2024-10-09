import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight,  width: screenWidth } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  logo: {
    width: '80%',
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  infoContainer: {
    width: '90%',
    marginBottom: 20,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    textAlign: 'center',
  },
  inputContainer: {
    width: '90%',
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 10,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 10,
    padding: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  digitContainer: {
    alignItems: 'center',
    marginHorizontal: 5,
  },
  digitButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 8,
    marginVertical: 5,
  },
  digitButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  digitBox: {
    paddingVertical: 5,
    paddingHorizontal: 15,
    borderWidth: 2,
    borderColor: '#1e3a8a',
    borderRadius: 8,
    marginVertical: 5,
  },
  digitText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
  },
  logo: {
    width: '80%',
    height: 80,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '90%',
    marginTop: 20,
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  menuButton: {
    backgroundColor: '#1e3a8a',
    width: '30%',  // Ajustado para que los tres botones ocupen el mismo espacio
  },
  historyButton: {
    backgroundColor: '#1e3a8a',
    width: '30%',  // Ajustado para que los tres botones ocupen el mismo espacio
  },
  nextButton: {
    backgroundColor: '#3b82f6',
    width: '30%',  // Ajustado para que los tres botones ocupen el mismo espacio
  },
  disabledButton: {
    backgroundColor: '#a0aec0',
    opacity: 0.7,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,  // Reducido el tamaño de la fuente para que quepa en los botones más pequeños
    fontWeight: 'bold',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: screenWidth * 0.9,
    maxHeight: screenHeight * 0.8,
  },
  modalScrollView: {
    width: '100%',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e3a8a',
    marginBottom: 15,
    textAlign: 'center',
  },
  historicalEntry: {
    backgroundColor: '#f0f4f8',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  historicalEntryText: {
    fontSize: 16,
    color: '#1e3a8a',
    marginBottom: 5,
  },
  closeButton: {
    backgroundColor: '#1e3a8a',
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 10,
  },
  downloadButton: {
    backgroundColor: '#4CAF50',
    marginTop: 10,
    paddingHorizontal: 30,
    paddingVertical: 10, // Green color for download button
  },
});

export default styles;