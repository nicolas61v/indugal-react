import { StyleSheet, Dimensions } from 'react-native';

const windowHeight = Dimensions.get('window').height;

const styles = StyleSheet.create({
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '80%',
      marginBottom: 10,
    },
    topRectangle: {
      height: windowHeight * 0.20,
      width: '100%',
      backgroundColor: '#e0e0e0', // Un gris claro, puedes cambiarlo al color que prefieras
    },
    amperageCount: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#3949ab',
    },
    preparationBarContainer: {
      width: '80%',
      height: 20,
      backgroundColor: '#e0e0e0',
      borderRadius: 10,
      marginVertical: 10,
      overflow: 'hidden',
    },
    separatorBar: {
      height: 2,
      backgroundColor: '#ccc',
      width: '100%',
      marginVertical: 10,
    },
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
      alignItems: 'center',
      justifyContent: 'center',
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
      fontSize: 20,
      fontWeight: 'bold',
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
    prepareButton: {
      backgroundColor: '#3949ab',
    },
    activeButton: {
      backgroundColor: 'green',
    },
    pauseButton: {
      backgroundColor: '#3949ab',
    },
  });

  export default styles;