import React, {useEffect, useState} from 'react';
import {Animated, NativeModules, StyleSheet, View} from 'react-native';
import {Text} from 'react-native-paper';
const {BatteryModule} = NativeModules;

function BatteryScreen() {
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const animatedHeight = new Animated.Value(0);

  useEffect(() => {
    BatteryModule.getBatteryPercentage()
      .then((level: number) => {
        setBatteryLevel(level);
        Animated.timing(animatedHeight, {
          toValue: level / 100,
          duration: 1000,
          useNativeDriver: false,
        }).start();
      })
      .catch((error: any) =>
        console.log('Error fetching battery percentage:', error),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getBatteryColor = () => {
    if (batteryLevel !== null) {
      if (batteryLevel <= 20) {
        return '#FF6347';
      }
      if (batteryLevel <= 50) {
        return '#FFA500';
      }
      return '#1EB1FC';
    }
    return '#D3D3D3';
  };

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.heading}>Battery Status</Text>
        <View style={styles.batteryContainer}>
          <View style={styles.batteryOuter}>
            <Animated.View
              style={[
                styles.batteryInner,
                {
                  height: animatedHeight.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  }),
                  backgroundColor: getBatteryColor(),
                },
              ]}
            />
            <Text style={styles.batteryText}>
              {batteryLevel !== null ? `${batteryLevel}%` : 'Loading...'}
            </Text>
          </View>
          <Text style={styles.batteryStatus}>
            {batteryLevel !== null
              ? batteryLevel > 80
                ? 'Fully Charged'
                : batteryLevel > 20
                ? 'Moderate'
                : 'Low Battery'
              : 'Checking...'}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
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
  },
  batteryContainer: {
    alignItems: 'center',
  },
  batteryOuter: {
    width: 150,
    height: 250,
    backgroundColor: '#E0E0E0',
    borderRadius: 10,
    justifyContent: 'flex-end',
    overflow: 'hidden',
    position: 'relative',
  },
  batteryInner: {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    borderRadius: 10,
  },
  batteryText: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  batteryStatus: {
    marginTop: 15,
    fontSize: 18,
    color: '#666',
  },
});
export default BatteryScreen;
