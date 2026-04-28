import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getVaccinesByAge } from '../data/vaccinationSchedule';
import { calculateBabyAge } from '../utils/dateUtils';
import {
  getUserProfile, saveCompletedVaccines, getCompletedVaccines,
  saveVaccineReminders, getVaccineReminders, getNotificationSettings,
} from '../storage/settings';
import { checkAndRequestPermission, scheduleNotificationAtDate, cancelNotification } from '../utils/notifications';
import AdBanner from '../components/AdBanner';
import AdInterstitial from '../components/AdInterstitial';

export default function BabyScreen() {
  const [vaccineList, setVaccineList] = useState([]);
  const [completedIds, setCompletedIds] = useState([]);
  const [profile, setProfile] = useState(null);
  const [babyAge, setBabyAge] = useState('');
  const [reminders, setReminders] = useState({});
  const [interstitialCount, setInterstitialCount] = useState(0);
  const [babyPhoto, setBabyPhoto] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState(null);
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
    const completed = await getCompletedVaccines();
    setCompletedIds(completed);
    const savedReminders = await getVaccineReminders();

    let age = '';
    if (profileData?.birthDate && profileData?.mode === 'baby') {
      age = calculateBabyAge(profileData.birthDate);
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
    setBabyAge(age);
    setBabyPhoto(profileData?.babyPhoto || null);
    setVaccineList(getVaccinesByAge(profileData?.birthDate, completed));
  }

  async function handleComplete(id) {
    const newCompleted = completedIds.includes(id)
      ? completedIds.filter(c => c !== id)
      : [...completedIds, id];

    setCompletedIds(newCompleted);
    await saveCompletedVaccines(newCompleted);
    setVaccineList(getVaccinesByAge(profile?.birthDate, newCompleted));

    if (!completedIds.includes(id)) {
      setInterstitialCount(prev => prev + 1);
    }
  }

  async function handleAutoSchedule(profileData, existingReminders, completedArray = []) {
    if (!profileData?.birthDate || profileData?.mode !== 'baby') return existingReminders;
    const hasPerm = await checkAndRequestPermission();
    const notifSettings = await getNotificationSettings();

    const defaultDaysBefore = notifSettings.daysBefore || 3;
    const defaultHour = parseInt(notifSettings.reminderTime?.split(':')[0] || '10', 10);
    const completedSet = new Set(completedArray);
    const newReminders = { ...existingReminders };
    let hasNewReminders = false;

    for (const vaccine of getVaccinesByAge(profileData.birthDate, completedArray)) {
      if (completedSet.has(vaccine.id) || !vaccine.dueDate) continue;

      const existing = newReminders[vaccine.id];

      // 如果已有提醒且 dueDate 相同，無需更新
      if (existing && existing.dueDate === vaccine.dueDate) continue;

      // dueDate 已變化（出生日期改了），取消舊通知
      if (existing && existing.notificationId) {
        try { await cancelNotification(existing.notificationId); } catch (_) {}
      }

      // 保留用戶自定義的提前天數和時間，否則用全局默認值
      // v001（出生疫苗）應在出生當天提醒，不提前
      const itemDaysBefore = vaccine.id === 'v001' ? 0 : (existing?.daysBefore ?? defaultDaysBefore);
      const itemHour = existing?.hour ?? defaultHour;

      const remindDate = new Date(vaccine.dueDate);
      remindDate.setDate(remindDate.getDate() - itemDaysBefore);
      remindDate.setHours(itemHour, 0, 0, 0);

      let notificationId = null;
      if (hasPerm && remindDate > new Date()) {
        try {
          notificationId = await scheduleNotificationAtDate(
            '疫苗接種提醒',
            `${vaccine.name} 將在 ${itemDaysBefore} 天後接種`,
            { type: 'vaccine', id: vaccine.id },
            remindDate
          );
        } catch (e) {
          console.warn('排程通知失敗，提醒中繼資料仍會儲存:', e);
        }
      }

      newReminders[vaccine.id] = {
        daysBefore: itemDaysBefore,
        hour: itemHour,
        notificationId,
        dueDate: vaccine.dueDate,
      };
      hasNewReminders = true;
    }

    if (hasNewReminders) {
      await saveVaccineReminders(newReminders);
    }
    return newReminders;
  }

  function handleEditReminder(vaccine) {
    setEditingVaccine(vaccine);
    const existing = reminders[vaccine.id];
    setEditDaysBefore(existing?.daysBefore || 3);
    setEditHour(existing?.hour ?? 10);
    setModalVisible(true);
  }

  async function handleSaveReminder() {
    if (!editingVaccine) return;
    const hasPerm = await checkAndRequestPermission();
    if (!hasPerm) {
      Alert.alert('提示', '請允許通知權限以設置提醒');
      return;
    }

    if (reminders[editingVaccine.id]?.notificationId) {
      await cancelNotification(reminders[editingVaccine.id].notificationId);
    }

    const remindDate = new Date(editingVaccine.dueDate);
    remindDate.setDate(remindDate.getDate() - editDaysBefore);
    remindDate.setHours(editHour, 0, 0, 0);

    if (remindDate <= new Date()) {
      Alert.alert('提示', '提醒時間已過，請調整提前天數或時間');
      return;
    }

    const notificationId = await scheduleNotificationAtDate(
      '疫苗接種提醒',
      `${editingVaccine.name} 將在 ${editDaysBefore} 天後接種`,
      { type: 'vaccine', id: editingVaccine.id },
      remindDate
    );

    const newReminders = {
      ...reminders,
      [editingVaccine.id]: {
        daysBefore: editDaysBefore,
        hour: editHour,
        notificationId,
        dueDate: editingVaccine.dueDate,
      },
    };

    setReminders(newReminders);
    await saveVaccineReminders(newReminders);
    setModalVisible(false);
    setEditingVaccine(null);
  }

  async function handleCancelReminder(vaccineId) {
    if (reminders[vaccineId]?.notificationId) {
      await cancelNotification(reminders[vaccineId].notificationId);
    }
    const newReminders = { ...reminders };
    delete newReminders[vaccineId];
    setReminders(newReminders);
    await saveVaccineReminders(newReminders);
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
        {profile?.mode === 'baby' && profile?.birthDate ? (
          <>
            <View style={styles.ageCard}>
              {babyPhoto ? (
                <Image source={{ uri: babyPhoto }} style={styles.babyAvatar} />
              ) : (
                <Ionicons name="happy-outline" size={48} color="#FFF" />
              )}
              <Text style={styles.ageLabel}>寶寶年齡</Text>
              <Text style={styles.ageText}>{babyAge}</Text>
              {profile?.babyName && <Text style={styles.babyName}>{profile.babyName}</Text>}
            </View>

            <Text style={styles.sectionTitle}>疫苗接種時間表</Text>
            {vaccineList.map(vaccine => (
              <View key={vaccine.id} style={[styles.vaccineCard, vaccine.status === 'completed' && styles.completedCard]}>
                <View style={styles.vaccineHeader}>
                  <View style={[styles.statusDot, {
                    backgroundColor: vaccine.status === 'completed' ? '#4CAF50'
                      : vaccine.status === 'overdue' ? '#FF5252'
                      : '#FF6B8A'
                  }]} />
                  <View style={styles.vaccineInfo}>
                    <Text style={styles.vaccineName}>{vaccine.name}</Text>
                    <Text style={styles.vaccineAge}>建議接種年齡：{vaccine.age}</Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.completeBtn, vaccine.status === 'completed' && styles.completedBtn]}
                    onPress={() => handleComplete(vaccine.id)}
                  >
                    <Ionicons
                      name={vaccine.status === 'completed' ? 'checkmark-circle' : 'checkmark-circle-outline'}
                      size={24}
                      color={vaccine.status === 'completed' ? '#4CAF50' : '#FF6B8A'}
                    />
                  </TouchableOpacity>
                </View>

                {vaccine.diseases ? (
                  <View style={styles.diseaseTag}>
                    <Ionicons name="shield-outline" size={14} color="#4CAF50" />
                    <Text style={styles.diseaseText}>預防：{vaccine.diseases}</Text>
                  </View>
                ) : null}
                {vaccine.notes ? <Text style={styles.vaccineNotes}>💡 {vaccine.notes}</Text> : null}

                <View style={styles.reminderActions}>
                  <TouchableOpacity style={styles.reminderBtn} onPress={() => handleEditReminder(vaccine)}>
                    <Ionicons name="alarm-outline" size={16} color="#FF6B8A" />
                    <Text style={styles.reminderBtnText}>
                      {reminders[vaccine.id] ? '更改/取消提醒' : '設置提醒'}
                    </Text>
                  </TouchableOpacity>
                  {reminders[vaccine.id] && (
                    <Text style={styles.reminderInfo}>
                      {formatReminderDate(reminders[vaccine.id])}
                    </Text>
                  )}
                </View>
              </View>
            ))}
          </>
        ) : (
          <View style={styles.emptyCard}>
            <Ionicons name="bandage-outline" size={64} color="#DDD" />
            <Text style={styles.emptyText}>請先在「我的」頁面設置寶寶模式並輸入出生日期</Text>
          </View>
        )}
      </ScrollView>

      <AdBanner />
      {showInterstitial ? <AdInterstitial /> : null}

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>設置提醒</Text>
            {editingVaccine && (
              <Text style={styles.modalSubtitle}>{editingVaccine.name}</Text>
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
                if (editingVaccine && reminders[editingVaccine.id]) {
                  handleCancelReminder(editingVaccine.id);
                }
                setModalVisible(false);
                setEditingVaccine(null);
              }}>
                <Text style={styles.modalCancelText}>
                  {editingVaccine && reminders[editingVaccine.id] ? '取消提醒' : '取消'}
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
  ageCard: {
    backgroundColor: '#4CAF50',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  babyAvatar: { width: 128, height: 128, borderRadius: 64, borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)' },
  ageLabel: { fontSize: 16, color: '#FFF', opacity: 0.9, marginTop: 8 },
  ageText: { fontSize: 28, fontWeight: 'bold', color: '#FFF', marginTop: 4 },
  babyName: { fontSize: 16, color: '#FFF', opacity: 0.9, marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  vaccineCard: {
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
  vaccineHeader: { flexDirection: 'row', alignItems: 'center' },
  statusDot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  vaccineInfo: { flex: 1 },
  vaccineName: { fontSize: 16, fontWeight: '600', color: '#333' },
  vaccineAge: { fontSize: 13, color: '#888', marginTop: 2 },
  completeBtn: { padding: 4 },
  completedBtn: {},
  diseaseTag: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  diseaseText: { fontSize: 13, color: '#4CAF50', marginLeft: 6, flex: 1 },
  vaccineNotes: { fontSize: 13, color: '#888', marginTop: 6, fontStyle: 'italic' },
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
    paddingHorizontal: 14,
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
  pickerBtnText: { fontSize: 13, color: '#666' },
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
