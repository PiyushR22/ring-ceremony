/**
 * ============================================================================
 * js/actions.js - Action Integrations: Calendar (.ICS), Maps, WhatsApp, Share & Audio
 * ============================================================================
 */

(function () {
  // Audio state
  let audioCtx = null;
  let isAudioPlaying = false;
  let isAudioMuted = localStorage.getItem('luxury_audio_muted') === 'true';

  // Pentatonic chime scale (Yaman/Kalyan ragam notes for royal Indian luxury)
  const CHIME_FREQS = [293.66, 329.63, 369.99, 440.00, 493.88, 587.33, 659.25];

  function playAmbientChime() {
    if (!audioCtx || audioCtx.state !== 'running' || isAudioMuted) return;

    try {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      const freq = CHIME_FREQS[Math.floor(Math.random() * CHIME_FREQS.length)];

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

      gain.gain.setValueAtTime(0.0001, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, audioCtx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 3.2);

      osc.connect(gain);
      gain.connect(audioCtx.destination);

      osc.start();
      osc.stop(audioCtx.currentTime + 3.3);
    } catch (e) {
      // Audio fallback catch
    }
  }

  function startAudio() {
    if (isAudioPlaying || isAudioMuted) return;
    try {
      const AudioClass = window.AudioContext || window.webkitAudioContext;
      if (!audioCtx) audioCtx = new AudioClass();
      if (audioCtx.state === 'suspended') audioCtx.resume();
      isAudioPlaying = true;

      // Play soft initial chime chord
      playAmbientChime();
      setTimeout(playAmbientChime, 450);

      // Periodic subtle luxury ambient chime
      setInterval(() => {
        if (Math.random() > 0.4) playAmbientChime();
      }, 5500);
    } catch (e) {
      // Audio error catch
    }
  }

  // Expose to window for intro trigger
  window.LuxuryAudio = {
    startAudio: startAudio
  };

  function setupActions() {
    // 1. Audio Toggle Button
    const audioBtn = document.getElementById('audioToggle');
    const audioLabel = document.getElementById('audioToggleLabel');

    function updateAudioUI() {
      if (audioLabel) {
        audioLabel.textContent = isAudioMuted ? "Sound: Off" : "Sound: On";
      }
    }
    updateAudioUI();

    if (audioBtn) {
      audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        isAudioMuted = !isAudioMuted;
        localStorage.setItem('luxury_audio_muted', String(isAudioMuted));
        updateAudioUI();

        if (!isAudioMuted && !isAudioPlaying) {
          startAudio();
        }
      });
    }

    // 2. Google Maps Navigation Links
    const mapBtns = document.querySelectorAll('.action-btn-maps');
    mapBtns.forEach(btn => {
      btn.href = CONFIG.googleMapsUrl;
      btn.target = "_blank";
      btn.rel = "noopener noreferrer";
    });

    // 3. Add to Calendar (.ICS Generator)
    const calBtn = document.getElementById('btnAddToCalendar');
    if (calBtn) {
      calBtn.addEventListener('click', () => {
        const start = new Date(CONFIG.eventDateTimeISO);
        const end = new Date(start.getTime() + (4 * 60 * 60 * 1000)); // 4 hours duration (01:00 PM to 05:00 PM)

        const formatICS = (d) => d.toISOString().replace(/-|:|\.\d+/g, '');
        const summary = `Ring Ceremony • ${CONFIG.brideName} & ${CONFIG.groomName}`;
        const desc = `You are cordially invited to celebrate the Ring Ceremony of ${CONFIG.brideName} and ${CONFIG.groomName}. Venue: ${CONFIG.venueName}, ${CONFIG.venueAddress}.`;
        const location = `${CONFIG.venueName}, ${CONFIG.venueAddress}`;

        const icsContent = [
          'BEGIN:VCALENDAR',
          'VERSION:2.0',
          'PRODID:-//Midnight Gold//Ring Ceremony//EN',
          'METHOD:PUBLISH',
          'BEGIN:VEVENT',
          `UID:${Date.now()}@ringceremony.royal`,
          `DTSTAMP:${formatICS(new Date())}`,
          `DTSTART:${formatICS(start)}`,
          `DTEND:${formatICS(end)}`,
          `SUMMARY:${summary}`,
          `DESCRIPTION:${desc}`,
          `LOCATION:${location}`,
          'STATUS:CONFIRMED',
          'END:VEVENT',
          'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `Ring-Ceremony-${CONFIG.brideName}-${CONFIG.groomName}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }

    // 5. Share Invitation (Web Share API with Copy Link Fallback)
    const shareBtn = document.getElementById('btnShareInvite');
    const toast = document.getElementById('luxuryToast');

    function showToast(msg) {
      if (!toast) return;
      toast.textContent = msg;
      toast.classList.add('is-visible');
      setTimeout(() => {
        toast.classList.remove('is-visible');
      }, 3500);
    }

    if (shareBtn) {
      shareBtn.addEventListener('click', async () => {
        const shareData = {
          title: `Ring Ceremony • ${CONFIG.brideName} & ${CONFIG.groomName}`,
          text: `You are cordially invited to the Ring Ceremony of ${CONFIG.brideName} & ${CONFIG.groomName} at ${CONFIG.venueName}, Jabalpur.`,
          url: window.location.href
        };

        if (navigator.share) {
          try {
            await navigator.share(shareData);
          } catch (err) {
            // User cancelled or share dismissed
          }
        } else {
          // Fallback to Clipboard copy
          try {
            await navigator.clipboard.writeText(window.location.href);
            const currentLang = localStorage.getItem('luxury_lang') || 'en';
            showToast(CONFIG.i18n[currentLang].linkCopiedToast);
          } catch (err) {
            showToast("Link: " + window.location.href);
          }
        }
      });
    }

    // 6. Ambient Floating Gold Sparkles (Capped at 6 mobile / 15 desktop)
    initAmbientSparkles();
  }

  /**
   * Ambient Floating Gold Sparkles
   * Mobile (< 768px): Capped at 6 sparkles
   * Desktop (>= 768px): Capped at 15 sparkles
   * Respects prefers-reduced-motion
   */
  function initAmbientSparkles() {
    const canvas = document.getElementById('ambientSparklesCanvas');
    if (!canvas) return;

    const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      canvas.style.display = 'none';
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let particles = [];
    let animId = null;

    function resize() {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      const maxCount = window.innerWidth < 768 ? 6 : 15;

      while (particles.length > maxCount) particles.pop();
      while (particles.length < maxCount) {
        particles.push(createParticle(true));
      }
    }

    function createParticle(randomY) {
      return {
        x: Math.random() * (width || window.innerWidth),
        y: randomY ? Math.random() * (height || window.innerHeight) : (height || window.innerHeight) + 10,
        radius: Math.random() * 1.5 + 0.8,
        alpha: Math.random() * 0.4 + 0.2,
        twinkleSpeed: Math.random() * 0.02 + 0.01,
        twinkleDir: Math.random() > 0.5 ? 1 : -1,
        speedY: -(Math.random() * 0.35 + 0.15),
        speedX: (Math.random() - 0.5) * 0.2
      };
    }

    function updateAndDraw() {
      if (document.hidden) {
        animId = requestAnimationFrame(updateAndDraw);
        return;
      }

      ctx.clearRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += p.speedY;
        p.x += p.speedX;
        p.alpha += p.twinkleSpeed * p.twinkleDir;

        if (p.alpha >= 0.75) {
          p.alpha = 0.75;
          p.twinkleDir = -1;
        } else if (p.alpha <= 0.15) {
          p.alpha = 0.15;
          p.twinkleDir = 1;
        }

        if (p.y < -15 || p.x < -15 || p.x > width + 15) {
          particles[i] = createParticle(false);
        }

        const rad = p.radius;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, rad * 2);
        grad.addColorStop(0, `rgba(255, 245, 220, ${p.alpha})`);
        grad.addColorStop(0.5, `rgba(233, 208, 143, ${p.alpha * 0.7})`);
        grad.addColorStop(1, 'rgba(184, 146, 63, 0)');

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, rad * 2, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(updateAndDraw);
    }

    window.addEventListener('resize', resize, { passive: true });
    resize();
    updateAndDraw();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupActions);
  } else {
    setupActions();
  }
})();
