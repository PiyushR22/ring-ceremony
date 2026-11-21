/**
 * ============================================================================
 * js/response-service.js - Service Layer for Guest Acceptance & RSVPs
 *
 * BACKEND-READY ARCHITECTURE:
 * Exposes exactly two functions and nothing else:
 * 1. getResponse(guestId) -> returns Promise<{ status, guests, updatedAt } | null>
 * 2. saveResponse(guestId, { status, guests, guestName }) -> returns Promise<{ success: boolean, data: object }>
 *
 * Current mode: "local" (localStorage under "invite_response_<guestId>", with simulated 600ms latency)
 * Future mode: "firestore" (clearly commented placeholder block for Firebase modular SDK)
 * ============================================================================
 */

(function () {
  const STORAGE_PREFIX = "invite_response_";

  /**
   * Sanitizes and validates the response object before storage.
   * Clamps guests to 1..config.acceptance.maxGuests.
   * Validates status to "accepted" | "declined".
   */
  function sanitizeInput(data) {
    if (!data || typeof data !== "object") {
      throw new Error("Invalid response payload");
    }

    const validStatuses = ["accepted", "declined"];
    if (!validStatuses.includes(data.status)) {
      throw new Error("Status must be either 'accepted' or 'declined'.");
    }

    const maxGuests = (CONFIG.acceptance && CONFIG.acceptance.maxGuests) || 4;
    let guestCount = parseInt(data.guests, 10);
    if (isNaN(guestCount) || guestCount < 1) guestCount = 1;
    if (guestCount > maxGuests) guestCount = maxGuests;

    // Sanitize guest name text
    const tempDiv = document.createElement("div");
    tempDiv.textContent = (data.guestName || "Guest").trim();
    const cleanGuestName = tempDiv.textContent.substring(0, 100);

    return {
      guestName: cleanGuestName,
      status: data.status,
      guests: data.status === "declined" ? 0 : guestCount,
      updatedAt: new Date().toISOString(),
      userAgent: navigator.userAgent || ""
    };
  }

  /**
   * Retrieves the saved response for a given guestId.
   * @param {string} guestId - Unique guest identifier from URL ?id= or ?to= slug
   * @returns {Promise<{ status: string, guests: number, updatedAt: string, guestName: string } | null>}
   */
  async function getResponse(guestId) {
    const cleanId = String(guestId || "guest").trim();

    // ------------------------------------------------------------------------
    // FUTURE FIRESTORE CODE PLACEHOLDER:
    // When CONFIG.acceptance.mode === "firestore":
    //
    // import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";
    // const docRef = doc(db, "responses", cleanId);
    // const docSnap = await getDoc(docRef);
    // return docSnap.exists() ? docSnap.data() : null;
    // ------------------------------------------------------------------------

    // Mode: "local"
    try {
      const stored = localStorage.getItem(STORAGE_PREFIX + cleanId);
      if (!stored) return null;
      return JSON.parse(stored);
    } catch (err) {
      console.warn("ResponseService: Could not read local response for", cleanId, err);
      return null;
    }
  }

  /**
   * Saves the response for a given guestId.
   * @param {string} guestId - Unique guest identifier
   * @param {{ status: 'accepted' | 'declined', guests?: number, guestName?: string }} data
   * @returns {Promise<{ success: boolean, data: object }>}
   */
  async function saveResponse(guestId, data) {
    const cleanId = String(guestId || "guest").trim();
    const cleanData = sanitizeInput(data);

    // ------------------------------------------------------------------------
    // FUTURE FIRESTORE CODE PLACEHOLDER:
    // When CONFIG.acceptance.mode === "firestore":
    //
    // import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-firestore.js";
    // const docRef = doc(db, "responses", cleanId);
    // await setDoc(docRef, cleanData);
    // return { success: true, data: cleanData };
    // ------------------------------------------------------------------------

    // Mode: "local" with simulated network delay (600ms) for realistic loading feedback
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          localStorage.setItem(STORAGE_PREFIX + cleanId, JSON.stringify(cleanData));
          resolve({ success: true, data: cleanData });
        } catch (err) {
          reject(new Error("Unable to save response locally: " + err.message));
        }
      }, 600);
    });
  }

  // Expose ONLY getResponse and saveResponse
  window.ResponseService = {
    getResponse: getResponse,
    saveResponse: saveResponse
  };
})();
