/* eslint-disable react-native/no-inline-styles */
import React, {useEffect, useState} from 'react';
import {
  View,
  StyleSheet,
  Text,
  useColorScheme,
  NativeEventEmitter,
  NativeModules,
} from 'react-native';

const {NFCModule} = NativeModules;

export default function NFCScreen() {
  const isDarkMode = useColorScheme() === 'dark';
  const [nfcMessage, setNfcMessage] = useState<string>(
    'Please place your ID card...',
  );
  const [tagData, setTagData] = useState<any>(null);

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(NFCModule);
    eventEmitter.removeAllListeners('NFCTagDetected');

    const nfcSubscription = eventEmitter.addListener('NFCTagDetected', data => {
      try {
        setNfcMessage('ID Card detected!');
        const formattedData = {
          cardType: data.cardType || 'Unknown',
          idNumber: data.idNumber || data.uid || 'Not available',
          name: data.name || 'Not available',
          dateOfBirth: data.dateOfBirth || 'Not available',
          expiryDate: data.expiryDate || 'Not available',
          nationality: data.nationality || 'Not available',
        };
        setTagData(formattedData);
      } catch (error: unknown) {
        setNfcMessage('Error reading ID card: ' + (error as Error).message);
      }
    });

    NFCModule.startNFCScanning();

    return () => {
      nfcSubscription.remove();
      eventEmitter.removeAllListeners('NFCTagDetected');
      NFCModule.stopNFCScanning();
    };
  }, []);

  const renderTagData = () => {
    if (!tagData) {
      return null;
    }
    console.log(tagData);

    return (
      <View style={styles.tagDataContainer}>
        <Text style={[styles.tagDataHeader, {color: textColor}]}>
          ID Card Information
        </Text>
        {Object.entries(tagData).map(([key, value]) => (
          <View key={key} style={styles.dataRow}>
            <Text style={[styles.labelText, {color: textColor}]}>
              {key.replace(/([A-Z])/g, ' $1').trim()}:
            </Text>
            <Text style={[styles.valueText, {color: textColor}]}>
              {value?.toString() || 'N/A'}
            </Text>
          </View>
        ))}
      </View>
    );
  };

  const textColor = isDarkMode ? '#ffffff' : '#000000';

  return (
    <View
      style={[
        styles.container,
        {backgroundColor: isDarkMode ? '#1a1a1a' : '#f5f5f5'},
      ]}>
      <Text style={[styles.messageText, {color: textColor}]}>{nfcMessage}</Text>
      {renderTagData()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    fontSize: 18,
    textAlign: 'center',
    padding: 20,
  },
  tagDataContainer: {
    padding: 20,
    width: '90%',
    borderRadius: 10,
    marginTop: 20,
  },
  tagDataHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ccc',
  },
  labelText: {
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  valueText: {
    fontSize: 16,
    flex: 2,
    textAlign: 'right',
  },
});
