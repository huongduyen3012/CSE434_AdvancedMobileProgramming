/* eslint-disable react-native/no-inline-styles */
import React, {useState} from 'react';
import {Alert, StyleSheet, View} from 'react-native';
import {Button, Divider, IconButton, Text, TextInput} from 'react-native-paper';
import {signInWithEmail, signInWithGoogle} from '../firebase/config';
// import { styles } from '../styles';

const LoginScreen = ({navigation}: {navigation: any}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    setLoading(true);
    try {
      await signInWithEmail(email, password);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
    setLoading(false);
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };
  return (
    <View style={styles.container}>
      <View
        style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: 20,
          paddingBottom: 30,
        }}>
        <Text
          variant="displayMedium"
          style={{
            color: '#1f41bb',
            fontWeight: 'bold',
          }}>
          Login here
        </Text>
        <Text variant="titleMedium">Welcome back you've been missed!</Text>
      </View>
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="flat"
        underlineColor="#1f41bb"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="flat"
        underlineColor="#1f41bb"
        secureTextEntry={!showPassword}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={togglePasswordVisibility}
          />
        }
      />
      <Button
        mode="contained"
        buttonColor="#1f41bb"
        onPress={handleLogin}
        loading={loading}
        disabled={loading}>
        Login
      </Button>
      <View style={{alignItems: 'center', marginTop: 20}}>
        <View style={styles.dividerContainer}>
          <Divider style={styles.divider} />
          <Text style={styles.dividerText}>Or continue with</Text>
          <Divider style={styles.divider} />
        </View>

        <View style={styles.buttonContainer}>
          <IconButton
            mode="contained"
            icon={'account-plus'}
            iconColor="#1f41bb"
            onPress={() => navigation.navigate('Signup')}
            disabled={loading}
          />
          <IconButton
            icon={'google'}
            iconColor="#1f41bb"
            onPress={handleGoogleSignIn}
            disabled={loading}
            mode="contained"
          />
        </View>
      </View>
    </View>
  );
};
export const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#f1f4ff',
  },
  button: {
    width: '100%',
    marginVertical: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 10,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E0E0E0',
  },
  dividerText: {
    marginHorizontal: 16,
    color: '#666',
    fontSize: 14,
  },
});
export default LoginScreen;
