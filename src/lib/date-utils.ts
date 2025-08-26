// 日本時間（JST）での日付フォーマット用ユーティリティ

const JAPAN_TIMEZONE = 'Asia/Tokyo';

/**
 * ISO文字列を日本時間でフォーマットします
 */
export const formatDateJST = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    timeZone: JAPAN_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * ISO文字列を日本時間での日付のみでフォーマットします
 */
export const formatDateOnlyJST = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    timeZone: JAPAN_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/**
 * ISO文字列を日本時間での時刻のみでフォーマットします
 */
export const formatTimeOnlyJST = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleTimeString('ja-JP', {
    timeZone: JAPAN_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
  });
};

/**
 * ISO文字列を日本時間での詳細な日時でフォーマットします
 */
export const formatDateTimeJST = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return date.toLocaleString('ja-JP', {
    timeZone: JAPAN_TIMEZONE,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * ISO文字列を日本時間での相対時間（〜前）でフォーマットします
 */
export const formatRelativeTimeJST = (dateString?: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  
  // 日本時間での現在時刻を取得
  const japanNow = new Date(now.toLocaleString('en-US', { timeZone: JAPAN_TIMEZONE }));
  const japanDate = new Date(date.toLocaleString('en-US', { timeZone: JAPAN_TIMEZONE }));
  
  const diffInMs = japanNow.getTime() - japanDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMinutes / 60);
  const diffInDays = Math.floor(diffInHours / 24);
  
  if (diffInMinutes < 1) {
    return 'たった今';
  } else if (diffInMinutes < 60) {
    return `${diffInMinutes}分前`;
  } else if (diffInHours < 24) {
    return `${diffInHours}時間前`;
  } else if (diffInDays < 7) {
    return `${diffInDays}日前`;
  } else {
    return formatDateOnlyJST(dateString);
  }
};

/**
 * 現在の日本時間を取得します
 */
export const getCurrentJSTDate = () => {
  return new Date().toLocaleString('ja-JP', { 
    timeZone: JAPAN_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
};

/**
 * 日本時間での今日の日付を YYYY-MM-DD 形式で取得します
 */
export const getTodayJST = () => {
  const now = new Date();
  const japanTime = new Date(now.toLocaleString('en-US', { timeZone: JAPAN_TIMEZONE }));
  
  const year = japanTime.getFullYear();
  const month = String(japanTime.getMonth() + 1).padStart(2, '0');
  const day = String(japanTime.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
};