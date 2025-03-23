/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Image,
  Text,
  Animated,
  Dimensions,
  useColorScheme,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';
const {CompassModule} = NativeModules;

const {width} = Dimensions.get('window');

export default function CompassScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [compassDegree, setCompassDegree] = useState<number>(0);
  const rotateValue = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const compassEmitter = new NativeEventEmitter(CompassModule);
    const compassSubscription = compassEmitter.addListener(
      'CompassUpdate',
      data => {
        setCompassDegree(data.degree);
        rotateValue.setValue(360 - data.degree);
      },
    );

    CompassModule.startCompassUpdates();

    return () => {
      compassSubscription.remove();
      CompassModule.stopCompassUpdates();
    };
  }, [rotateValue]);

  const spin = rotateValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'},
      ]}>
      <View style={styles.compassContainer}>
        <Image
          source={require('../../assets/compass-base.png')}
          style={styles.compassBase}
        />
        <Animated.Image
          source={require('../../assets/compass-needle.png')}
          style={[
            styles.compassNeedle,
            {
              transform: [{rotate: spin}],
            },
          ]}
        />
        <Text style={[styles.degreeText, {color: textColor}]}>
          {Math.round(compassDegree)}°
        </Text>
        <Text style={[styles.directionText, {color: textColor}]}>
          {getDirection(compassDegree)}
        </Text>
      </View>
    </View>
  );
}

const getDirection = (degree: number): string => {
  const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  const index = Math.round(degree / 45) % 8;
  return directions[index];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  compassContainer: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  compassBase: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    resizeMode: 'contain',
  },
  compassNeedle: {
    width: '80%',
    height: '80%',
    position: 'absolute',
    resizeMode: 'contain',
  },
  degreeText: {
    fontSize: 48,
    fontWeight: 'bold',
    position: 'absolute',
    bottom: -80,
  },
  directionText: {
    fontSize: 24,
    fontWeight: '600',
    position: 'absolute',
    bottom: -120,
  },
});
