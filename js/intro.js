/**
 * ============================================================================
 * js/intro.js - Cinematic Portal Entry Sequence
 * Interlocking rings, gold lens separation, flare burst, audio fade-in.
 * ============================================================================
 */

(function () {
  function initIntro() {
    const portal = document.getElementById('introPortal');
    const trigger = document.getElementById('introTrigger');
    let hasEntered = false;

    if (!portal || !trigger) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    function enterInvitation() {
      if (hasEntered) return;
      hasEntered = true;

      // Start audio ambient chimes if available
      if (window.LuxuryAudio && typeof window.LuxuryAudio.startAudio === 'function') {
        window.LuxuryAudio.startAudio();
      }

      // Ensure Chapter 1 is marked in view immediately on portal dissolve
      const cover = document.getElementById('chapter-cover');
      if (cover) cover.classList.add('is-in-view');

      if (prefersReducedMotion) {
        portal.classList.add('is-dissolved');
        return;
      }

      // Step 1: Lens separation & warm center flare
      portal.classList.add('is-opening');

      // Step 2: Dissolve portal and reveal Chapter 1
      setTimeout(() => {
        portal.classList.add('is-dissolved');
      }, 1100);
    }

    trigger.addEventListener('click', enterInvitation);
    portal.addEventListener('click', (e) => {
      // Allow clicking anywhere on the portal backdrop
      enterInvitation();
    });

    trigger.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        enterInvitation();
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initIntro);
  } else {
    initIntro();
  }
})();
