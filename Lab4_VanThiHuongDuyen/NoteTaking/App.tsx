/* eslint-disable @typescript-eslint/no-shadow */
import notifee, {EventType} from '@notifee/react-native';
import auth, {FirebaseAuthTypes} from '@react-native-firebase/auth';
import messaging from '@react-native-firebase/messaging';
import type {NavigationContainerRef} from '@react-navigation/native';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {useEffect, useRef, useState} from 'react';
import {View} from 'react-native';
import {ActivityIndicator, Provider} from 'react-native-paper';
import AddNoteScreen from './components/AddNote';
import LoginScreen from './components/LoginScreen';
import NotesListScreen from './components/NoteList';
import {styles} from './components/styles';
import {RootStackParamList} from './types';
import {
  createChannel,
  registerDeviceToken,
  requestUserPermission,
  setupNotificationListener,
} from './firebase/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import SignupScreen from './components/SignUpScreen';

notifee.onBackgroundEvent(async ({type, detail}) => {
  if (type === EventType.PRESS) {
    console.log('🔔 Notification clicked in background:', detail.notification);
  }
});

const Stack = createStackNavigator<RootStackParamList>();

export default function App() {
  const [user, setUser] = useState<FirebaseAuthTypes.User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigationRef =
    useRef<NavigationContainerRef<RootStackParamList>>(null);

  useEffect(() => {
    const unsubscribe = auth().onAuthStateChanged(async user => {
      if (user) {
        await AsyncStorage.setItem('userId', user.uid);
        setUser(user);
      } else {
        await AsyncStorage.removeItem('userId');
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (user) {
      requestUserPermission();
      registerDeviceToken();
      createChannel();
      setupNotificationListener();
    }
  }, [user]);

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

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }
  return (
    <Provider>
      <NavigationContainer ref={navigationRef}>
        <Stack.Navigator>
          {user ? (
            <>
              <Stack.Screen
                name="NotesList"
                component={NotesListScreen}
                options={{title: 'Notes'}}
              />
              <Stack.Screen
                name="AddNote"
                component={AddNoteScreen}
                options={{title: 'Add New Note'}}
              />
            </>
          ) : (
            <>
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{headerShown: false}}
              />
              <Stack.Screen
                name="Signup"
                component={SignupScreen}
                options={{headerShown: false}}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
