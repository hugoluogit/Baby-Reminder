import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, Platform, Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getUserProfile, saveUserProfile } from '../storage/settings';
import * as ImagePicker from 'expo-image-picker';

export default function ProfileScreen({ navigation }) {
  const [mode, setMode] = useState('baby');
  const [babyName, setBabyName] = useState('');
  const [gender, setGender] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [momPhoto, setMomPhoto] = useState(null);
  const [babyPhoto, setBabyPhoto] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [])
  );

  async function loadProfile() {
    const profile = await getUserProfile();
    if (profile) {
      setMode(profile.mode || 'baby');
      setBabyName(profile.babyName || '');
      setGender(profile.gender || '');
      setBirthDate(profile.birthDate || '');
      setDueDate(profile.dueDate || '');
      setMomPhoto(profile.momPhoto || null);
      setBabyPhoto(profile.babyPhoto || null);
    }
  }

  async function pickPhoto(type) {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('提示', '需要存取相簿權限才能上傳照片');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]?.uri) {
      if (type === 'mom') setMomPhoto(result.assets[0].uri);
      else setBabyPhoto(result.assets[0].uri);
    }
  }

  async function handleSave() {
    if (mode === 'baby' && !birthDate) {
      Alert.alert('提示', '請輸入寶寶出生日期');
      return;
    }
    if (mode === 'pregnancy' && !dueDate) {
      Alert.alert('提示', '請輸入預產期');
      return;
    }

    const profile = {
      mode,
      babyName,
      gender,
      birthDate: mode === 'baby' ? birthDate : '',
      dueDate: mode === 'pregnancy' ? dueDate : '',
      momPhoto: mode === 'pregnancy' ? momPhoto : (momPhoto || null),
      babyPhoto: mode === 'baby' ? babyPhoto : (babyPhoto || null),
      updatedAt: new Date().toISOString(),
    };

    const success = await saveUserProfile(profile);
    if (success) {
      Alert.alert('成功', '資料已保存');
    } else {
      Alert.alert('錯誤', '保存失敗，請重試');
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>模式選擇</Text>
        <View style={styles.modeRow}>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'baby' && styles.modeBtnActive]}
            onPress={() => setMode('baby')}
          >
            <Ionicons
              name="happy-outline"
              size={32}
              color={mode === 'baby' ? '#FFF' : '#FF6B8A'}
            />
            <Text style={[styles.modeBtnText, mode === 'baby' && styles.modeBtnTextActive]}>
              寶寶模式
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.modeBtn, mode === 'pregnancy' && styles.modeBtnActive]}
            onPress={() => setMode('pregnancy')}
          >
            <Ionicons
              name="flower-outline"
              size={32}
              color={mode === 'pregnancy' ? '#FFF' : '#FF6B8A'}
            />
            <Text style={[styles.modeBtnText, mode === 'pregnancy' && styles.modeBtnTextActive]}>
              孕期模式
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {mode === 'baby' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>寶寶資料</Text>

          <Text style={styles.label}>寶寶姓名</Text>
          <TextInput
            style={styles.input}
            value={babyName}
            onChangeText={setBabyName}
            placeholder="輸入寶寶姓名"
            placeholderTextColor="#BBB"
          />

          <Text style={styles.label}>寶寶性別</Text>
          <View style={styles.genderRow}>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
              onPress={() => setGender('male')}
            >
              <Ionicons
                name="man-outline"
                size={24}
                color={gender === 'male' ? '#FFF' : '#4A90D9'}
              />
              <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>男寶</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
              onPress={() => setGender('female')}
            >
              <Ionicons
                name="woman-outline"
                size={24}
                color={gender === 'female' ? '#FFF' : '#FF6B8A'}
              />
              <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>女寶</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>出生日期</Text>
          <TextInput
            style={styles.input}
            value={birthDate}
            onChangeText={setBirthDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#BBB"
          />
          <Text style={styles.hint}>格式為 YYYY-MM-DD，例如：2026-12-25</Text>

          <Text style={styles.label}>寶寶照片</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto('baby')}>
            {babyPhoto ? (
              <Image source={{ uri: babyPhoto }} style={styles.photoPreview} />
            ) : (
              <Ionicons name="camera-outline" size={24} color="#FF6B8A" />
            )}
            <Text style={styles.photoBtnText}>{babyPhoto ? '更換照片' : '上傳寶寶照片'}</Text>
          </TouchableOpacity>
        </View>
      )}

      {mode === 'pregnancy' && (
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>孕期資料</Text>

          <Text style={styles.label}>預產期</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="YYYY-MM-DD"
            placeholderTextColor="#BBB"
          />
          <Text style={styles.hint}>
            請輸入醫生給出的預產期日期
          </Text>
          <Text style={styles.hint}>格式為 YYYY-MM-DD，例如：2026-12-25</Text>

          <Text style={styles.label}>媽媽照片</Text>
          <TouchableOpacity style={styles.photoBtn} onPress={() => pickPhoto('mom')}>
            {momPhoto ? (
              <Image source={{ uri: momPhoto }} style={styles.photoPreview} />
            ) : (
              <Ionicons name="camera-outline" size={24} color="#FF6B8A" />
            )}
            <Text style={styles.photoBtnText}>{momPhoto ? '更換照片' : '上傳媽媽照片'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
        <Ionicons name="checkmark-circle-outline" size={20} color="#FFF" />
        <Text style={styles.saveBtnText}>保存資料</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.settingsBtn} onPress={() => navigation.navigate('Settings')}>
        <Ionicons name="settings-outline" size={20} color="#FF6B8A" />
        <Text style={styles.settingsBtnText}>提醒設置</Text>
        <Ionicons name="chevron-forward" size={20} color="#CCC" />
      </TouchableOpacity>
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
  modeRow: { flexDirection: 'row', gap: 12 },
  modeBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 24,
    borderRadius: 12,
    backgroundColor: '#FFF5F5',
    borderWidth: 2,
    borderColor: '#FFE0E6',
  },
  modeBtnActive: { backgroundColor: '#FF6B8A', borderColor: '#FF6B8A' },
  modeBtnText: { fontSize: 16, fontWeight: '600', color: '#FF6B8A', marginTop: 8 },
  modeBtnTextActive: { color: '#FFF' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 16, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  genderRow: { flexDirection: 'row', gap: 12 },
  genderBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#EEE',
  },
  genderBtnActive: { backgroundColor: '#FF6B8A', borderColor: '#FF6B8A' },
  genderText: { fontSize: 16, fontWeight: '600', color: '#666', marginLeft: 8 },
  genderTextActive: { color: '#FFF' },
  hint: { fontSize: 13, color: '#888', marginTop: 8, fontStyle: 'italic' },
  photoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FFE0E6',
    borderRadius: 10,
    padding: 14,
    marginTop: 6,
  },
  photoPreview: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  photoBtnText: { fontSize: 15, color: '#FF6B8A', fontWeight: '500' },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B8A',
    paddingVertical: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  saveBtnText: { color: '#FFF', fontSize: 18, fontWeight: 'bold', marginLeft: 8 },
  settingsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF',
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  settingsBtnText: { fontSize: 16, fontWeight: '600', color: '#FF6B8A', marginLeft: 10, flex: 1 },
});
