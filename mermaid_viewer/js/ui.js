import { STORAGE_KEYS } from './constants.js';

let _statusTimer;
export function setStatus(el, msg) {
  clearTimeout(_statusTimer);
  el.classList.remove('fade-out');
  el.textContent = msg || '';
  if (msg) {
    _statusTimer = setTimeout(() => {
      el.classList.add('fade-out');
      setTimeout(() => {
        el.textContent = '';
        el.classList.remove('fade-out');
      }, 400);
    }, 3000);
  }
}

export function showError(el, err) { el.textContent = (err && (err.str || err.message)) || String(err); }

export function clearError(el) { el.textContent = ''; }

export function applyScheme(scheme) {
  const root = document.documentElement;
  if (scheme === 'auto') {
    root.removeAttribute('data-scheme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    root.setAttribute('data-scheme', prefersDark ? 'dark' : 'light');
  } else {
    root.setAttribute('data-scheme', scheme);
  }
  localStorage.setItem(STORAGE_KEYS.SCHEME, scheme);
}

export function populateSamplesDropdown(selectEl, { SAMPLES, SAMPLE_LABELS, SAMPLE_ORDER }) {
  SAMPLE_ORDER.forEach(key => {
    if (!SAMPLES[key]) return;
    const option = document.createElement('option');
    option.value = key;
    option.textContent = SAMPLE_LABELS[key] || key;
    selectEl.appendChild(option);
  });
}
