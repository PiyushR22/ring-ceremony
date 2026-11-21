/**
 * ============================================================================
 * js/i18n.js - Multilingual Localization Engine (English & Hindi)
 * Dynamically binds texts from CONFIG.i18n and manages user language choice.
 * ============================================================================
 */

(function () {
  let currentLang = localStorage.getItem('luxury_lang') || 'en';

  function applyLanguage(lang) {
    currentLang = lang;
    localStorage.setItem('luxury_lang', lang);
    const dict = CONFIG.i18n[lang] || CONFIG.i18n.en;

    document.documentElement.lang = lang;

    // Update Language Toggle Pill Label
    const langBtnLabel = document.getElementById('langToggleLabel');
    if (langBtnLabel) {
      langBtnLabel.textContent = lang === 'en' ? 'EN / हिंदी' : 'हिंदी / EN';
    }

    // Update all elements with data-i18n key
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (dict[key]) {
        el.textContent = dict[key];
      }
    });

    // Update Timeline List with Localized Titles
    const timelineListEl = document.getElementById('programmeTimelineList');
    if (timelineListEl && CONFIG.timeline) {
      timelineListEl.innerHTML = CONFIG.timeline.map((item, idx) => `
        <div class="timeline-node-item reveal-item delay-${idx + 1}">
          <div class="timeline-node-ring" aria-hidden="true"></div>
          <span class="timeline-time-caps">${item.time}</span>
          <span class="timeline-event-title">${lang === 'hi' ? item.titleHi : item.titleEn}</span>
        </div>
      `).join('');
    }

    // Update Localized Couple Names
    const coverBride = document.getElementById('coverBride');
    if (coverBride) coverBride.textContent = lang === 'hi' ? CONFIG.brideNameHi : CONFIG.brideName;
    const coverGroom = document.getElementById('coverGroom');
    if (coverGroom) coverGroom.textContent = lang === 'hi' ? CONFIG.groomNameHi : CONFIG.groomName;

    const headlineCouple = document.getElementById('invitationCoupleHeadline');
    if (headlineCouple) {
      headlineCouple.textContent = lang === 'hi' 
        ? `${CONFIG.brideNameHi} एवं ${CONFIG.groomNameHi}` 
        : `${CONFIG.brideName} & ${CONFIG.groomName}`;
    }

    const archScript = document.getElementById('archCoupleScript');
    if (archScript) {
      if (lang === 'hi') {
        archScript.innerHTML = `<span class="arch-bride">${CONFIG.brideNameHi}</span> <span class="arch-amp">एवं</span> <span class="arch-groom">${CONFIG.groomNameHi}</span>`;
      } else {
        archScript.innerHTML = `<span class="arch-bride">${CONFIG.brideName}</span> <span class="arch-amp">&amp;</span> <span class="arch-groom">${CONFIG.groomName}</span>`;
      }
    }

    // Update Personalized Guest Salutation if no custom ?to= param
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to');
    const salutationEl = document.getElementById('guestSalutation');
    if (salutationEl && (!guestParam || guestParam.trim().length === 0)) {
      salutationEl.textContent = dict.salutationDefault;
    }
  }

  function initI18n() {
    const langToggleBtn = document.getElementById('langToggle');
    if (langToggleBtn) {
      langToggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        const nextLang = currentLang === 'en' ? 'hi' : 'en';
        applyLanguage(nextLang);
      });
    }

    // Populate initial language
    applyLanguage(currentLang);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initI18n);
  } else {
    initI18n();
  }
})();
