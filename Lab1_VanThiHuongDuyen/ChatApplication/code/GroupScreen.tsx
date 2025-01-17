/* eslint-disable react-native/no-inline-styles */
import React, {useState, useEffect} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  TextInput,
  View,
  Text,
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {io, Socket} from 'socket.io-client';

interface Messages {
  _id: string;
  message: string;
  isSentByMe: boolean;
  username: string;
}

const GroupScreen = ({route}: any) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Messages[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const username = route.params?.username;

  useEffect(() => {
    const newSocket = io('http://192.168.100.144:3000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      // Join with username as per your server implementation
      if (username) {
        newSocket.emit('join', { username: username });
      }
    });

    //Fetching message history
    newSocket.on('messageHistory', (messageHistory: Messages[]) => {
      setMessages(
        messageHistory.map(msg => ({
          ...msg,
          isSentByMe: msg.username === username,
        })),
      );
    });

    // Listen for incoming messages from the server
    newSocket.on(
      'receiveMessage',
      (data: {username: string; message: string; _id: string}) => {
        setMessages(prevMessages => [
          ...prevMessages,
          {
            _id: data._id,
            username: data.username,
            isSentByMe: data.username === username,
            message: data.message,
          },
        ]);
      },
    );

    // Listen for user join/leave events (optional)
    newSocket.on('userJoined', ({message}: {message: string}) => {
      console.log(message); // Log user join message
    });

    newSocket.on('userLeft', ({message}: {message: string}) => {
      console.log(message); // Log user leave message
    });

    // Cleanup on unmount
    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [username]);

  const sendMessage = () => {
    if (socket && newMessage.trim()) {
      // Emit message to the server
      socket.emit('chatMessage', {
        username,
        message: newMessage.trim(),
        isSentByMe: true,
      });
      setNewMessage('');
    }
  };

  const renderMessage = ({item}: {item: Messages}) => (
    <View
      style={[
        styles.messageContainer,
        item.isSentByMe ? styles.myMessage : styles.theirMessage,
      ]}>
      {!item.isSentByMe && (
        <Text style={styles.usernameText}>{item.username}</Text>
      )}
      <Text style={styles.messageText}>{item.message}</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView style={styles.container} behavior="padding">
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderMessage}
        style={styles.chatContainer}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Type a message..."
          value={newMessage}
          onChangeText={setNewMessage}
        />
        <IconButton
          icon="send"
          size={20}
          style={styles.sendButton}
          iconColor="#fff"
          onPress={sendMessage}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },

  chatContainer: {
    flex: 1,
    padding: 10,
  },

  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: '70%',
  },

  myMessage: {
    alignSelf: 'flex-end',
    backgroundColor: '#00695c',
  },

  theirMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#ddd',
  },

  messageText: {
    color: '#fff',
  },

  usernameText: {
    fontSize: 12,
    color: '#555',
    marginBottom: 5,
  },

  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },

  input: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
  },

  sendButton: {
    width: 40,
    height: 40,
    backgroundColor: '#00695c',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default GroupScreen;
