import React from 'react';
import {StyleSheet, View, KeyboardAvoidingView, Platform} from 'react-native';
import {Button, TextInput, IconButton, Surface, Text} from 'react-native-paper';

interface AddNoteModalProps {
  title: string;
  note: string;
  onChangeTitle: (text: string) => void;
  onChangeNote: (text: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const AddNoteModal = ({
  title,
  note,
  onChangeTitle,
  onChangeNote,
  onSubmit,
  onClose,
}: AddNoteModalProps) => {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.modalContainer}>
      <Surface style={styles.inputContainer} elevation={5}>
        <View style={styles.header}>
          <Text variant="headlineSmall">Add New Note</Text>
          <IconButton
            icon="close"
            size={24}
            onPress={onClose}
            style={styles.closeButton}
          />
        </View>

        <TextInput
          label="Title"
          value={title}
          onChangeText={onChangeTitle}
          mode="outlined"
          style={styles.input}
          placeholder="Enter note title"
          returnKeyType="next"
        />

        <TextInput
          label="Note"
          value={note}
          onChangeText={onChangeNote}
          mode="outlined"
          multiline
          numberOfLines={4}
          style={styles.noteInput}
          placeholder="Write your note here..."
          textAlignVertical="top"
        />

        <View style={styles.buttonContainer}>
          <Button
            mode="outlined"
            onPress={onClose}
            style={styles.button}
            contentStyle={styles.buttonContent}>
            Cancel
          </Button>
          <Button
            mode="contained"
            onPress={onSubmit}
            style={styles.button}
            contentStyle={styles.buttonContent}
            disabled={!title.trim() || !note.trim()}>
            Add Note
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 16,
  },
  inputContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    margin: -8,
  },
  input: {
    marginHorizontal: 16,
    marginBottom: 12,
    backgroundColor: 'transparent',
  },
  noteInput: {
    marginHorizontal: 16,
    marginBottom: 16,
    backgroundColor: 'transparent',
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    padding: 16,
    paddingTop: 0,
  },
  button: {
    minWidth: 100,
    marginLeft: 12,
  },
  buttonContent: {
    paddingVertical: 8,
  },
});

export default AddNoteModal;
