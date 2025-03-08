/* eslint-disable react-native/no-inline-styles */
import {useNavigation} from '@react-navigation/native';
import React, {useState} from 'react';
import {Alert, ScrollView, View} from 'react-native';
import {Button, Text, TextInput} from 'react-native-paper';
import {signUpWithEmail} from '../firebase/config';
import {styles} from './LoginScreen';

const SignupScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigation = useNavigation();

  const handleSignUp = async () => {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const userCredential = await signUpWithEmail(email, password);

      if (displayName && userCredential?.user) {
        await userCredential.user.updateProfile({
          displayName: displayName,
        });
      }

      Alert.alert('Success', 'Account created successfully!');
      navigation.goBack();
    } catch (error: any) {
      console.error('Signup error:', error);
      Alert.alert(
        'Error',
        error.message || 'There was a problem creating your account',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{alignItems: 'center', marginBottom: 20, paddingBottom: 30}}>
        <Text
          variant="displayMedium"
          style={{color: '#1f41bb', fontWeight: 'bold'}}>
          Sign Up
        </Text>
        <Text variant="titleMedium">Join us and start your journey!</Text>
      </View>

      <TextInput
        label="Display Name (Optional)"
        value={displayName}
        onChangeText={setDisplayName}
        mode="flat"
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        mode="flat"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        mode="flat"
        secureTextEntry={!showPassword}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowPassword(!showPassword)}
          />
        }
      />
      <TextInput
        label="Confirm Password"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        mode="flat"
        secureTextEntry={!showConfirmPassword}
        style={styles.input}
        right={
          <TextInput.Icon
            icon={showConfirmPassword ? 'eye-off' : 'eye'}
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
          />
        }
      />

      <Button
        mode="contained"
        buttonColor="#1f41bb"
        onPress={handleSignUp}
        loading={loading}
        disabled={loading}>
        Sign Up
      </Button>

      <View style={{alignItems: 'center', marginTop: 20}}>
        <Button
          labelStyle={{color: '#1f41bb'}}
          mode="text"
          onPress={() => navigation.goBack()}>
          Already have an account? Log in
        </Button>
      </View>
    </ScrollView>
  );
};

export default SignupScreen;
