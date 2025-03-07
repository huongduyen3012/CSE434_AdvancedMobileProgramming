import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 10,
  },
  card: {marginBottom: 8},
  fab: {position: 'absolute', right: 16, bottom: 20},
  input: {marginBottom: 12},
  noteInput: {marginBottom: 16, minHeight: 120},
  buttonContainer: {flexDirection: 'row', justifyContent: 'flex-end'},
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
});
