import React from 'react';
import { View, StyleSheet } from 'react-native';

// Banner 廣告佔位組件
// 發布時需整合 react-native-google-mobile-ads

export default function AdBanner() {
  return (
    <View style={styles.container}>
      <View style={styles.adPlaceholder}>
        {/* Banner 廣告位 */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF5F5',
  },
  adPlaceholder: {
    width: '100%',
    height: 50,
    backgroundColor: '#FFF0F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
