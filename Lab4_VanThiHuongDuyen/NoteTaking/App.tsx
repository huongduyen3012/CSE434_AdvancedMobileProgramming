/* eslint-disable react-hooks/exhaustive-deps */
import firestore from '@react-native-firebase/firestore';
import React, {useEffect, useState, useCallback} from 'react';
import {Alert, FlatList, SafeAreaView, StyleSheet, View} from 'react-native';
import {Card, FAB, IconButton, Text} from 'react-native-paper';
import {Note} from './types';
import AddNoteModal from './components/AddNote';

const App = () => {
  const [note, setNote] = useState('');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [isInputVisible, setIsInputVisible] = useState(false);

  const pastelColors = ['#FFB3BA', '#BAFFC9', '#BAE1FF', '#FFFFBA', '#FFE4E1'];

  const getColorForIndex = useCallback((index: number) => {
    return pastelColors[index % pastelColors.length];
  }, []);

  useEffect(() => {
    const subscriber = firestore()
      .collection('notes')
      .orderBy('timestamp', 'asc')
      .onSnapshot(querySnapshot => {
        const notesArray: Note[] = [];
        let index = 0;
        querySnapshot.forEach(documentSnapshot => {
          notesArray.push({
            id: documentSnapshot.id,
            title: documentSnapshot.data().title,
            content: documentSnapshot.data().content,
            timestamp: documentSnapshot.data().timestamp,
            backgroundColor: getColorForIndex(index++),
          });
        });
        setNotes(notesArray);
      });

    return () => subscriber();
  }, [getColorForIndex]);

  const addNote = async () => {
    if (note.trim() && title.trim()) {
      try {
        await firestore().collection('notes').add({
          title: title,
          content: note,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });
        setNote('');
        setTitle('');
        setIsInputVisible(false);
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const handleDelete = (noteId: string | undefined) => {
    Alert.alert(
      'Delete Note',
      'Are you sure you want to delete this note?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => deleteNote(noteId),
          style: 'destructive',
        },
      ],
      {cancelable: true},
    );
  };

  const deleteNote = async (noteId: string | undefined) => {
    try {
      await firestore().collection('notes').doc(noteId).delete();
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) {
      return '';
    }
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNote = ({item}: {item: Note}) => (
    <Card style={[styles.card, {backgroundColor: item.backgroundColor}]}>
      <Card.Content>
        <View style={styles.headerContainer}>
          <Text variant="titleLarge">{item.title}</Text>
          <Text variant="bodySmall" style={styles.timestamp}>
            {formatDate(item.timestamp)}
          </Text>
        </View>
        <Text variant="bodyMedium">{item.content}</Text>
      </Card.Content>
      <Card.Actions style={styles.cardActions}>
        <IconButton icon="delete" onPress={() => handleDelete(item.id)} />
      </Card.Actions>
    </Card>
  );

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notes}
        renderItem={renderNote}
        keyExtractor={item => item.id}
        style={styles.list}
        contentContainerStyle={styles.listContent} // Add this line
        showsVerticalScrollIndicator={true} // Add this line
        bounces={true}
      />

      {isInputVisible && (
        <AddNoteModal
          title={title}
          note={note}
          onChangeTitle={setTitle}
          onChangeNote={setNote}
          onSubmit={addNote}
          onClose={() => setIsInputVisible(false)}
        />
      )}

      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => setIsInputVisible(true)}
          customSize={56}
          mode="elevated"
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  list: {
    flex: 1,
    padding: 16,
  },
  listContent: {
    paddingBottom: 10,
  },
  card: {
    marginBottom: 8,
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
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    borderRadius: 28,
    width: 56,
    height: 56,
  },
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

export default App;
