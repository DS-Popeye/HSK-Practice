const CURRENT_USER_KEY = 'hsk_current_user';
const USERS_KEY = 'hsk_users';

export const STORAGE_KEYS = {
  learnedWords: 'learned_words',
  flashcards: 'flashcard_progress',
  quizHistory: 'quiz_history',
  quizHardWords: 'quiz_hard_words',
  mockHistory: 'mock_history',
  grammarStudied: 'grammar_studied'
};

function normalizeName(username) {
  return String(username || '').trim().replace(/\s+/g, ' ');
}

function normalizeUsernameKey(username) {
  return normalizeName(username).toLowerCase();
}

export function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    localStorage.removeItem(key);
    return fallback;
  }
}

export function writeStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage can fail in private browsing or when quota is full; keep the UI alive.
  }
}

export function getCurrentUser() {
  const user = readStorage(CURRENT_USER_KEY, null);
  return user?.usernameKey ? user : null;
}

export function getUsers() {
  const users = readStorage(USERS_KEY, []);
  return Array.isArray(users) ? users : [];
}

export function setCurrentUser(username) {
  const displayName = normalizeName(username);
  const usernameKey = normalizeUsernameKey(displayName);

  if (usernameKey.length < 2) {
    throw new Error('Username must be at least 2 characters.');
  }

  const now = new Date().toISOString();
  const currentUser = {
    usernameKey,
    displayName,
    loginAt: now
  };

  const users = getUsers();
  const existing = users.find((user) => user.usernameKey === usernameKey);
  const nextUsers = existing
    ? users.map((user) => user.usernameKey === usernameKey
      ? { ...user, displayName, lastLoginAt: now }
      : user)
    : [...users, { usernameKey, displayName, createdAt: now, lastLoginAt: now }];

  writeStorage(USERS_KEY, nextUsers);
  writeStorage(CURRENT_USER_KEY, currentUser);
  return currentUser;
}

export function logoutCurrentUser() {
  localStorage.removeItem(CURRENT_USER_KEY);
}

export function getUserStorageKey(baseKey) {
  const user = getCurrentUser();
  if (!user?.usernameKey) return null;
  return `hsk:${user.usernameKey}:${baseKey}`;
}

export function getUserData(baseKey, fallback) {
  const key = getUserStorageKey(baseKey);
  if (!key) return fallback;
  return readStorage(key, fallback);
}

export function setUserData(baseKey, value) {
  const key = getUserStorageKey(baseKey);
  if (!key) return;
  writeStorage(key, value);
}

export function removeUserData(baseKey) {
  const key = getUserStorageKey(baseKey);
  if (key) localStorage.removeItem(key);
}

export function toggleUserListItem(baseKey, id) {
  const current = getUserData(baseKey, []);
  const safeCurrent = Array.isArray(current) ? current : [];
  const textId = String(id);
  const next = safeCurrent.includes(textId)
    ? safeCurrent.filter((item) => item !== textId)
    : [...safeCurrent, textId];
  setUserData(baseKey, next);
  return next;
}

export function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Unknown date';

  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
}
