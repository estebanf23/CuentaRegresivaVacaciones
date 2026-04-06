/* =========================================================
   COUNTDOWN LOGIC
   ========================================================= */
(function () {
  'use strict';

  const LS_KEY_DATE  = 'vacaciones_target_date';
  const DEFAULT_DATE = '2026-12-19T06:00:00'; // fallback default

  /* -------------------------------------------------------
     DOM REFS
     ------------------------------------------------------- */
  const elDays    = document.getElementById('cd-days');
  const elHours   = document.getElementById('cd-hours');
  const elMinutes = document.getElementById('cd-minutes');
  const elSeconds = document.getElementById('cd-seconds');
  const elTarget  = document.getElementById('target-date-label');

  let prevValues = { days: -1, hours: -1, minutes: -1, seconds: -1 };
  let celebrated = false;

  /* -------------------------------------------------------
     HELPERS
     ------------------------------------------------------- */
  function pad(n) {
    return String(Math.max(0, n)).padStart(2, '0');
  }

  function getTargetDate() {
    const stored = localStorage.getItem(LS_KEY_DATE);
    return new Date(stored || DEFAULT_DATE);
  }

  function formatDisplayDate(date) {
    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      year:    'numeric',
      month:   'long',
      day:     'numeric',
      hour:    '2-digit',
      minute:  '2-digit'
    });
  }

  function animateFlip(el) {
    el.classList.remove('flip');
    // Force browser reflow to restart the CSS animation from the beginning
    void el.offsetWidth;
    el.classList.add('flip');
  }

  /* -------------------------------------------------------
     UPDATE DISPLAY
     ------------------------------------------------------- */
  function updateCountdown() {
    const target = getTargetDate();
    const now    = new Date();
    const diff   = target - now;

    if (diff <= 0) {
      // Set all to zero
      ['days','hours','minutes','seconds'].forEach(u => {
        const el = document.getElementById(`cd-${u}`);
        if (el) el.textContent = '00';
      });
      if (!celebrated) {
        celebrated = true;
        setTimeout(() => {
          if (typeof window.triggerCelebration === 'function') {
            window.triggerCelebration();
          }
        }, 500);
      }
      return;
    }

    const totalSeconds = Math.floor(diff / 1000);
    const days    = Math.floor(totalSeconds / 86400);
    const hours   = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const vals = { days, hours, minutes, seconds };
    const els  = {
      days:    elDays,
      hours:   elHours,
      minutes: elMinutes,
      seconds: elSeconds
    };

    Object.keys(vals).forEach(key => {
      const el  = els[key];
      const val = vals[key];
      if (!el) return;
      const displayVal = pad(val);
      if (val !== prevValues[key]) {
        animateFlip(el);
        el.textContent = displayVal;
        prevValues[key] = val;
      }
    });
  }

  /* -------------------------------------------------------
     TARGET DATE LABEL
     ------------------------------------------------------- */
  function updateTargetLabel() {
    if (!elTarget) return;
    const target = getTargetDate();
    elTarget.textContent = formatDisplayDate(target);
  }

  /* -------------------------------------------------------
     INIT
     ------------------------------------------------------- */
  function init() {
    updateTargetLabel();
    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Listen for storage changes (admin page updates)
    window.addEventListener('storage', () => {
      updateTargetLabel();
      celebrated = false;
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
