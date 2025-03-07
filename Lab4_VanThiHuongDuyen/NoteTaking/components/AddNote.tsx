import {useState} from 'react';
import {Alert, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import {styles} from './styles';
import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import notifee from '@notifee/react-native';

const AddNoteScreen = ({navigation}: {navigation: any}) => {
  const [title, setTitle] = useState('');
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addNote = async () => {
    if (!title.trim() || !note.trim()) {
      Alert.alert('Error', 'Title and note cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      const myDeviceToken = await AsyncStorage.getItem('myDeviceToken');

      const noteRef = await firestore().collection('notes').add({
        title,
        content: note,
        timestamp: firestore.FieldValue.serverTimestamp(),
        createdBy: myDeviceToken,
      });

      console.log('✅ Note added with ID:', noteRef.id);

      if (myDeviceToken) {
        const notificationRef = firestore()
          .collection('pendingNotifications')
          .doc();

        await notificationRef.set({
          title: 'New Note Added!',
          body: `A new note titled "${title}" has been added.`,
          noteId: noteRef.id,
          timestamp: firestore.FieldValue.serverTimestamp(),
          sourceDevice: myDeviceToken,
          targetDevice: myDeviceToken,
        });

        await notifee.displayNotification({
          title: 'New Note Added!',
          body: `A new note titled "${title}" has been added.`,
          data: {
            noteId: noteRef.id,
            type: 'NEW_NOTE',
          },
          android: {
            channelId: 'notes_channel',
            pressAction: {id: 'default'},
          },
        });
      }
      setTitle('');
      setNote('');
      // navigation.navigate('NotesList');
    } catch (error) {
      console.error('❌ Error adding note:', error);
      Alert.alert('Error', 'Failed to add note. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text variant="headlineSmall">Add New Note</Text>
      <TextInput
        label="Title"
        value={title}
        onChangeText={setTitle}
        mode="outlined"
        style={styles.input}
      />
      <TextInput
        label="Note"
        value={note}
        onChangeText={setNote}
        mode="outlined"
        multiline
        numberOfLines={4}
        style={styles.noteInput}
      />
      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={() => navigation.goBack()}
          style={styles.button}
          disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={addNote}
          style={styles.button}
          loading={isSubmitting}
          disabled={!title.trim() || !note.trim() || isSubmitting}>
          Add Note
        </Button>
      </View>
    </View>
  );
};

export default AddNoteScreen;
