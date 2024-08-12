import { StyleSheet } from 'react-native';

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
    marginBottom: 5,
  },
  valueContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#3949ab',
    borderRadius: 10,
    padding: 10,
    marginBottom: 20,
  },
  digitContainer: {
    alignItems: 'center',
    marginHorizontal: 2,
  },
  digitButton: {
    backgroundColor: '#3949ab',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    marginVertical: 2,
  },
  digitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  digitBox: {
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderWidth: 2,
    borderColor: '#3949ab',
    borderRadius: 5,
    marginVertical: 2,
  },
  digitText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3949ab',
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