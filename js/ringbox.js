/**
 * ============================================================================
 * js/ringbox.js - Realistic 3D Hinged Velvet Ring Box Opening & Replay
 * Controlled cleanly via CSS state classes (.is-open, .is-hidden, .is-revealed)
 * GPU accelerated, accessible keyboard triggers (Enter / Space), reduced-motion fallback.
 * ============================================================================
 */

(function () {
  function initRingBox() {
    const trigger = document.getElementById('boxTrigger');
    const stage = document.getElementById('boxStage');
    const lidLayer = document.getElementById('lid');
    const scaffold = document.getElementById('invitationScaffold');
    const replayBtn = document.getElementById('replayPill');
    let isOpen = false;

    // Detect prefers-reduced-motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // 1. Open the Ring Box Experience
    function openRingBox() {
      if (isOpen) return;
      isOpen = true;

      // Enable will-change on lid only while animating for peak 60fps GPU performance
      if (lidLayer && !prefersReducedMotion) {
        lidLayer.style.willChange = 'transform';
      }

      // Add .is-open: triggers box tilt, 3D lid hinge (-115deg), satin lining reveal,
      // diamond sparkle flash/twinkle, warm light beam & rising rose gold sparkles
      stage.classList.add('is-open');

      // Snappy, continuous transition without dead pauses:
      // At ~750ms, the lid is open, diamond has flashed, and the invitation card seamlessly expands
      const transitionDelay = prefersReducedMotion ? 250 : 750;

      setTimeout(() => {
        // Clear will-change after animation completes
        if (lidLayer) {
          lidLayer.style.willChange = 'auto';
        }

        stage.classList.add('is-hidden');
        scaffold.classList.add('is-revealed');
        scaffold.setAttribute('aria-hidden', 'false');
        window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });

        // Show Replay floating pill in corner
        if (replayBtn) {
          replayBtn.classList.add('is-active');
        }
      }, transitionDelay);
    }

    // 2. Replay intro: Reset back to closed floating velvet ring box
    function replayExperience() {
      if (!isOpen) return;
      isOpen = false;

      // Scroll to top instantly
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Hide invitation card and replay button
      scaffold.classList.remove('is-revealed');
      scaffold.setAttribute('aria-hidden', 'true');
      if (replayBtn) replayBtn.classList.remove('is-active');

      // Clear will-change
      if (lidLayer) lidLayer.style.willChange = 'auto';

      // Reset box stage back to closed floating state
      stage.classList.remove('is-hidden');
      stage.classList.remove('is-open');
    }

    // Event Listeners: Click & Touch
    if (trigger) {
      trigger.addEventListener('click', openRingBox);
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openRingBox();
        }
      });
    }

    // Also support clicking the "Tap to open" prompt directly
    const openPrompt = document.getElementById('openPrompt');
    if (openPrompt) {
      openPrompt.addEventListener('click', openRingBox);
    }

    // Replay floating button listener
    if (replayBtn) {
      replayBtn.addEventListener('click', replayExperience);
    }
  }

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRingBox);
  } else {
    initRingBox();
  }
})();
