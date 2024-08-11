import { StyleSheet, Dimensions } from 'react-native';

const styles = StyleSheet.create({
    scrollViewContainer: {
        flexGrow: 1,
      },
    container: {
      flex: 1,
      padding: 20,
      backgroundColor: '#f5f5f5',
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 20,
      textAlign: 'center',
    },
    label: {
      fontSize: 16,
      fontWeight: 'bold',
      marginTop: 10,
    },
    input: {
      height: 40,
      borderColor: 'gray',
      borderWidth: 1,
      marginTop: 5,
      marginBottom: 15,
      paddingHorizontal: 10,
      borderRadius: 5,
    },
    picker: {
      height: 40,
      marginTop: 5,
      marginBottom: 15,
    },
    buttonContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    button: {
      padding: 15,
      borderRadius: 5,
      width: '45%',
    },
    menuButton: {
      backgroundColor: '#4a4a4a',
    },
    nextButton: {
      backgroundColor: '#007bff',
    },
    disabledButton: {
      backgroundColor: '#cccccc',
    },
    buttonText: {
      color: 'white',
      textAlign: 'center',
      fontWeight: 'bold',
    },
  });

  export default styles;