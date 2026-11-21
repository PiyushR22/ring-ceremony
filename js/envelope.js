/**
 * ============================================================================
 * js/envelope.js - 3D Envelope Opening, Wax Seal Break, Keyboard Accessibility
 * ============================================================================
 */

(function () {
  function initEnvelope() {
    const trigger = document.getElementById('envelopeTrigger');
    const shell = document.getElementById('envelopeShell');
    const stage = document.getElementById('envelopeStage');
    const scaffold = document.getElementById('invitationScaffold');
    let isOpened = false;

    function openEnvelope() {
      if (isOpened) return;
      isOpened = true;

      // 1. Trigger flap 3D rotate and wax seal fade
      shell.classList.add('is-opening');

      // 2. Transition from envelope view to full editorial card
      setTimeout(() => {
        stage.classList.add('is-hidden');
        scaffold.classList.add('is-revealed');
        scaffold.setAttribute('aria-hidden', 'false');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }, 1150);
    }

    if (trigger) {
      trigger.addEventListener('click', openEnvelope);
      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openEnvelope();
        }
      });
    }
  }

  document.addEventListener('DOMContentLoaded', initEnvelope);
})();
