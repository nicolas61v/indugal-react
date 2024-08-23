import { StyleSheet, Dimensions } from 'react-native';

const { height: screenHeight } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollViewContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    paddingTop: 20,
  },
  logo: {
    width: '80%',
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,
  },
  squareBox: {
    width: '100%',
    height: screenHeight * 0.25,
    backgroundColor: '#303F9F',
    marginBottom: 20,
    borderRadius: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.23,
    shadowRadius: 2.62,
    elevation: 4,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '80%',
    marginTop: 20,
  },
  buttonColumn: {
    alignItems: 'center',
  },
  button: {
    backgroundColor: '#536DFE',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 20,
    alignItems: 'center',
    width: 150,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  activeButton: {
    backgroundColor: '#1e3a8a',
  },
  buttonText: {
    textAlign: 'center',
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },
  timerContainer: {
    marginTop: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  timerText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  infoContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  orderContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 3,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 5,
  },
  orderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default styles;