/* eslint-disable react/no-unstable-nested-components */
/* eslint-disable react-native/no-inline-styles */
/* eslint-disable react-hooks/exhaustive-deps */
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import {useEffect, useState} from 'react';
import {Alert, FlatList, SafeAreaView, View} from 'react-native';
import {Card, Divider, IconButton, Menu, Text} from 'react-native-paper';
import {getCurrentUser, signOut} from '../firebase/config';
import {Note} from '../types';
import {styles} from './styles';

const NotesListScreen = ({navigation}: {navigation: any}) => {
  const pastelColors: string[] = [
    '#FFB3BA',
    '#BAFFC9',
    '#BAE1FF',
    '#FFFFBA',
    '#FFE4E1',
  ];
  const [notes, setNotes] = useState<Note[]>([]);
  const [menuVisible, setMenuVisible] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    if (!user) {
      return;
    }

    const subscriber = firestore()
      .collection('users')
      .doc(user.uid)
      .collection('notes')
      .orderBy('timestamp', 'desc')
      .onSnapshot(querySnapshot => {
        if (!querySnapshot || querySnapshot.empty) {
          console.log('No notes found.');
          setNotes([]);
          return;
        }
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
        onPress: () =>
          firestore()
            .collection('users')
            .doc(auth().currentUser?.uid)
            .collection('notes')
            .doc(noteId)
            .delete(),
      },
    ]);
  };
  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <View style={{flexDirection: 'row'}}>
          <IconButton
            icon="note-plus"
            onPress={() => navigation.navigate('AddNote')}
          />
          <Menu
            visible={menuVisible}
            onDismiss={() => setMenuVisible(false)}
            anchor={
              <IconButton
                icon="dots-vertical"
                onPress={() => setMenuVisible(true)}
              />
            }>
            <Menu.Item
              onPress={() => {
                setMenuVisible(false);
                signOut();
              }}
              title="Logout"
              leadingIcon="logout"
            />
            <Divider />
          </Menu>
        </View>
      ),
    });
  }, [navigation, menuVisible]);

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
      {/* <View style={styles.fabContainer}>
        <FAB
          icon="plus"
          style={styles.fab}
          onPress={() => navigation.navigate('AddNote')}
        />
      </View> */}
    </SafeAreaView>
  );
};

export default NotesListScreen;
