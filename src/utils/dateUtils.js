// 日期工具函數

export function calculateBabyAge(birthDate) {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();

  let years = today.getFullYear() - birth.getFullYear();
  let months = today.getMonth() - birth.getMonth();
  let days = today.getDate() - birth.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(today.getFullYear(), today.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) {
    return `${years} 歲 ${months} 個月`;
  }
  if (months > 0) {
    return `${months} 個月 ${days} 天`;
  }
  return `${days} 天`;
}

export function calculatePregnancyWeek(dueDate) {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const today = new Date();
  const gestationDays = 280;
  const daysSinceDue = Math.floor((today - due) / (1000 * 60 * 60 * 24));
  const daysPregnant = gestationDays + daysSinceDue;
  const weeks = Math.floor(daysPregnant / 7);
  return Math.max(0, Math.min(42, weeks));
}

export function formatDateChinese(date) {
  if (!date) return '';
  const d = new Date(date);
  const year = d.getFullYear();
  const month = d.getMonth() + 1;
  const day = d.getDate();
  return `${year} 年 ${month} 月 ${day} 日`;
}

export function formatDateShort(date) {
  if (!date) return '';
  const d = new Date(date);
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${month}/${day}`;
}

/**
 * 計算 targetDate 時的年齡（月齡，精確到小數）
 * @param {string|Date} birthDate 出生日期
 * @param {string|Date} targetDate 目標日期
 * @returns {number} 月齡，例如 3.5 = 3個月15天
 */
export function calculateAgeInMonths(birthDate, targetDate) {
  if (!birthDate || !targetDate) return 0;
  const birth = new Date(birthDate);
  const target = new Date(targetDate);
  const diffMs = target - birth;
  if (diffMs <= 0) return 0;
  // 以平均每月 30.4375 天計算
  return diffMs / (1000 * 60 * 60 * 24 * 30.4375);
}
