import Slider from '@react-native-community/slider';
import React, {useState} from 'react';
import {NativeModules, StyleSheet, Text, View} from 'react-native';
const {BrightnessModule} = NativeModules;

function BrightnessScreen() {
  const [brightness, setBrightness] = useState(0.5);
  const handleBrightnessChange = (value: React.SetStateAction<number>) => {
    setBrightness(value);
    BrightnessModule.setBrightness(value).catch((error: any) =>
      console.log('Error setting brightness:', error),
    );
  };
  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Screen Brightness</Text>
        <View style={styles.brightnessContainer}>
          <Text style={styles.brightnessLabel}>
            {Math.round(brightness * 100)}%
          </Text>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            step={0.01}
            value={brightness}
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#d3d3d3"
            thumbTintColor="#1EB1FC"
            onValueChange={handleBrightnessChange}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  section: {
    width: '90%',
    padding: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  brightnessContainer: {
    alignItems: 'center',
  },
  brightnessLabel: {
    fontSize: 18,
    marginBottom: 15,
    color: '#666',
  },
  slider: {
    width: '100%',
    height: 50,
  },
});
export default BrightnessScreen;
