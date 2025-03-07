import {AppRegistry} from 'react-native';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';
import App from './App';
import {name as appName} from './app.json';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  console.log('📩 Background message received:', remoteMessage);

  await notifee.displayNotification({
    title: remoteMessage.notification?.title || 'New Note',
    body: remoteMessage.notification?.body || 'A new note was added',
    data: remoteMessage.data,
    android: {
      channelId: 'notes_channel',
      pressAction: {id: 'default'},
    },
  });
});

messaging().onNotificationOpenedApp(remoteMessage => {
  console.log(
    '📩 Notification caused app to open from background:',
    remoteMessage,
  );
});

messaging()
  .getInitialNotification()
  .then(remoteMessage => {
    if (remoteMessage) {
      console.log('📩 Notification opened from quit state:', remoteMessage);
    }
  });

AppRegistry.registerComponent(appName, () => App);
