import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import checkupsData, { calculatePregnancyWeek, getCheckupsByWeek } from '../data/prenatalCheckups';
import {
  getUserProfile, saveCompletedCheckups, getCompletedCheckups,
  saveCheckupReminders, getCheckupReminders, getNotificationSettings,
} from '../storage/settings';
import { checkAndRequestPermission, scheduleNotificationAtDate, cancelNotification } from '../utils/notifications';
import AdBanner from '../components/AdBanner';
import AdInterstitial from '../components/AdInterstitial';

export default function PregnancyScreen() {
  const [pregnancyWeek, setPregnancyWeek] = useState(0);
  const [checkupList, setCheckupList] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [reminders, setReminders] = useState({});
  const [interstitialCount, setInterstitialCount] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCheckup, setEditingCheckup] = useState(null);
  const [editDaysBefore, setEditDaysBefore] = useState(3);
  const [editHour, setEditHour] = useState(10);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  async function loadData() {
    const profileData = await getUserProfile();
    setProfile(profileData);
    const completed = await getCompletedCheckups();
    setCompletedIds(completed);
    const savedReminders = await getCheckupReminders();

    let week = 0;
    if (profileData?.dueDate && profileData?.mode === 'pregnancy') {
      week = calculatePregnancyWeek(profileData.dueDate);
      // 自動排程可能在 Expo Go 中因為通知權限而拋出異常，用 try/catch 保護
      try {
        const updatedReminders = await handleAutoSchedule(profileData, savedReminders, completed);
        setReminders(updatedReminders);
      } catch (e) {
        console.warn('自動排程失敗，使用已儲存的提醒資料:', e);
        setReminders(savedReminders);
      }
    } else {
      setReminders(savedReminders);
    }
    setPregnancyWeek(week);
    setCheckupList(getCheckupsByWeek(week, completed));
  }

  async function handleAutoSchedule(profileData, existingReminders, completedArray = []) {
    if (!profileData?.dueDate) return existingReminders;
    const hasPerm = await checkAndRequestPermission();
    const notifSettings = await getNotificationSettings();

    const defaultDaysBefore = notifSettings.daysBefore || 3;
    const defaultHour = parseInt(notifSettings.reminderTime?.split(':')[0] || '10', 10);
    const completedSet = new Set(completedArray);
    const newReminders = { ...existingReminders };
    let hasNewReminders = false;

    for (const checkup of checkupsData) {
      if (completedSet.has(checkup.id)) continue;

      const dueDate = calculateCheckupDueDate(profileData.dueDate, checkup);
      if (!dueDate) continue;
      const dueDateStr = dueDate.toISOString();

      const existing = newReminders[checkup.id];

      // 如果已有提醒且 dueDate 相同，無需更新
      if (existing && existing.dueDate === dueDateStr) continue;

      // dueDate 已變化（預產期改了），取消舊通知
      if (existing && existing.notificationId) {
        try { await cancelNotification(existing.notificationId); } catch (_) {}
      }

      // 保留用戶自定義的提前天數和時間，否則用全局默認值
      const itemDaysBefore = existing?.daysBefore ?? defaultDaysBefore;
      const itemHour = existing?.hour ?? defaultHour;

      const remindDate = new Date(dueDate);
      remindDate.setDate(remindDate.getDate() - itemDaysBefore);
      remindDate.setHours(itemHour, 0, 0, 0);

      // 一律儲存提醒中繼資料，即使通知無法排程
      let notificationId = null;
      if (hasPerm && remindDate > new Date()) {
        try {
          notificationId = await scheduleNotificationAtDate(
            '產檢提醒',
            `${checkup.name} 將在 ${itemDaysBefore} 天後進行`,
            { type: 'checkup', id: checkup.id },
            remindDate
          );
        } catch (e) {
          console.warn('排程通知失敗，提醒中繼資料仍會儲存:', e);
        }
      }

      newReminders[checkup.id] = {
        daysBefore: itemDaysBefore,
        hour: itemHour,
        notificationId,
        dueDate: dueDateStr,
      };
      hasNewReminders = true;
    }

    if (hasNewReminders) {
      await saveCheckupReminders(newReminders);
    }
    return newReminders;
  }

  async function handleComplete(id) {
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(c => c !== id)
      : [...completedIds, id];

    setCompletedIds(newCompleted);
    await saveCompletedCheckups(newCompleted);
    setCheckupList(getCheckupsByWeek(pregnancyWeek, newCompleted));

    if (!completedIds.includes(id)) {
      setInterstitialCount(prev => prev + 1);
    }
  }

  function calculateCheckupDueDate(dueDate, checkup) {
    if (!dueDate) return null;
    const due = new Date(dueDate);
    const weekMid = (checkup.weekStart + checkup.weekEnd) / 2;
    const daysOffset = (weekMid - 40) * 7;
    const result = new Date(due);
    result.setDate(result.getDate() + daysOffset);
    return result;
  }

  function handleEditReminder(checkup) {
    setEditingCheckup(checkup);
    const existing = reminders[checkup.id];
    setEditDaysBefore(existing?.daysBefore || 3);
    setEditHour(existing?.hour ?? 10);
    setModalVisible(true);
  }

  async function handleSaveReminder() {
    if (!editingCheckup) return;
    const hasPerm = await checkAndRequestPermission();
    if (!hasPerm) {
      Alert.alert('提示', '請允許通知權限以設置提醒');
      return;
    }

    if (reminders[editingCheckup.id]?.notificationId) {
      await cancelNotification(reminders[editingCheckup.id].notificationId);
    }

    const dueDate = calculateCheckupDueDate(profile?.dueDate, editingCheckup);
    if (!dueDate) return;

    const remindDate = new Date(dueDate);
    remindDate.setDate(remindDate.getDate() - editDaysBefore);
    remindDate.setHours(editHour, 0, 0, 0);

    if (remindDate <= new Date()) {
      Alert.alert('提示', '提醒時間已過，請調整提前天數或時間');
      return;
    }

    const notificationId = await scheduleNotificationAtDate(
      '產檢提醒',
      `${editingCheckup.name} 將在 ${editDaysBefore} 天後進行`,
      { type: 'checkup', id: editingCheckup.id },
      remindDate
    );

    const newReminders = {
      ...reminders,
      [editingCheckup.id]: {
        daysBefore: editDaysBefore,
        hour: editHour,
        notificationId,
        dueDate: dueDate.toISOString(),
      },
    };

    setReminders(newReminders);
    await saveCheckupReminders(newReminders);
    setModalVisible(false);
    setEditingCheckup(null);
  }

  async function handleCancelReminder(checkupId) {
    if (reminders[checkupId]?.notificationId) {
      await cancelNotification(reminders[checkupId].notificationId);
    }
    const newReminders = { ...reminders };
    delete newReminders[checkupId];
    setReminders(newReminders);
    await saveCheckupReminders(newReminders);
  }

  const showInterstitial = interstitialCount > 0 && interstitialCount % 3 === 0;

  function formatReminderDate(reminder) {
    if (!reminder) return '';
    const d = new Date(reminder.dueDate);
    d.setDate(d.getDate() - reminder.daysBefore);
    d.setHours(reminder.hour, 0, 0, 0);
    const y = d.getFullYear();
    const m = d.getMonth() + 1;
    const day = d.getDate();
    return `${y}年${m}月${day}日 ${String(reminder.hour).padStart(2, '0')}:00`;
  }

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        {profile?.mode === 'pregnancy' && profile?.dueDate ? (
          <>
            <View style={styles.weekCard}>
              <Text style={styles.weekLabel}>當前孕週</Text>
              <Text style={styles.weekNumber}>{pregnancyWeek}</Text>
              <Text style={styles.weekUnit}>週</Text>
            </View>

            <Text style={styles.sectionTitle}>產檢時間表</Text>
            {checkupList.map(checkup => (
              <View key={checkup.id} style={[styles.checkupCard, checkup.status === 'completed' && styles.completedCard]}>
                <View style={styles.checkupHeader}>
                  <View style={[styles.statusDot, {
                    backgroundColor: checkup.status === 'completed' ? '#4CAF50'
                      : checkup.status === 'overdue' ? '#FF5252'
                      : checkup.status === 'current' ? '#FF6B8A'
                      : '#DDD'
                  }]} />
                  <View style={styles.checkupInfo}>
                    <Text style={styles.checkupName}>{checkup.name}</Text>
                    <Text style={styles.checkupWeeks}>第 {checkup.weeks}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.completeBtn, checkup.status === 'completed' && styles.completedBtn]}
                    onPress={() => handleComplete(checkup.id)}
                  >
                    <Ionicons
                      name={checkup.status === 'completed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={24}
                      color={checkup.status === 'completed' ? '#4CAF50' : '#FF6B8A'}
                    />
                  </TouchableOpacity>
                </View>

                <Text style={styles.checkupItems}>{checkup.items}</Text>
                {checkup.notes ? <Text style={styles.checkupNotes}>💡 {checkup.notes}</Text> : null}

                <View style={styles.reminderActions}>
                  <TouchableOpacity style={styles.reminderBtn} onPress={() => handleEditReminder(checkup)}>
                    <Ionicons name="alarm-outline" size={16} color="#FF6B8A" />
                    <Text style={styles.reminderBtnText}>
                      {reminders[checkup.id] ? '更改/取消提醒' : '設置提醒'}
                    </Text>
                  </TouchableOpacity>
                  {reminders[checkup.id] && (
                    <Text style={styles.reminderInfo}>
                      {formatReminderDate(reminders[checkup.id])}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="flower-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>請先在「我的」頁面設置孕期模式並輸入預產期</Text>
          </View>
        )}
      </ScrollView>

      <AdBanner />
      {showInterstitial ? <AdInterstitial /> : null}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>設置提醒</Text>
            {editingCheckup && (
              <Text style={styles.modalSubtitle}>{editingCheckup.name}</Text>
            )}

            <Text style={styles.label}>提前天數</Text>
            <View style={styles.pickerRow}>
              {[1, 2, 3, 5, 7, 14].map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.pickerBtn, editDaysBefore === d && styles.pickerBtnActive]}
                  onPress={() => setEditDaysBefore(d)}
                >
                  <Text style={[styles.pickerBtnText, editDaysBefore === d && styles.pickerBtnTextActive]}>
                    {d} 天
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>提醒時間</Text>
            <View style={styles.pickerRow}>
              {Array.from({ length: 24 }, (_, i) => i).map(h => (
                <TouchableOpacity
                  key={h}
                  style={[styles.pickerBtn, editHour === h && styles.pickerBtnActive]}
                  onPress={() => setEditHour(h)}
                >
                  <Text style={[styles.pickerBtnText, editHour === h && styles.pickerBtnTextActive]}>
                    {String(h).padStart(2, '0')}:00
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => {
                if (editingCheckup && reminders[editingCheckup.id]) {
                  handleCancelReminder(editingCheckup.id);
                }
                setModalVisible(false);
                setEditingCheckup(null);
              }}>
                <Text style={styles.modalCancelText}>
                  {editingCheckup && reminders[editingCheckup.id] ? '取消提醒' : '取消'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveReminder}>
                <Text style={styles.modalSaveText}>保存</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF5F5' },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingBottom: 20 },
  weekCard: {
    backgroundColor: '#FF6B8A',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  weekLabel: { fontSize: 16, color: '#FFF', opacity: 0.9 },
  weekNumber: { fontSize: 64, fontWeight: 'bold', color: '#FFF', marginVertical: 4 },
  weekUnit: { fontSize: 18, color: '#FFF', opacity: 0.9 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  checkupCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  completedCard: { opacity: 0.7 },
  checkupHeader: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  checkupInfo: { flex: 1 },
  checkupName: { fontSize: 16, fontWeight: '600', color: '#333' },
  checkupWeeks: { fontSize: 13, color: '#888', marginTop: 2 },
  completeBtn: { padding: 4 },
  completedBtn: {},
  checkupItems: { fontSize: 14, color: '#666', marginTop: 10, lineHeight: 20 },
  checkupNotes: { fontSize: 13, color: '#888', marginTop: 6, fontStyle: 'italic' },
  reminderActions: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F5F5F5',
  },
  reminderBtn: { flexDirection: 'row', alignItems: 'center' },
  reminderBtnText: { fontSize: 13, color: '#FF6B8A', marginLeft: 4 },
  reminderInfo: { fontSize: 12, color: '#888', marginTop: 6 },
  emptyCard: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 48,
    alignItems: 'center',
  },
  emptyText: { fontSize: 16, color: '#888', marginTop: 16, textAlign: 'center' },

  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center' },
  modalSubtitle: { fontSize: 14, color: '#666', textAlign: 'center', marginTop: 4, marginBottom: 16 },
  label: { fontSize: 15, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 8 },
  pickerRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pickerBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  pickerBtnActive: {
    backgroundColor: '#FF6B8A',
    borderColor: '#FF6B8A',
  },
  pickerBtnText: { fontSize: 14, color: '#666' },
  pickerBtnTextActive: { color: '#FFF', fontWeight: '600' },
  modalActions: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, color: '#666', fontWeight: '600' },
  modalSaveBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#FF6B8A',
    alignItems: 'center',
  },
  modalSaveText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
});
