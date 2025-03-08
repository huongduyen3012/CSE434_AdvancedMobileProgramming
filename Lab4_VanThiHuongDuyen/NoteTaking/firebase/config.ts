import firestore from '@react-native-firebase/firestore';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import auth from '@react-native-firebase/auth';
import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {Alert} from 'react-native';

GoogleSignin.configure({
  webClientId:
    '99226905336-s1crdoibn3dc4prc4d3qegh3pm0sjstu.apps.googleusercontent.com',
});

export const signInWithEmail = async (email: string, password: string) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    const userId = userCredential.user.uid;

    console.log('✅ Logged in with UID:', userId);
    await AsyncStorage.setItem('userId', userId);
  } catch (error) {
    console.error('❌ Login Error:', error);
    Alert.alert('Error', 'Something is wrong');
  }
};

export const signUpWithEmail = async (email: string, password: string) => {
  return auth().createUserWithEmailAndPassword(email, password);
};

export const signInWithGoogle = async () => {
  try {
    await GoogleSignin.hasPlayServices({showPlayServicesUpdateDialog: true});

    const signInResult = await GoogleSignin.signIn();

    let idToken = signInResult.data?.idToken;
    if (!idToken) {
      throw new Error('No ID token found in signInResult');
    }

    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    const userCredential = await auth().signInWithCredential(googleCredential);

    console.log('Signed in with Google:', userCredential.user);
    Alert.alert('Success', 'Signed in with Google!');

    // navigation.replace('MainTabs');
  } catch (error) {
    console.error('Google Sign-In Error:', error);
  }
};

export const signOut = async () => {
  await auth().signOut();
  await GoogleSignin.signOut();
};

export const getCurrentUser = () => {
  return auth().currentUser;
};

export async function requestUserPermission() {
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

export async function getToken() {
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

export const setupNotificationListener = async () => {
  try {
    const user = getCurrentUser();
    if (!user) {
      console.log('🚫 No authenticated user for notifications.');
      return;
    }

    console.log('📡 Setting up notification listener for user:', user.uid);

    return firestore()
      .collection('users')
      .doc(user.uid)
      .collection('pendingNotifications')
      .orderBy('timestamp', 'desc')
      .onSnapshot(
        async snapshot => {
          console.log(
            `🔍 Detected ${snapshot.docs.length} pending notifications.`,
          );

          for (const change of snapshot.docChanges()) {
            if (change.type === 'added') {
              const notification = change.doc.data();
              console.log('📩 New notification:', notification);

              await notifee.displayNotification({
                title: notification.title,
                body: notification.body,
                data: {noteId: notification.noteId, type: 'NEW_NOTE'},
                android: {
                  channelId: 'notes_channel',
                  pressAction: {id: 'default'},
                },
              });

              await change.doc.ref.delete();
            }
          }
        },
        error => {
          console.error('❌ Error in notification listener:', error);
        },
      );
  } catch (error) {
    console.error('❌ Error setting up notification listener:', error);
  }
};

export const registerDeviceToken = async () => {
  try {
    const token = await messaging().getToken();
    const user = await AsyncStorage.getItem('userId');

    console.log('🔑 Retrieved FCM Token:', token);
    console.log('👤 Retrieved User ID from AsyncStorage:', user);

    if (!token) {
      console.error(
        '❌ No FCM token received. Ensure push permissions are granted.',
      );
      return;
    }

    if (!user) {
      console.error(
        '❌ No user ID found in AsyncStorage. Ensure user is logged in.',
      );
      return;
    }

    console.log('✅ Registering device token for user:', user);

    await firestore().collection('users').doc(user).set(
      {
        deviceToken: token,
        timestamp: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );

    await AsyncStorage.setItem('myDeviceToken', token);
    console.log('✅ Device token stored successfully!');
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
  }
};

export const createChannel = async () => {
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

export async function getFCMToken() {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log('🔑 FCM Token:', token);
      await saveTokenToFirestore(token);
    } else {
      console.log('❌ No FCM token retrieved.');
    }
  } catch (error) {
    console.error('❌ Error getting FCM token:', error);
  }
}

async function saveTokenToFirestore(token: string) {
  try {
    await firestore().collection('deviceTokens').doc(token).set(
      {
        token,
        timestamp: firestore.FieldValue.serverTimestamp(),
      },
      {merge: true},
    );
    console.log('✅ Token saved to Firestore');
  } catch (error) {
    console.error('❌ Error saving token to Firestore:', error);
  }
}

export async function setupMessaging() {
  await requestUserPermission();

  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('📩 Background message received:', remoteMessage);
  });
}
