import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SourceCitation({ source }) {
  if (!source) return null;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        if (source.url) {
          Linking.openURL(source.url).catch(() => {});
        }
      }}
      activeOpacity={source.url ? 0.7 : 1}
    >
      <Ionicons name="document-text-outline" size={14} color="#999" />
      <Text style={styles.text}>
        資料來源：<Text style={styles.link}>{source.name}</Text>
      </Text>
      {source.url && <Ionicons name="open-outline" size={12} color="#999" />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 16,
    gap: 6,
  },
  text: {
    flex: 1,
    fontSize: 12,
    color: '#999',
    lineHeight: 18,
  },
  link: {
    color: '#10A0E0',
    textDecorationLine: 'underline',
  },
});
