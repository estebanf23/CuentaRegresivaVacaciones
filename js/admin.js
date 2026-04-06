/* =========================================================
   ADMIN PAGE LOGIC
   ========================================================= */
(function () {
  'use strict';

  const LS_KEY_DATE = 'vacaciones_target_date';
  /* Admin password — stored as a simple hash for minimal security.
     The default password is: vacaciones2025
     SHA-256 of "vacaciones2025" = pre-computed below.
     Users can change it via the Change Password section.     */
  const LS_KEY_HASH = 'admin_pw_hash';
  const DEFAULT_HASH = '9d38a98da026a5a7e3cc8c0e50fc95fce71d5a8a5b1e1d0d7e4c2e1f6b3a9c4'; // placeholder — computed at runtime

  /* -------------------------------------------------------
     Simple hash function (SHA-256 via SubtleCrypto)
     ------------------------------------------------------- */
  async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /* Default password hash — "vacaciones2025" */
  const DEFAULT_PASSWORD = 'vacaciones2025';

  async function getStoredHash() {
    let stored = localStorage.getItem(LS_KEY_HASH);
    if (!stored) {
      stored = await sha256(DEFAULT_PASSWORD);
      localStorage.setItem(LS_KEY_HASH, stored);
    }
    return stored;
  }

  /* -------------------------------------------------------
     DOM REFS
     ------------------------------------------------------- */
  const loginSection  = document.getElementById('login-section');
  const configSection = document.getElementById('config-section');
  const loginForm     = document.getElementById('login-form');
  const configForm    = document.getElementById('config-form');
  const pwdInput      = document.getElementById('admin-password');
  const loginMsg      = document.getElementById('login-msg');
  const configMsg     = document.getElementById('config-msg');
  const dateInput     = document.getElementById('target-datetime');
  const currentLabel  = document.getElementById('current-date-label');
  const logoutBtn     = document.getElementById('logout-btn');
  const togglePwBtns  = document.querySelectorAll('.toggle-pw');

  /* Change password section */
  const changePwForm    = document.getElementById('change-pw-form');
  const newPwInput      = document.getElementById('new-password');
  const confirmPwInput  = document.getElementById('confirm-password');
  const changePwMsg     = document.getElementById('changepw-msg');

  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */
  function showSection(section) {
    loginSection.classList.add('hidden');
    configSection.classList.add('hidden');
    section.classList.remove('hidden');
  }

  function showMsg(el, text, type) {
    if (!el) return;
    el.textContent = text;
    el.className = `msg ${type}`;
  }

  function getStoredDate() {
    return localStorage.getItem(LS_KEY_DATE) || '';
  }

  function toDatetimeLocalValue(isoOrDate) {
    if (!isoOrDate) return '';
    const d = new Date(isoOrDate);
    if (isNaN(d)) return '';
    // datetime-local expects "YYYY-MM-DDTHH:MM"
    const pad = n => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function formatDisplay(isoOrDate) {
    if (!isoOrDate) return '—';
    const d = new Date(isoOrDate);
    if (isNaN(d)) return '—';
    return d.toLocaleDateString('es-ES', {
      weekday: 'long', year: 'numeric', month: 'long',
      day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  }

  function populateConfig() {
    const stored = getStoredDate();
    if (dateInput) dateInput.value = toDatetimeLocalValue(stored);
    if (currentLabel) currentLabel.textContent = formatDisplay(stored);
  }

  /* -------------------------------------------------------
     LOGIN
     ------------------------------------------------------- */
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const input    = pwdInput ? pwdInput.value : '';
      const inputHash = await sha256(input);
      const stored    = await getStoredHash();

      if (inputHash === stored) {
        if (loginMsg) loginMsg.className = 'msg'; // hide
        populateConfig();
        showSection(configSection);
      } else {
        showMsg(loginMsg, '⚠ Contraseña incorrecta. Intenta de nuevo.', 'error');
        if (pwdInput) pwdInput.value = '';
        if (pwdInput) pwdInput.focus();
      }
    });
  }

  /* -------------------------------------------------------
     CONFIG — SAVE DATE
     ------------------------------------------------------- */
  if (configForm) {
    configForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = dateInput ? dateInput.value : '';
      if (!val) {
        showMsg(configMsg, '⚠ Por favor selecciona una fecha y hora válida.', 'error');
        return;
      }
      const date = new Date(val);
      if (isNaN(date)) {
        showMsg(configMsg, '⚠ Fecha inválida.', 'error');
        return;
      }
      if (date <= new Date()) {
        showMsg(configMsg, '⚠ La fecha debe ser en el futuro.', 'error');
        return;
      }
      localStorage.setItem(LS_KEY_DATE, date.toISOString());
      if (currentLabel) currentLabel.textContent = formatDisplay(date);
      showMsg(configMsg, '✅ Fecha guardada correctamente. La cuenta regresiva ha sido actualizada.', 'success');
    });
  }

  /* -------------------------------------------------------
     CHANGE PASSWORD
     ------------------------------------------------------- */
  if (changePwForm) {
    changePwForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const newPw     = newPwInput     ? newPwInput.value     : '';
      const confirmPw = confirmPwInput ? confirmPwInput.value : '';

      if (newPw.length < 6) {
        showMsg(changePwMsg, '⚠ La contraseña debe tener al menos 6 caracteres.', 'error');
        return;
      }
      if (newPw !== confirmPw) {
        showMsg(changePwMsg, '⚠ Las contraseñas no coinciden.', 'error');
        return;
      }
      const newHash = await sha256(newPw);
      localStorage.setItem(LS_KEY_HASH, newHash);
      if (newPwInput)     newPwInput.value     = '';
      if (confirmPwInput) confirmPwInput.value = '';
      showMsg(changePwMsg, '✅ Contraseña actualizada correctamente.', 'success');
    });
  }

  /* -------------------------------------------------------
     LOGOUT
     ------------------------------------------------------- */
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      showSection(loginSection);
      if (pwdInput) pwdInput.value = '';
      if (loginMsg) loginMsg.className = 'msg';
    });
  }

  /* -------------------------------------------------------
     PASSWORD VISIBILITY TOGGLE
     ------------------------------------------------------- */
  togglePwBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const inputId = btn.dataset.for;
      const input   = document.getElementById(inputId);
      if (!input) return;
      if (input.type === 'password') {
        input.type = 'text';
        btn.textContent = '🙈';
      } else {
        input.type = 'password';
        btn.textContent = '👁';
      }
    });
  });

  /* -------------------------------------------------------
     INIT — initialize default hash on first visit
     ------------------------------------------------------- */
  async function init() {
    await getStoredHash(); // ensure default hash is stored
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
