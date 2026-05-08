import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

let BannerAd = null;
let BannerAdSize = null;
let TestIds = null;
let nativeModuleAvailable = false;

try {
  const Ads = require('react-native-google-mobile-ads');
  BannerAd = Ads.BannerAd;
  BannerAdSize = Ads.BannerAdSize;
  TestIds = Ads.TestIds;
  nativeModuleAvailable = true;
} catch (e) {
  // Native module not available (Expo Go)
}

export default function AdBanner() {
  if (!nativeModuleAvailable) {
    return (
      <View style={styles.placeholder}>
        <Ionicons name="megaphone-outline" size={14} color="#CCC" />
        <Text style={styles.placeholderText}>廣告位</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <BannerAd
        unitId={TestIds.BANNER}
        size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    paddingVertical: Platform.OS === 'ios' ? 0 : 4,
    minHeight: 50,
  },
  placeholder: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F0F0F0',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 13,
    color: '#BBB',
    marginLeft: 6,
  },
});
