import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Modal, TextInput, Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { getGrowthRecords, saveGrowthRecord, deleteGrowthRecord } from '../storage/settings';
import { formatDateChinese } from '../utils/dateUtils';
import AdBanner from '../components/AdBanner';

const screenWidth = Dimensions.get('window').width;

export default function GrowthScreen() {
  const [records, setRecords] = useState([]);
  const [showChart, setShowChart] = useState(false);
  const [chartType, setChartType] = useState('weight');
  const [modalVisible, setModalVisible] = useState(false);
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [notes, setNotes] = useState('');
  const [recordDate, setRecordDate] = useState(new Date().toISOString().split('T')[0]);

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [])
  );

  async function loadRecords() {
    const data = await getGrowthRecords();
    const sorted = data.sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt));
    setRecords(sorted);
  }

  async function handleAdd() {
    if (!weight && !height) {
      Alert.alert('提示', '請輸入體重或身高');
      return;
    }

    const record = {
      date: recordDate,
      weight: weight ? parseFloat(weight) : null,
      height: height ? parseFloat(height) : null,
      notes: notes || '',
    };

    const result = await saveGrowthRecord(record);
    if (result) {
      setWeight('');
      setHeight('');
      setNotes('');
      setRecordDate(new Date().toISOString().split('T')[0]);
      setModalVisible(false);
      await loadRecords();
    }
  }

  async function handleDelete(id) {
    Alert.alert('確認刪除', '確定要刪除此記錄嗎？', [
      { text: '取消', style: 'cancel' },
      {
        text: '刪除',
        style: 'destructive',
        onPress: async () => {
          await deleteGrowthRecord(id);
          await loadRecords();
        },
      },
    ]);
  }

  function prepareChartData(type) {
    const sorted = [...records].sort((a, b) => new Date(a.date || a.createdAt) - new Date(b.date || b.createdAt));
    const labels = sorted.map(r => {
      const d = new Date(r.date || r.createdAt);
      return `${d.getMonth() + 1}/${d.getDate()}`;
    });
    const data = sorted.map(r => type === 'weight' ? r.weight : r.height).filter(v => v !== null);

    if (data.length === 0) return null;

    return {
      labels: labels.length > 6 ? labels.filter((_, i) => i % Math.ceil(labels.length / 6) === 0) : labels,
      datasets: [{ data }],
    };
  }

  const chartData = showChart ? prepareChartData(chartType) : null;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
            <Ionicons name="add-circle-outline" size={20} color="#FFF" />
            <Text style={styles.addBtnText}>添加記錄</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.chartToggle, showChart && styles.chartToggleActive]}
            onPress={() => setShowChart(!showChart)}
          >
            <Ionicons name={showChart ? 'list-outline' : 'trending-up-outline'} size={20} color="#FF6B8A" />
            <Text style={styles.chartToggleText}>{showChart ? '顯示列表' : '顯示圖表'}</Text>
          </TouchableOpacity>
        </View>

        {showChart && chartData ? (
          <View style={styles.chartCard}>
            <View style={styles.chartTypeRow}>
              <TouchableOpacity
                style={[styles.chartTypeBtn, chartType === 'weight' && styles.chartTypeBtnActive]}
                onPress={() => setChartType('weight')}
              >
                <Text style={[styles.chartTypeText, chartType === 'weight' && styles.chartTypeTextActive]}>體重</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chartTypeBtn, chartType === 'height' && styles.chartTypeBtnActive]}
                onPress={() => setChartType('height')}
              >
                <Text style={[styles.chartTypeText, chartType === 'height' && styles.chartTypeTextActive]}>身高</Text>
              </TouchableOpacity>
            </View>
            <LineChart
              data={chartData}
              width={screenWidth - 64}
              height={220}
              chartConfig={{
                backgroundColor: '#FFF',
                backgroundGradientFrom: '#FFF',
                backgroundGradientTo: '#FFF',
                decimalCount: 1,
                color: (opacity = 1) => `rgba(255, 107, 138, ${opacity})`,
                labelColor: () => '#666',
                propsForDots: { r: '5', strokeWidth: '2', stroke: '#FF6B8A' },
              }}
              bezier
              style={styles.chart}
            />
          </View>
        ) : showChart && !chartData ? (
          <View style={styles.emptyChart}>
            <Text style={styles.emptyText}>暫無足夠數據顯示圖表</Text>
          </View>
        ) : null}

        {!showChart && (
          <>
            <Text style={styles.sectionTitle}>記錄列表</Text>
            {records.length === 0 ? (
              <View style={styles.emptyCard}>
                <Ionicons name="trending-up-outline" size={48} color="#DDD" />
                <Text style={styles.emptyText}>還沒有成長記錄，點擊上方按鈕添加</Text>
              </View>
            ) : (
              records.map(record => (
                <View key={record.id} style={styles.recordCard}>
                  <View style={styles.recordHeader}>
                    <Text style={styles.recordDate}>{formatDateChinese(record.date || record.createdAt)}</Text>
                    <TouchableOpacity onPress={() => handleDelete(record.id)}>
                      <Ionicons name="trash-outline" size={18} color="#FF5252" />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.recordData}>
                    {record.weight && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>體重</Text>
                        <Text style={styles.recordValue}>{record.weight} kg</Text>
                      </View>
                    )}
                    {record.height && (
                      <View style={styles.recordItem}>
                        <Text style={styles.recordLabel}>身高</Text>
                        <Text style={styles.recordValue}>{record.height} cm</Text>
                      </View>
                    )}
                  </View>
                  {record.notes ? <Text style={styles.recordNotes}>{record.notes}</Text> : null}
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>

      <AdBanner />

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>添加成長記錄</Text>

            <Text style={styles.label}>日期</Text>
            <TextInput
              style={styles.input}
              value={recordDate}
              onChangeText={setRecordDate}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#BBB"
            />

            <Text style={styles.label}>體重（kg）</Text>
            <TextInput
              style={styles.input}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
              placeholder="例如：5.2"
              placeholderTextColor="#BBB"
            />

            <Text style={styles.label}>身高（cm）</Text>
            <TextInput
              style={styles.input}
              value={height}
              onChangeText={setHeight}
              keyboardType="decimal-pad"
              placeholder="例如：60.5"
              placeholderTextColor="#BBB"
            />

            <Text style={styles.label}>備註</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={notes}
              onChangeText={setNotes}
              multiline
              numberOfLines={3}
              placeholder="選填"
              placeholderTextColor="#BBB"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancelText}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleAdd}>
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
  actionRow: { flexDirection: 'row', marginBottom: 16, gap: 12 },
  addBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B8A',
    paddingVertical: 12,
    borderRadius: 10,
  },
  addBtnText: { color: '#FFF', fontSize: 16, fontWeight: '600', marginLeft: 6 },
  chartToggle: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FF6B8A',
  },
  chartToggleActive: { backgroundColor: '#FFF0F3' },
  chartToggleText: { fontSize: 14, color: '#FF6B8A', marginLeft: 6 },
  chartCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
  },
  chartTypeRow: { flexDirection: 'row', marginBottom: 12, gap: 8 },
  chartTypeBtn: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
  },
  chartTypeBtnActive: { backgroundColor: '#FF6B8A' },
  chartTypeText: { fontSize: 14, color: '#666' },
  chartTypeTextActive: { color: '#FFF', fontWeight: '600' },
  chart: { borderRadius: 8 },
  emptyChart: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 48,
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 12 },
  recordCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  recordHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  recordDate: { fontSize: 15, fontWeight: '600', color: '#333' },
  recordData: { flexDirection: 'row', marginTop: 10, gap: 24 },
  recordItem: {},
  recordLabel: { fontSize: 13, color: '#888' },
  recordValue: { fontSize: 18, fontWeight: 'bold', color: '#333', marginTop: 2 },
  recordNotes: { fontSize: 13, color: '#888', marginTop: 8, fontStyle: 'italic' },
  emptyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 48, alignItems: 'center' },
  emptyText: { fontSize: 14, color: '#888', marginTop: 12, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: Platform.OS === 'ios' ? 40 : 24,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 16 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginTop: 12, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#EEE',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#333',
    backgroundColor: '#FAFAFA',
  },
  textArea: { height: 80, textAlignVertical: 'top' },
  modalActions: { flexDirection: 'row', marginTop: 20, gap: 12 },
  modalCancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#F5F5F5', alignItems: 'center',
  },
  modalCancelText: { fontSize: 16, color: '#666', fontWeight: '600' },
  modalSaveBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 10, backgroundColor: '#FF6B8A', alignItems: 'center',
  },
  modalSaveText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
});
