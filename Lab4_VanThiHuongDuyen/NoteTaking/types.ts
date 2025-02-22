import {Timestamp} from '@react-native-firebase/firestore';

export type Note = {
  id: string;
  title: string;
  content: string;
  timestamp: Timestamp;
  backgroundColor?: string;
};
