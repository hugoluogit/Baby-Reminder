// 版本檢查工具 — 比對 App Store（iTunes API）最新版本

import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY = '@version_check_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 小時
const BUNDLE_ID = 'com.babyreminder.app';

/**
 * 從 App Store（iTunes API）獲取最新版本
 * @returns {Promise<string|null>} 最新版本號，失敗回 null
 */
async function fetchLatestVersion() {
  try {
    const res = await fetch(`https://itunes.apple.com/lookup?bundleId=${BUNDLE_ID}`);
    if (!res.ok) return null;
    const data = await res.json();
    // 若 App 尚未在 App Store 上架，results 為空陣列
    if (!data.results || data.results.length === 0) return null;
    return data.results[0].version || null;
  } catch {
    return null;
  }
}

/**
 * 比較兩個 semver 版本號
 */
function needsUpdate(current, latest) {
  if (!latest) return false;
  const cur = current.split('.').map(Number);
  const lat = latest.split('.').map(Number);
  for (let i = 0; i < 3; i++) {
    if ((lat[i] || 0) > (cur[i] || 0)) return true;
    if ((lat[i] || 0) < (cur[i] || 0)) return false;
  }
  return false;
}

/**
 * 執行版本檢查
 * @param {string} currentVersion 當前版本號
 * @returns {Promise<{needsUpdate: boolean, latestVersion: string|null}>}
 */
export async function checkVersion(currentVersion) {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const { timestamp, latestVersion } = JSON.parse(cached);
      if (Date.now() - timestamp < CACHE_TTL) {
        return { needsUpdate: needsUpdate(currentVersion, latestVersion), latestVersion };
      }
    }

    const latestVersion = await fetchLatestVersion();
    if (latestVersion) {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify({
        latestVersion,
        timestamp: Date.now(),
      }));
    }

    return { needsUpdate: needsUpdate(currentVersion, latestVersion), latestVersion };
  } catch {
    return { needsUpdate: false, latestVersion: null };
  }
}

export async function clearVersionCache() {
  await AsyncStorage.removeItem(CACHE_KEY);
}
