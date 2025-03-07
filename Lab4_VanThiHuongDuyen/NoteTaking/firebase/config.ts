import messaging from '@react-native-firebase/messaging';
import firestore from '@react-native-firebase/firestore';

export async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('✅ Notification permission granted.');
    await getFCMToken();
  } else {
    console.log('❌ Notification permission denied.');
  }
}

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
