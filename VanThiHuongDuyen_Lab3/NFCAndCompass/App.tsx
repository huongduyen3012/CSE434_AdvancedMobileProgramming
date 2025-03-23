import React from 'react';
import {useColorScheme} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import CompassScreen from './src/screens/CompassScreen';
import NFCScreen from './src/screens/NFCScreen';

const Tab = createBottomTabNavigator();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarStyle: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
          },
          tabBarActiveTintColor: isDarkMode ? '#ffffff' : '#000000',
          tabBarInactiveTintColor: isDarkMode ? '#888888' : '#666666',
          headerStyle: {
            backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5',
          },
          headerTintColor: isDarkMode ? '#ffffff' : '#000000',
        }}>
        <Tab.Screen
          name="Compass"
          component={CompassScreen}
          options={{
            title: 'Compass',
          }}
        />
        <Tab.Screen
          name="NFC"
          component={NFCScreen}
          options={{
            title: 'NFC Reader',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

export default App;
