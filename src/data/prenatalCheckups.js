// 產檢時間表數據（香港衞生署）

const checkups = [
  {
    id: 'p001',
    name: '首次產檢',
    weeks: '8-12 週',
    weekStart: 8,
    weekEnd: 12,
    items: '驗孕確認、計算預產期、血液檢查、尿液檢查、血壓測量、身體檢查',
    notes: '建議在懷孕 8-12 週內進行首次產檢',
    importance: '高',
  },
  {
    id: 'p002',
    name: '唐氏綜合症篩查',
    weeks: '16-20 週',
    weekStart: 16,
    weekEnd: 20,
    items: '唐氏綜合症血清篩查、超聲波檢查',
    notes: '建議在 16-20 週內完成篩查',
    importance: '高',
  },
  {
    id: 'p003',
    name: '結構性超聲波檢查',
    weeks: '20-24 週',
    weekStart: 20,
    weekEnd: 24,
    items: '詳細結構性超聲波檢查、胎兒器官發育評估',
    notes: '全面檢查胎兒器官結構發育情況',
    importance: '高',
  },
  {
    id: 'p004',
    name: '妊娠糖尿病篩查',
    weeks: '24-28 週',
    weekStart: 24,
    weekEnd: 28,
    items: '口服葡萄糖耐量測試',
    notes: '檢查前需空腹 8-10 小時',
    importance: '中',
  },
  {
    id: 'p005',
    name: '常規產檢',
    weeks: '28-32 週',
    weekStart: 28,
    weekEnd: 32,
    items: '血壓測量、尿液檢查、體重測量、胎兒心跳監測',
    notes: '常規產檢，監測母親和胎兒健康狀況',
    importance: '中',
  },
  {
    id: 'p006',
    name: '常規產檢',
    weeks: '32-36 週',
    weekStart: 32,
    weekEnd: 36,
    items: '血壓測量、尿液檢查、體位檢查、胎兒生長評估',
    notes: '監測胎位和胎兒生長情況',
    importance: '中',
  },
  {
    id: 'p007',
    name: '每週產檢',
    weeks: '36-40 週',
    weekStart: 36,
    weekEnd: 40,
    items: '血壓測量、尿液檢查、子宮頸檢查、胎兒心跳監測',
    notes: '從 36 週開始每週檢查一次，直至分娩',
    importance: '高',
  },
];

export function getCheckupsByWeek(pregnancyWeek, completedCheckups = []) {
  const completedSet = new Set(completedCheckups);

  return checkups.map(c => {
    let status;
    if (completedSet.has(c.id)) {
      status = 'completed';
    } else if (pregnancyWeek > c.weekEnd) {
      status = 'overdue';
    } else if (pregnancyWeek >= c.weekStart) {
      status = 'current';
    } else {
      status = 'upcoming';
    }

    let progress = 0;
    if (pregnancyWeek >= c.weekEnd) {
      progress = 100;
    } else if (pregnancyWeek <= c.weekStart) {
      progress = 0;
    } else {
      progress = Math.round(((pregnancyWeek - c.weekStart) / (c.weekEnd - c.weekStart)) * 100);
    }

    return { ...c, status, progress };
  });
}

export function calculatePregnancyWeek(dueDate) {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  // 懷孕約 40 週 = 280 天
  const gestationDays = 280;
  const daysSinceDue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  const daysPregnant = gestationDays + daysSinceDue;
  const weeks = Math.floor(daysPregnant / 7);
  return Math.max(0, Math.min(42, weeks));
}

export default checkups;
