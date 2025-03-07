/* eslint-disable @typescript-eslint/no-unused-vars */
import notifee, {EventType} from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import type {NavigationContainerRef} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useEffect, useRef} from 'react';
import AddNoteScreen from './components/AddNote';
import NotesListScreen from './components/NoteList';
import {RootStackParamList} from './types';

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission granted.');
    await getToken();
  } else {
    console.log('Notification permission denied.');
  }
}

async function getToken() {
  try {
    const token = await messaging().getToken();
    console.log('FCM Token:', token);

    await AsyncStorage.setItem('deviceId', token);
    return token;
  } catch (error) {
    console.error('Error getting FCM token:', error);
    return null;
  }
}

const setupNotificationListener = async () => {
  try {
    const myDeviceToken = await AsyncStorage.getItem('myDeviceToken');
    if (!myDeviceToken) {
      console.log('🚫 No device token found.');
      return;
    }

    console.log('📡 Listening for notifications...', myDeviceToken);

    // Get the last notification timestamp to avoid showing old notifications
    const lastTimestamp = await AsyncStorage.getItem(
      'lastNotificationTimestamp',
    );
    let query = firestore()
      .collection('pendingNotifications')
      .where('targetDevice', '==', myDeviceToken)
      .orderBy('timestamp', 'desc');

    // Only listen for new notifications if we have a timestamp
    if (lastTimestamp) {
      const date = new Date(parseInt(lastTimestamp, 10));
      query = query.where('timestamp', '>', date);
    }

    return query.onSnapshot(async snapshot => {
      console.log(`🔍 Firestore detected ${snapshot.docs.length} documents`);

      for (const change of snapshot.docChanges()) {
        if (change.type === 'added') {
          const notification = change.doc.data();
          console.log('📩 New notification received:', notification);

          if (!notification.timestamp) {
            console.log('⚠️ Notification has no timestamp, skipping');
            continue;
          }

          // Check if this is actually a new notification
          const notificationTime = notification.timestamp.toDate().getTime();
          const lastProcessedTime = lastTimestamp
            ? parseInt(lastTimestamp, 10)
            : 0;

          if (notificationTime > lastProcessedTime) {
            await notifee.displayNotification({
              title: notification.title,
              body: notification.body,
              data: {noteId: notification.noteId, type: 'NEW_NOTE'},
              android: {
                channelId: 'notes_channel',
                pressAction: {id: 'default'},
              },
            });

            await AsyncStorage.setItem(
              'lastNotificationTimestamp',
              notificationTime.toString(),
            );
          } else {
            console.log('⚠️ Skipping old notification:', notification);
          }
        }
      }
    });
  } catch (error) {
    console.error('❌ Error setting up notification listener:', error);
    return null;
  }
};

const registerDeviceToken = async () => {
  try {
    const token = await messaging().getToken();

    if (token) {
      console.log('✅ Registering device token:', token);

      await firestore().collection('deviceTokens').doc(token).set(
        {
          token,
          timestamp: firestore.FieldValue.serverTimestamp(),
        },
        {merge: true},
      );

      await AsyncStorage.setItem('myDeviceToken', token);
    } else {
      console.log('❌ No FCM token received');
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
  }
};

const createChannel = async () => {
  const channel = await notifee.createChannel({
    id: 'notes_channel',
    name: 'Notes Notifications',
    lights: false,
    vibration: true,
    importance: 4,
  });
  console.log('✅ Channel created:', channel);
  return channel;
};
const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    requestUserPermission();
    registerDeviceToken();
    createChannel();
    setupNotificationListener();
  }, []);

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('📩 Foreground notification received:', remoteMessage);

      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Note',
        body: remoteMessage.notification?.body || 'A new note was added',
        data: remoteMessage.data,
        android: {
          channelId: 'notes_channel',
          pressAction: {id: 'default'},
        },
      });

      if (remoteMessage?.data?.noteId && navigationRef.current) {
        navigationRef.current.navigate('NotesList');
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    const unsubscribe = notifee.onForegroundEvent(({type, detail}) => {
      if (type === EventType.PRESS) {
        console.log('🔔 Notification clicked:', detail.notification);

        if (navigationRef.current) {
          navigationRef.current.navigate('NotesList');
        }
      }
    });

    notifee.onBackgroundEvent(async ({type, detail}) => {
      if (type === EventType.PRESS) {
        console.log(
          '🔔 Notification clicked in background:',
          detail.notification,
        );
      }
    });

    const checkInitialNotification = async () => {
      const initialNotification = await notifee.getInitialNotification();

      if (initialNotification) {
        console.log('🔔 App opened by notification', initialNotification);
        setTimeout(() => {
          if (navigationRef.current) {
            navigationRef.current.navigate('NotesList');
          }
        }, 500);
      }
    };

    checkInitialNotification();

    return unsubscribe;
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator>
        <Stack.Screen
          name="NotesList"
          component={NotesListScreen}
          options={{title: 'Notes'}}
        />
        <Stack.Screen
          name="AddNote"
          component={AddNoteScreen}
          options={{title: 'Add Note'}}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
