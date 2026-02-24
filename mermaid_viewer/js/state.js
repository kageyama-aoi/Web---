import { STORAGE_KEYS } from './constants.js';

export function isSandboxed() {
  try {
    return location.href.startsWith('about:') || document.baseURI.startsWith('about:') || location.origin === 'null';
  } catch { return true; }
}

export function canUseHistory() { return !isSandboxed() && !!(history && history.replaceState); }

export function canUseHash() { return !isSandboxed(); }

export function encodeCode(str) { return btoa(unescape(encodeURIComponent(str))); }

export function decodeCode(str) { try { return decodeURIComponent(escape(atob(str))); } catch { return ''; } }

export function saveState({ code, theme, scheme }) {
  if (code !== undefined) localStorage.setItem(STORAGE_KEYS.CODE, code);
  if (theme !== undefined) localStorage.setItem(STORAGE_KEYS.THEME, theme);
  if (scheme !== undefined) localStorage.setItem(STORAGE_KEYS.SCHEME, scheme);
}

export function loadState() {
  return {
    code: localStorage.getItem(STORAGE_KEYS.CODE),
    theme: localStorage.getItem(STORAGE_KEYS.THEME),
    scheme: localStorage.getItem(STORAGE_KEYS.SCHEME),
  };
}

export function updateShareState(code) {
  const hash = 'code=' + encodeURIComponent(encodeCode(code));
  try {
    if (canUseHistory()) {
      const url = new URL(location.href);
      url.hash = hash;
      history.replaceState(null, '', url);
      return { ok: true, method: 'history' };
    }
  } catch (e) { console.warn('replaceState failed', e); }
  try {
    if (canUseHash()) {
      location.hash = hash;
      return { ok: true, method: 'hash' };
    }
  } catch (e) { console.warn('location.hash failed', e); }
  return { ok: false };
}

export function loadFromHash() {
  if (isSandboxed()) return '';
  const m = location.hash.match(/code=([^&]+)/);
  if (!m) return '';
  return decodeCode(decodeURIComponent(m[1]));
}
