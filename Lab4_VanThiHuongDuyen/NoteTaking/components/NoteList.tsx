/* eslint-disable react-hooks/exhaustive-deps */
import {useEffect, useState} from 'react';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {Alert, FlatList, SafeAreaView, View} from 'react-native';
import {Card, FAB, IconButton, Text} from 'react-native-paper';
import {styles} from './styles';
import {Note} from '../types';

const NotesListScreen = ({navigation}: {navigation: any}) => {
  const pastelColors: string[] = [
    '#FFB3BA',
    '#BAFFC9',
    '#BAE1FF',
    '#FFFFBA',
    '#FFE4E1',
  ];
  const [notes, setNotes] = useState<Note[]>([]);

  useEffect(() => {
    const subscriber = firestore()
      .collection('notes')
      .orderBy('timestamp', 'asc')
      .onSnapshot(querySnapshot => {
        const notesArray: Note[] = [];
        let index = 0;
        querySnapshot.forEach(documentSnapshot => {
          const note = {
            id: documentSnapshot.id,
            title: documentSnapshot.data().title,
            content: documentSnapshot.data().content,
            timestamp: documentSnapshot.data().timestamp,
            backgroundColor: pastelColors[index % pastelColors.length],
          };
          notesArray.push(note);
          index++;
        });
        console.log('Fetched notes:', notesArray);
        setNotes(notesArray);
      });
    return () => subscriber();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(
        remoteMessage.notification?.title || 'New Notification',
        remoteMessage.notification?.body || '',
      );
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onNotificationOpenedApp(remoteMessage => {
      if (remoteMessage.data?.type === 'NEW_NOTE') {
        navigation.navigate('NotesList');
      }
    });

    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage?.data?.type === 'NEW_NOTE' && navigation.isReady()) {
          navigation.navigate('NotesList');
        }
      });

    return unsubscribe;
  }, []);

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

  const confirmDelete = (noteId: string) => {
    Alert.alert('Delete Note', 'Are you sure you want to delete this note?', [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => firestore().collection('notes').doc(noteId).delete(),
      },
    ]);
  };
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={notes}
        renderItem={({item}) => (
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
            <Card.Actions>
              <IconButton
                icon="delete"
                onPress={() => confirmDelete(item.id)}
              />
            </Card.Actions>
          </Card>
        )}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContent}
      />
      <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddNote')}
        />
      </View>
    </SafeAreaView>
  );
};

export default NotesListScreen;
