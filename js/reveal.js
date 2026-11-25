/**
 * ============================================================================
 * js/reveal.js - IntersectionObserver Scroll Reveal & Guest Personalization
 * Reads URL ?to=Guest+Name and injects safely via textContent (no innerHTML).
 * ============================================================================
 */

(function () {
  function initRevealAndPersonalization() {
    // 1. Personalized Guest Salutation from URL query ?to=
    const urlParams = new URLSearchParams(window.location.search);
    const guestParam = urlParams.get('to');
    const salutationEl = document.getElementById('guestSalutation');

    if (salutationEl) {
      const currentLang = localStorage.getItem('luxury_lang') || 'en';
      if (guestParam && guestParam.trim().length > 0) {
        salutationEl.textContent = currentLang === 'hi' 
          ? `सादर ${guestParam.trim()},` 
          : `Dear ${guestParam.trim()},`;
      } else {
        salutationEl.textContent = CONFIG.i18n[currentLang]?.salutationDefault || CONFIG.i18n.en.salutationDefault;
      }
    }

    // 2. IntersectionObserver for Chapter Sections & Elements
    const sections = document.querySelectorAll('.chapter-section');
    if (!('IntersectionObserver' in window)) {
      sections.forEach(s => s.classList.add('is-in-view'));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in-view');
        }
      });
    }, {
      root: null,
      threshold: 0.05
    });

    sections.forEach(section => observer.observe(section));
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAndPersonalization);
  } else {
    initRevealAndPersonalization();
  }
})();
