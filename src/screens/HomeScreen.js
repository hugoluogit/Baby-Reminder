import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AdBanner from '../components/AdBanner';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.welcomeCard}>
          <Ionicons name="happy-outline" size={64} color="#FF6B8A" />
          <Text style={styles.welcomeTitle}>Baby Steps</Text>
          <Text style={styles.welcomeSubtitle}>陪伴您和寶寶的健康旅程</Text>
        </View>

        <Text style={styles.sectionTitle}>功能介紹</Text>

        <FeatureCard
          icon="flower-outline"
          title="孕期指導"
          description="產檢時間表和提醒，讓您不錯過任何重要檢查"
          color="#FF6B8A"
        />
        <FeatureCard
          icon="bandage-outline"
          title="疫苗指導"
          description="寶寶疫苗接種時間表和提醒，守護寶寶健康"
          color="#4CAF50"
        />
        <FeatureCard
          icon="trending-up-outline"
          title="成長記錄"
          description="記錄寶寶身高體重，查看成長曲線圖表"
          color="#2196F3"
        />
        <FeatureCard
          icon="book-outline"
          title="育兒知識"
          description="專業育兒文章，幫助新手父母輕鬆應對"
          color="#FF9800"
        />

        <View style={styles.sourceCard}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#666" />
          <Text style={styles.sourceText}>
            數據來源：香港衞生署公開資料
          </Text>
        </View>
      </ScrollView>

      <AdBanner />
    </View>
  );
}

function FeatureCard({ icon, title, description, color }) {
  return (
    <View style={styles.featureCard}>
      <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon} size={28} color={color} />
      </View>
      <View style={styles.featureText}>
        <Text style={styles.featureTitle}>{title}</Text>
        <Text style={styles.featureDescription}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  welcomeTitle: { fontSize: 28, fontWeight: 'bold', color: '#FF6B8A', marginTop: 12 },
  welcomeSubtitle: { fontSize: 16, color: '#666666', marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333333', marginBottom: 12 },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: { flex: 1 },
  featureTitle: { fontSize: 16, fontWeight: '600', color: '#333333', marginBottom: 4 },
  featureDescription: { fontSize: 14, color: '#666666', lineHeight: 20 },
  sourceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginTop: 8,
  },
  sourceText: { fontSize: 13, color: '#666666', marginLeft: 8 },
});
