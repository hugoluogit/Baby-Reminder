// 兒童成長標準參考數據（WHO 標準，香港衞生署採用）
// 數據來源：WHO Child Growth Standards
// 百分位：P3（第3百分位）, P50（中位數）, P97（第97百分位）

const STANDARDS = {
  male: {
    weight: [
      { month: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
      { month: 1, p3: 3.4, p50: 4.5, p97: 5.8 },
      { month: 2, p3: 4.3, p50: 5.6, p97: 7.1 },
      { month: 3, p3: 5.0, p50: 6.4, p97: 8.0 },
      { month: 4, p3: 5.6, p50: 7.0, p97: 8.7 },
      { month: 5, p3: 6.0, p50: 7.5, p97: 9.3 },
      { month: 6, p3: 6.4, p50: 7.9, p97: 9.8 },
      { month: 7, p3: 6.7, p50: 8.3, p97: 10.3 },
      { month: 8, p3: 6.9, p50: 8.6, p97: 10.7 },
      { month: 9, p3: 7.1, p50: 8.9, p97: 11.0 },
      { month: 10, p3: 7.4, p50: 9.2, p97: 11.4 },
      { month: 11, p3: 7.6, p50: 9.4, p97: 11.7 },
      { month: 12, p3: 7.7, p50: 9.6, p97: 12.0 },
      { month: 15, p3: 8.3, p50: 10.3, p97: 12.8 },
      { month: 18, p3: 8.8, p50: 10.9, p97: 13.7 },
      { month: 24, p3: 9.7, p50: 12.2, p97: 15.3 },
    ],
    height: [
      { month: 0, p3: 46.3, p50: 49.9, p97: 53.4 },
      { month: 1, p3: 50.0, p50: 53.6, p97: 57.2 },
      { month: 2, p3: 52.9, p50: 56.5, p97: 60.1 },
      { month: 3, p3: 55.3, p50: 59.0, p97: 62.7 },
      { month: 4, p3: 57.3, p50: 61.0, p97: 64.7 },
      { month: 5, p3: 59.0, p50: 62.7, p97: 66.4 },
      { month: 6, p3: 60.4, p50: 64.1, p97: 67.8 },
      { month: 7, p3: 61.7, p50: 65.4, p97: 69.2 },
      { month: 8, p3: 62.9, p50: 66.6, p97: 70.4 },
      { month: 9, p3: 64.0, p50: 67.7, p97: 71.6 },
      { month: 10, p3: 65.1, p50: 68.8, p97: 72.7 },
      { month: 11, p3: 66.1, p50: 69.8, p97: 73.7 },
      { month: 12, p3: 67.0, p50: 70.8, p97: 74.8 },
      { month: 15, p3: 69.5, p50: 73.5, p97: 77.6 },
      { month: 18, p3: 71.7, p50: 75.8, p97: 80.0 },
      { month: 24, p3: 75.3, p50: 79.8, p97: 84.4 },
    ],
    headCircumference: [
      { month: 0, p3: 32.1, p50: 34.5, p97: 36.9 },
      { month: 1, p3: 35.1, p50: 37.3, p97: 39.5 },
      { month: 2, p3: 36.9, p50: 39.1, p97: 41.3 },
      { month: 3, p3: 38.3, p50: 40.5, p97: 42.7 },
      { month: 4, p3: 39.4, p50: 41.6, p97: 43.9 },
      { month: 5, p3: 40.3, p50: 42.6, p97: 44.8 },
      { month: 6, p3: 41.0, p50: 43.3, p97: 45.6 },
      { month: 7, p3: 41.7, p50: 44.0, p97: 46.3 },
      { month: 8, p3: 42.2, p50: 44.5, p97: 46.9 },
      { month: 9, p3: 42.6, p50: 45.0, p97: 47.4 },
      { month: 10, p3: 43.0, p50: 45.4, p97: 47.8 },
      { month: 11, p3: 43.4, p50: 45.8, p97: 48.2 },
      { month: 12, p3: 43.7, p50: 46.1, p97: 48.5 },
      { month: 15, p3: 44.3, p50: 46.8, p97: 49.3 },
      { month: 18, p3: 44.9, p50: 47.4, p97: 49.9 },
      { month: 21, p3: 45.3, p50: 47.8, p97: 50.4 },
      { month: 24, p3: 45.7, p50: 48.3, p97: 50.8 },
    ],
  },
  female: {
    weight: [
      { month: 0, p3: 2.4, p50: 3.2, p97: 4.2 },
      { month: 1, p3: 3.2, p50: 4.2, p97: 5.5 },
      { month: 2, p3: 3.9, p50: 5.1, p97: 6.6 },
      { month: 3, p3: 4.5, p50: 5.8, p97: 7.5 },
      { month: 4, p3: 5.0, p50: 6.4, p97: 8.1 },
      { month: 5, p3: 5.4, p50: 6.9, p97: 8.7 },
      { month: 6, p3: 5.7, p50: 7.3, p97: 9.2 },
      { month: 7, p3: 6.0, p50: 7.6, p97: 9.6 },
      { month: 8, p3: 6.2, p50: 7.9, p97: 10.0 },
      { month: 9, p3: 6.5, p50: 8.2, p97: 10.4 },
      { month: 10, p3: 6.7, p50: 8.5, p97: 10.7 },
      { month: 11, p3: 6.9, p50: 8.7, p97: 11.0 },
      { month: 12, p3: 7.0, p50: 8.9, p97: 11.3 },
      { month: 15, p3: 7.6, p50: 9.6, p97: 12.2 },
      { month: 18, p3: 8.1, p50: 10.2, p97: 13.0 },
      { month: 24, p3: 9.0, p50: 11.5, p97: 14.8 },
    ],
    height: [
      { month: 0, p3: 45.6, p50: 49.1, p97: 52.7 },
      { month: 1, p3: 49.2, p50: 52.8, p97: 56.5 },
      { month: 2, p3: 52.1, p50: 55.7, p97: 59.4 },
      { month: 3, p3: 54.5, p50: 58.1, p97: 61.8 },
      { month: 4, p3: 56.5, p50: 60.1, p97: 63.8 },
      { month: 5, p3: 58.2, p50: 61.8, p97: 65.5 },
      { month: 6, p3: 59.7, p50: 63.3, p97: 67.0 },
      { month: 7, p3: 61.0, p50: 64.7, p97: 68.4 },
      { month: 8, p3: 62.2, p50: 65.9, p97: 69.6 },
      { month: 9, p3: 63.4, p50: 67.1, p97: 70.9 },
      { month: 10, p3: 64.5, p50: 68.2, p97: 72.0 },
      { month: 11, p3: 65.5, p50: 69.3, p97: 73.2 },
      { month: 12, p3: 66.5, p50: 70.3, p97: 74.3 },
      { month: 15, p3: 69.0, p50: 72.9, p97: 77.1 },
      { month: 18, p3: 71.2, p50: 75.3, p97: 79.6 },
      { month: 24, p3: 74.8, p50: 79.3, p97: 84.1 },
    ],
    headCircumference: [
      { month: 0, p3: 31.7, p50: 33.9, p97: 36.1 },
      { month: 1, p3: 34.3, p50: 36.5, p97: 38.8 },
      { month: 2, p3: 36.0, p50: 38.3, p97: 40.5 },
      { month: 3, p3: 37.2, p50: 39.5, p97: 41.9 },
      { month: 4, p3: 38.2, p50: 40.6, p97: 43.0 },
      { month: 5, p3: 39.0, p50: 41.5, p97: 43.9 },
      { month: 6, p3: 39.8, p50: 42.2, p97: 44.7 },
      { month: 7, p3: 40.4, p50: 42.8, p97: 45.3 },
      { month: 8, p3: 40.9, p50: 43.4, p97: 45.9 },
      { month: 9, p3: 41.3, p50: 43.8, p97: 46.4 },
      { month: 10, p3: 41.7, p50: 44.2, p97: 46.8 },
      { month: 11, p3: 42.0, p50: 44.6, p97: 47.1 },
      { month: 12, p3: 42.3, p50: 44.9, p97: 47.5 },
      { month: 15, p3: 43.0, p50: 45.7, p97: 48.3 },
      { month: 18, p3: 43.7, p50: 46.2, p97: 48.8 },
      { month: 21, p3: 44.2, p50: 46.7, p97: 49.3 },
      { month: 24, p3: 44.6, p50: 47.2, p97: 49.8 },
    ],
  },
};

/**
 * 在兩個數據點之間線性插值
 */
function interpolate(a, b, targetMonth) {
  const ratio = (targetMonth - a.month) / (b.month - a.month);
  return {
    p3: a.p3 + (b.p3 - a.p3) * ratio,
    p50: a.p50 + (b.p50 - a.p50) * ratio,
    p97: a.p97 + (b.p97 - a.p97) * ratio,
  };
}

/**
 * 根據性別、類型（weight/height）和月齡獲取參考值
 * @param {'male'|'female'} gender
 * @param {'weight'|'height'|'headCircumference'} type
 * @param {number} month 月齡（小數）
 * @returns {{ p3: number, p50: number, p97: number } | null}
 */
export function getReferenceAtMonth(gender, type, month) {
  const data = STANDARDS[gender]?.[type];
  if (!data || data.length === 0) return null;

  if (month <= data[0].month) return { p3: data[0].p3, p50: data[0].p50, p97: data[0].p97 };
  if (month >= data[data.length - 1].month) {
    const last = data[data.length - 1];
    return { p3: last.p3, p50: last.p50, p97: last.p97 };
  }

  // 找到前後兩個數據點進行插值
  for (let i = 0; i < data.length - 1; i++) {
    if (month >= data[i].month && month < data[i + 1].month) {
      return interpolate(data[i], data[i + 1], month);
    }
  }

  return null;
}

/**
 * 獲取可用性別列表
 */
export function getAvailableGenders() {
  return Object.keys(STANDARDS);
}

export default STANDARDS;
