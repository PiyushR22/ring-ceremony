/**
 * ============================================================================
 * js/acceptance.js - Acceptance Flow Controller & Interactive States
 *
 * Handles:
 * - Accept & Decline button actions
 * - Guest count stepper (- 1 +) when config.acceptance.askGuestCount is true
 * - Morphing confirmation state with interlocking rings SVG draw-in & sparkle burst
 * - Soft decline flow with reversible switch
 * - Accessibility: real <button> elements, aria-live="polite", automatic focus shifting
 * - Persistence check on load via ResponseService
 * ============================================================================
 */

(function () {
  let guestCount = 1;
  let activeGuestId = "guest";
  let activeGuestName = "Guest";
  let currentResponse = null;

  /**
   * Helper: Extract query parameters from URL
   */
  function parseGuestContext() {
    const params = new URLSearchParams(window.location.search);
    const idParam = params.get("id");
    const toParam = params.get("to");

    if (toParam && toParam.trim().length > 0) {
      activeGuestName = toParam.trim();
    }

    if (idParam && idParam.trim().length > 0) {
      activeGuestId = idParam.trim();
    } else if (toParam && toParam.trim().length > 0) {
      // Slug fallback from guest name
      activeGuestId = encodeURIComponent(toParam.trim())
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "_")
        .substring(0, 50);
    } else {
      activeGuestId = "guest";
    }
  }

  /**
   * Helper: Get current language dictionary
   */
  function getLangTexts() {
    const currentLang = localStorage.getItem("luxury_lang") || "en";
    const conf = CONFIG.acceptance && CONFIG.acceptance.texts;
    if (conf && conf[currentLang]) {
      return conf[currentLang];
    }
    return conf && conf.en ? conf.en : {};
  }

  /**
   * Renders static texts for Acceptance chapter based on language
   */
  function renderTexts() {
    const texts = getLangTexts();
    const currentLang = localStorage.getItem("luxury_lang") || "en";

    // Heading & Reply By
    const headingEl = document.getElementById("acceptanceHeading");
    if (headingEl && texts.heading) {
      headingEl.textContent = texts.heading;
    }

    const replyByEl = document.getElementById("acceptanceReplyBy");
    if (replyByEl && texts.replyByPrefix) {
      const replyDate = currentLang === "hi" 
        ? (CONFIG.acceptance.replyByHi || CONFIG.acceptance.replyBy) 
        : CONFIG.acceptance.replyBy;
      replyByEl.textContent = texts.replyByPrefix + replyDate;
    }

    // Buttons
    const acceptLabel = document.getElementById("btnAcceptLabel");
    if (acceptLabel && texts.acceptBtn) {
      acceptLabel.textContent = texts.acceptBtn;
    }

    const declineBtn = document.getElementById("btnDeclineInvite");
    if (declineBtn && texts.declineBtn) {
      declineBtn.textContent = texts.declineBtn;
    }

    // Guest Count Stepper Label
    const stepperLabel = document.getElementById("guestStepperLabel");
    if (stepperLabel && texts.guestCountLabel) {
      stepperLabel.textContent = texts.guestCountLabel;
    }

    // If currently displaying confirmed or declined, refresh dynamic names
    if (currentResponse && currentResponse.status === "accepted") {
      updateConfirmedMessage(texts);
    } else if (currentResponse && currentResponse.status === "declined") {
      updateDeclinedMessage(texts);
    }
  }

  /**
   * Updates confirmed state messages with sanitized guest name
   */
  function updateConfirmedMessage(texts) {
    const t = texts || getLangTexts();
    const confirmHeadline = document.getElementById("confirmHeadline");
    const confirmCantWait = document.getElementById("confirmCantWait");

    if (confirmHeadline) {
      confirmHeadline.textContent = `${t.thankYouPrefix || "Thank you, "}${activeGuestName}${t.confirmedSuffix || ". Your presence is confirmed."}`;
    }
    if (confirmCantWait) {
      confirmCantWait.textContent = t.cantWait || "We can't wait to celebrate with you.";
    }
  }

  /**
   * Updates declined state messages with sanitized guest name
   */
  function updateDeclinedMessage(texts) {
    const t = texts || getLangTexts();
    const declineHeadline = document.getElementById("declineHeadline");

    if (declineHeadline) {
      declineHeadline.textContent = `${t.declineMsgPrefix || "We will miss you, "}${activeGuestName}${t.declineMsgSuffix || ". Thank you for letting us know."}`;
    }
  }

  /**
   * View State Transitions:
   * 'form' | 'confirmed' | 'declined'
   */
  function showViewState(state, shouldAnimate) {
    const formState = document.getElementById("acceptanceFormState");
    const confirmedState = document.getElementById("acceptanceConfirmedState");
    const declinedState = document.getElementById("acceptanceDeclinedState");
    const errorBanner = document.getElementById("acceptanceError");

    if (errorBanner) errorBanner.style.display = "none";

    if (state === "form") {
      if (formState) formState.style.display = "flex";
      if (confirmedState) confirmedState.style.display = "none";
      if (declinedState) declinedState.style.display = "none";
      resetButtonLoading();
    } else if (state === "confirmed") {
      if (formState) formState.style.display = "none";
      if (declinedState) declinedState.style.display = "none";
      if (confirmedState) {
        confirmedState.style.display = "flex";
        updateConfirmedMessage();

        // Rings draw-in & sparkle burst animation
        const ringsHero = confirmedState.querySelector(".confirm-rings-hero");
        if (ringsHero && shouldAnimate) {
          ringsHero.classList.remove("is-drawn");
          void ringsHero.offsetWidth; // Trigger reflow
          ringsHero.classList.add("is-drawn");
        } else if (ringsHero) {
          ringsHero.classList.add("is-drawn");
        }

        // Accessibility focus shift
        const msgBox = document.getElementById("confirmMessageBox");
        if (msgBox) {
          setTimeout(() => msgBox.focus(), 150);
        }
      }
    } else if (state === "declined") {
      if (formState) formState.style.display = "none";
      if (confirmedState) confirmedState.style.display = "none";
      if (declinedState) {
        declinedState.style.display = "flex";
        updateDeclinedMessage();

        // Accessibility focus shift
        const msgBox = document.getElementById("declineMessageBox");
        if (msgBox) {
          setTimeout(() => msgBox.focus(), 150);
        }
      }
    }
  }

  function setButtonLoading(isLoading) {
    const btnAccept = document.getElementById("btnAcceptInvite");
    const btnDecline = document.getElementById("btnDeclineInvite");

    if (btnAccept) {
      btnAccept.disabled = isLoading;
      if (isLoading) {
        btnAccept.classList.add("is-loading");
      } else {
        btnAccept.classList.remove("is-loading");
      }
    }
    if (btnDecline) {
      btnDecline.disabled = isLoading;
    }
  }

  function resetButtonLoading() {
    setButtonLoading(false);
  }

  function showError(msg) {
    const errorBanner = document.getElementById("acceptanceError");
    if (errorBanner) {
      const texts = getLangTexts();
      errorBanner.textContent = msg || texts.errorMsg || "Something went wrong, please try again.";
      errorBanner.style.display = "block";
    }
  }

  /**
   * Stepper Setup
   */
  function setupStepper() {
    const stepperGroup = document.getElementById("guestStepperGroup");
    const isStepperEnabled = Boolean(CONFIG.acceptance && CONFIG.acceptance.askGuestCount);

    if (stepperGroup) {
      stepperGroup.style.display = isStepperEnabled ? "block" : "none";
    }

    if (!isStepperEnabled) return;

    const minusBtn = document.getElementById("stepperMinus");
    const plusBtn = document.getElementById("stepperPlus");
    const valEl = document.getElementById("stepperVal");
    const max = (CONFIG.acceptance && CONFIG.acceptance.maxGuests) || 4;

    function updateVal() {
      if (valEl) valEl.textContent = String(guestCount);
      if (minusBtn) minusBtn.disabled = guestCount <= 1;
      if (plusBtn) plusBtn.disabled = guestCount >= max;
    }

    if (minusBtn) {
      minusBtn.addEventListener("click", () => {
        if (guestCount > 1) {
          guestCount--;
          updateVal();
        }
      });
    }

    if (plusBtn) {
      plusBtn.addEventListener("click", () => {
        if (guestCount < max) {
          guestCount++;
          updateVal();
        }
      });
    }

    updateVal();
  }

  /**
   * Action Handlers
   */
  async function handleAccept() {
    showError("");
    setButtonLoading(true);

    try {
      const result = await window.ResponseService.saveResponse(activeGuestId, {
        status: "accepted",
        guests: guestCount,
        guestName: activeGuestName
      });

      currentResponse = result.data;
      showViewState("confirmed", true);
    } catch (err) {
      console.error("Acceptance error:", err);
      showError();
      setButtonLoading(false);
    }
  }

  async function handleDecline() {
    showError("");
    setButtonLoading(true);

    try {
      const result = await window.ResponseService.saveResponse(activeGuestId, {
        status: "declined",
        guests: 0,
        guestName: activeGuestName
      });

      currentResponse = result.data;
      showViewState("declined", true);
    } catch (err) {
      console.error("Decline error:", err);
      showError();
      setButtonLoading(false);
    }
  }

  /**
   * Initialize Acceptance Flow
   */
  async function initAcceptance() {
    parseGuestContext();
    renderTexts();
    setupStepper();

    // Bind Button Events
    const btnAccept = document.getElementById("btnAcceptInvite");
    if (btnAccept) {
      btnAccept.addEventListener("click", handleAccept);
    }

    const btnDecline = document.getElementById("btnDeclineInvite");
    if (btnDecline) {
      btnDecline.addEventListener("click", handleDecline);
    }

    // Check device persistence via ResponseService
    try {
      const existing = await window.ResponseService.getResponse(activeGuestId);
      if (existing && existing.status) {
        currentResponse = existing;
        if (existing.guests) guestCount = existing.guests;
        if (existing.guestName) activeGuestName = existing.guestName;

        if (existing.status === "accepted") {
          showViewState("confirmed", false);
        } else if (existing.status === "declined") {
          showViewState("declined", false);
        }
      } else {
        showViewState("form");
      }
    } catch (e) {
      showViewState("form");
    }

    // Listen for language changes to update labels dynamically
    const langBtn = document.getElementById("langToggle");
    if (langBtn) {
      langBtn.addEventListener("click", () => {
        setTimeout(renderTexts, 50);
      });
    }
  }

  // Public export for dynamic triggers if needed
  window.AcceptanceUI = {
    init: initAcceptance,
    renderTexts: renderTexts
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initAcceptance);
  } else {
    initAcceptance();
  }
})();
