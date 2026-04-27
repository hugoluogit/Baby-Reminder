// 本地存儲工具函數

import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  NOTIFICATION_SETTINGS: '@notification_settings',
  USER_PROFILE: '@user_profile',
  GROWTH_RECORDS: '@growth_records',
  COMPLETED_VACCINES: '@completed_vaccines',
  COMPLETED_CHECKUPS: '@completed_checkups',
  VACCINE_REMINDERS: '@vaccine_reminders',
  CHECKUP_REMINDERS: '@checkup_reminders',
};

export async function saveNotificationSettings(reminderTime, daysBefore) {
  try {
    const settings = { reminderTime, daysBefore, updatedAt: new Date().toISOString() };
    await AsyncStorage.setItem(KEYS.NOTIFICATION_SETTINGS, JSON.stringify(settings));
    return true;
  } catch (e) {
    console.error('儲存通知設定失敗:', e);
    return false;
  }
}

export async function getNotificationSettings() {
  try {
    const json = await AsyncStorage.getItem(KEYS.NOTIFICATION_SETTINGS);
    if (json) return JSON.parse(json);
    return { reminderTime: '10:00', daysBefore: 3 };
  } catch (e) {
    console.error('讀取通知設定失敗:', e);
    return { reminderTime: '10:00', daysBefore: 3 };
  }
}

export async function saveUserProfile(profile) {
  try {
    await AsyncStorage.setItem(KEYS.USER_PROFILE, JSON.stringify(profile));
    return true;
  } catch (e) {
    console.error('儲存用戶資料失敗:', e);
    return false;
  }
}

export async function getUserProfile() {
  try {
    const json = await AsyncStorage.getItem(KEYS.USER_PROFILE);
    if (json) return JSON.parse(json);
    return null;
  } catch (e) {
    console.error('讀取用戶資料失敗:', e);
    return null;
  }
}

export async function saveGrowthRecord(record) {
  try {
    const records = await getGrowthRecords();
    const newRecord = { ...record, id: Date.now().toString(), createdAt: new Date().toISOString() };
    records.push(newRecord);
    await AsyncStorage.setItem(KEYS.GROWTH_RECORDS, JSON.stringify(records));
    return newRecord;
  } catch (e) {
    console.error('儲生成長記錄失敗:', e);
    return null;
  }
}

export async function getGrowthRecords() {
  try {
    const json = await AsyncStorage.getItem(KEYS.GROWTH_RECORDS);
    if (json) return JSON.parse(json);
    return [];
  } catch (e) {
    console.error('讀取成長記錄失敗:', e);
    return [];
  }
}

export async function deleteGrowthRecord(id) {
  try {
    const records = await getGrowthRecords();
    const filtered = records.filter(r => r.id !== id);
    await AsyncStorage.setItem(KEYS.GROWTH_RECORDS, JSON.stringify(filtered));
    return true;
  } catch (e) {
    console.error('刪除成長記錄失敗:', e);
    return false;
  }
}

export async function saveCompletedVaccines(ids) {
  try {
    await AsyncStorage.setItem(KEYS.COMPLETED_VACCINES, JSON.stringify(ids));
    return true;
  } catch (e) {
    console.error('儲存已完成疫苗失敗:', e);
    return false;
  }
}

export async function getCompletedVaccines() {
  try {
    const json = await AsyncStorage.getItem(KEYS.COMPLETED_VACCINES);
    if (json) return JSON.parse(json);
    return [];
  } catch (e) {
    console.error('讀取已完成疫苗失敗:', e);
    return [];
  }
}

export async function saveCompletedCheckups(ids) {
  try {
    await AsyncStorage.setItem(KEYS.COMPLETED_CHECKUPS, JSON.stringify(ids));
    return true;
  } catch (e) {
    console.error('儲存已完成產檢失敗:', e);
    return false;
  }
}

export async function getCompletedCheckups() {
  try {
    const json = await AsyncStorage.getItem(KEYS.COMPLETED_CHECKUPS);
    if (json) return JSON.parse(json);
    return [];
  } catch (e) {
    console.error('讀取已完成產檢失敗:', e);
    return [];
  }
}

export async function saveVaccineReminders(reminders) {
  try {
    await AsyncStorage.setItem(KEYS.VACCINE_REMINDERS, JSON.stringify(reminders));
    return true;
  } catch (e) {
    console.error('儲存疫苗提醒失敗:', e);
    return false;
  }
}

export async function getVaccineReminders() {
  try {
    const json = await AsyncStorage.getItem(KEYS.VACCINE_REMINDERS);
    if (json) return JSON.parse(json);
    return {};
  } catch (e) {
    console.error('讀取疫苗提醒失敗:', e);
    return {};
  }
}

export async function saveCheckupReminders(reminders) {
  try {
    await AsyncStorage.setItem(KEYS.CHECKUP_REMINDERS, JSON.stringify(reminders));
    return true;
  } catch (e) {
    console.error('儲存產檢提醒失敗:', e);
    return false;
  }
}

export async function getCheckupReminders() {
  try {
    const json = await AsyncStorage.getItem(KEYS.CHECKUP_REMINDERS);
    if (json) return JSON.parse(json);
    return {};
  } catch (e) {
    console.error('讀取產檢提醒失敗:', e);
    return {};
  }
}
