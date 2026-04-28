import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';

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
    return <View style={styles.container} />;
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
    paddingBottom: Platform.OS === 'ios' ? 0 : 4,
  },
});
