import firestore from '@react-native-firebase/firestore';
import { useState } from 'react';
import { Alert, View } from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { getCurrentUser } from '../firebase/config';
import { styles } from './styles';

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
      const user = getCurrentUser();
      if (!user) {
        Alert.alert('Error', 'User not logged in');
        return;
      }

      const noteRef = await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('notes')
        .add({
          title,
          content: note,
          timestamp: firestore.FieldValue.serverTimestamp(),
          userId: user.uid,
        });

      console.log('✅ Note added with ID:', noteRef.id);

      await firestore()
        .collection('users')
        .doc(user.uid)
        .collection('pendingNotifications')
        .add({
          title: 'New Note Added!',
          body: `A new note titled "${title}" was added.`,
          noteId: noteRef.id,
          userId: user.uid,
          timestamp: firestore.FieldValue.serverTimestamp(),
        });

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
      <View style={styles.inputContainer}>
        <TextInput
          label="Title"
          value={title}
          onChangeText={setTitle}
          mode="outlined"
          style={styles.input}
          placeholder="Enter title..."
        />
        <TextInput
          label="Note"
          value={note}
          onChangeText={setNote}
          mode="outlined"
          multiline
          numberOfLines={5}
          style={styles.noteInput}
          placeholder="Write your note here..."
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          labelStyle={styles.cancelButtonLable}
          onPress={() => navigation.goBack()}
          style={styles.cancelButton}
          disabled={isSubmitting}>
          Cancel
        </Button>
        <Button
          mode="contained"
          labelStyle={styles.addButtonLabel}
          onPress={addNote}
          style={styles.addButton}
          loading={isSubmitting}
          disabled={!title.trim() || !note.trim() || isSubmitting}>
          {isSubmitting ? 'Saving...' : 'Add Note'}
        </Button>
      </View>
    </View>
  );
};

export default AddNoteScreen;
