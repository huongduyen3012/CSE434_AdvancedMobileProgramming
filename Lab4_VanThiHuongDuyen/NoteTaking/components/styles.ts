import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  menuContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 1,
  },
  card: {marginBottom: 8},
  fab: {position: 'absolute', right: 16, bottom: 20},
  input: {marginBottom: 12},
  noteInput: {marginBottom: 16, minHeight: 120},
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  button: {marginLeft: 12},
  list: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 30,
  },

  cardActions: {
    justifyContent: 'flex-end',
  },
  fabContainer: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 56,
    alignItems: 'center',
    justifyContent: 'center',
  },
  //   fab: {
  //     position: 'absolute',
  //     right: 16,
  //     bottom: 16,
  //     borderRadius: 28,
  //     width: 56,
  //     height: 56,
  //   },
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  timestamp: {
    color: '#000',
  },

  header: {
    textAlign: 'center',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  inputContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  cancelButton: {
    flex: 1,
    marginRight: 10,
    borderColor: '#1f41bb',
  },
  cancelButtonLable: {
    color: '#1f41bb',
    fontSize: 16,
  },
  addButton: {
    flex: 1,
    backgroundColor: '#1f41bb',
  },
  addButtonLabel: {
    color: '#fff',
    fontSize: 16,
  },
});
