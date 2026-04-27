import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getNotificationSettings, saveNotificationSettings } from '../storage/settings';
import { cancelAllNotifications, getScheduledNotifications } from '../utils/notifications';

export default function SettingsScreen() {
  const [reminderTime, setReminderTime] = useState('10:00');
  const [daysBefore, setDaysBefore] = useState(3);
  const [scheduledCount, setScheduledCount] = useState(0);

  useFocusEffect(
    useCallback(() => {
      loadSettings();
      loadScheduledCount();
    }, [])
  );

  async function loadSettings() {
    const settings = await getNotificationSettings();
    setReminderTime(settings.reminderTime || '10:00');
    setDaysBefore(settings.daysBefore || 3);
  }

  async function loadScheduledCount() {
    try {
      const notifications = await getScheduledNotifications();
      setScheduledCount(notifications.length);
    } catch (e) {
      setScheduledCount(0);
    }
  }

  async function handleSave() {
    const success = await saveNotificationSettings(reminderTime, daysBefore);
    if (success) {
      Alert.alert('成功', '設置已保存');
    } else {
      Alert.alert('錯誤', '保存失敗，請重試');
    }
  }

  async function handleClearAll() {
    Alert.alert(
      '確認清除',
      '確定要清除所有提醒嗎？此操作無法還原。',
      [
        { text: '取消', style: 'cancel' },
        {
          text: '清除',
          style: 'destructive',
          onPress: async () => {
            await cancelAllNotifications();
            setScheduledCount(0);
            Alert.alert('成功', '所有提醒已清除');
          },
        },
      ]
    );
  }

  const hours = [];
  for (let i = 8; i <= 22; i++) {
    hours.push(i);
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>提醒設置</Text>

        <View style={styles.infoRow}>
          <Ionicons name="notifications-outline" size={20} color="#FF6B8A" />
          <Text style={styles.infoText}>已設置 <Text style={styles.infoCount}>{scheduledCount}</Text> 個提醒</Text>
        </View>

        <Text style={styles.label}>提醒時間</Text>
        <Text style={styles.hint}>選擇每天接收提醒的時間</Text>
        <View style={styles.pickerRow}>
          {hours.map(h => {
            const timeStr = `${String(h).padStart(2, '0')}:00`;
            return (
              <TouchableOpacity
                key={h}
                style={[styles.pickerBtn, reminderTime === timeStr && styles.pickerBtnActive]}
                onPress={() => setReminderTime(timeStr)}
              >
                <Text style={[styles.pickerBtnText, reminderTime === timeStr && styles.pickerBtnTextActive]}>
                  {timeStr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.label, { marginTop: 24 }]}>提前天數</Text>
        <Text style={styles.hint}>在檢查或接種前多少天提醒您</Text>
        <View style={styles.pickerRow}>
          {[1, 2, 3, 5, 7, 14].map(d => (
            <TouchableOpacity
              key={d}
              style={[styles.pickerBtn, daysBefore === d && styles.pickerBtnActive]}
              onPress={() => setDaysBefore(d)}
            >
              <Text style={[styles.pickerBtnText, daysBefore === d && styles.pickerBtnTextActive]}>
                {d} 天
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
        <Text style={styles.saveBtnText}>保存設置</Text>
      </TouchableOpacity>

      {scheduledCount > 0 && (
        <TouchableOpacity style={styles.clearBtn} onPress={handleClearAll}>
          <Ionicons name="trash-outline" size={20} color="#FF5252" />
          <Text style={styles.clearBtnText}>清除所有提醒</Text>
        </TouchableOpacity>
      )}

      <View style={styles.infoCard}>
        <Ionicons name="information-circle-outline" size={20} color="#888" />
        <Text style={styles.infoText2}>
          提醒設置會影響所有疫苗接種和產檢項目的默認提醒時間。您也可以在對應頁面中為每個項目單獨設置提醒。
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  content: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 16 },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, backgroundColor: '#FFF5F5', padding: 12, borderRadius: 8 },
  infoText: { fontSize: 15, color: '#666', marginLeft: 8 },
  infoCount: { color: '#FF6B8A', fontWeight: 'bold', fontSize: 18 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginBottom: 4 },
  hint: { fontSize: 13, color: '#888', marginBottom: 10 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  pickerBtnActive: { backgroundColor: '#FF6B8A', borderColor: '#FF6B8A' },
  pickerBtnText: { fontSize: 14, color: '#666' },
  pickerBtnTextActive: { color: '#FFF', fontWeight: '600' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B8A',
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF5252',
    marginBottom: 16,
  },
  clearBtnText: { color: '#FF5252', fontSize: 16, fontWeight: '600', marginLeft: 8 },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
  },
  infoText2: { fontSize: 13, color: '#888', marginLeft: 8, flex: 1, lineHeight: 20 },
});
