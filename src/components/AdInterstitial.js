import React from 'react';
import { View, StyleSheet } from 'react-native';

// 插屏廣告佔位組件
// 發布時需整合 react-native-google-mobile-ads

export default function AdInterstitial() {
  return (
    <View style={styles.container}>
      <View style={styles.adPlaceholder}>
        {/* 插屏廣告位 */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  adPlaceholder: {
    width: 300,
    height: 250,
    backgroundColor: '#FFF',
    borderRadius: 12,
  },
});
