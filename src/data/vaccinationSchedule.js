// 疫苗時間表數據（香港衞生署）

const vaccines = [
  {
    id: 'v001',
    name: '乙型肝炎疫苗第一針 + 卡介苗',
    age: '出生',
    ageDays: 0,
    diseases: '乙型肝炎、肺結核',
    notes: '出生後盡快接種',
  },
  {
    id: 'v002',
    name: '乙型肝炎疫苗第二針',
    age: '1 個月',
    ageDays: 30,
    diseases: '乙型肝炎',
    notes: '與第一針間隔至少 4 週',
  },
  {
    id: 'v003',
    name: '脊髓灰質炎疫苗第一劑 + 百白破第一劑',
    age: '2 個月',
    ageDays: 60,
    diseases: '脊髓灰質炎、百日咳、白喉、破傷風',
    notes: '',
  },
  {
    id: 'v004',
    name: '脊髓灰質炎疫苗第二劑 + 百白破第二劑',
    age: '4 個月',
    ageDays: 120,
    diseases: '脊髓灰質炎、百日咳、白喉、破傷風',
    notes: '與第三劑間隔至少 4 週',
  },
  {
    id: 'v005',
    name: '脊髓灰質炎疫苗第三劑 + 百白破第三劑',
    age: '6 個月',
    ageDays: 180,
    diseases: '脊髓灰質炎、百日咳、白喉、破傷風',
    notes: '',
  },
  {
    id: 'v006',
    name: '麻疹腮腺炎德國麻疹混合疫苗第一劑 + 水痘疫苗第一劑',
    age: '12 個月',
    ageDays: 365,
    diseases: '麻疹、腮腺炎、德國麻疹、水痘',
    notes: '',
  },
  {
    id: 'v007',
    name: '麻疹腮腺炎德國麻疹混合疫苗第二劑 + 水痘疫苗第二劑',
    age: '18 個月',
    ageDays: 545,
    diseases: '麻疹、腮腺炎、德國麻疹、水痘',
    notes: '與第一劑間隔至少 3 個月',
  },
];

export function getVaccinesByAge(birthDate, completedVaccines = []) {
  if (!birthDate) return vaccines.map(v => ({ ...v, status: 'unknown', dueDate: null }));

  const birth = new Date(birthDate);
  const today = new Date();
  const completedSet = new Set(completedVaccines);

  return vaccines.map(v => {
    const dueDate = new Date(birth);
    dueDate.setDate(dueDate.getDate() + v.ageDays);

    let status;
    if (completedSet.has(v.id)) {
      status = 'completed';
    } else if (dueDate <= today) {
      status = 'overdue';
    } else {
      status = 'upcoming';
    }

    return {
      ...v,
      dueDate: dueDate.toISOString(),
      status,
    };
  });
}

export default vaccines;
