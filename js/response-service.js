/**
 * ============================================================================
 * js/response-service.js - Service Layer for Guest Acceptance & RSVPs
 *
 * BACKEND ARCHITECTURE:
 * Exposes clean, decoupled APIs:
 * 1. getResponse(guestId) -> Promise<{ status, guests, updatedAt, guestName } | null>
 * 2. saveResponse(guestId, { status, guests, guestName }) -> Promise<{ success: boolean, data: object }>
 * 3. getAllResponses() -> Promise<Array<object>> (for Admin Dashboard)
 * 4. subscribeAllResponses(callback) -> Unsubscribe function (real-time listener)
 *
 * MODES:
 * - "firestore" : Connected to Google Cloud Firestore in real time
 * - "local"     : LocalStorage with simulated 600ms delay
 * ============================================================================
 */

(function () {
  const STORAGE_PREFIX = "invite_response_";
  let firestoreDb = null;

  /**
   * Lazily initialize Firestore instance
   */
  function getDb() {
    if (firestoreDb) return firestoreDb;
    if (typeof firebase !== "undefined" && firebase.apps) {
      try {
        if (!firebase.apps.length && CONFIG.firebase && CONFIG.firebase.apiKey) {
          firebase.initializeApp(CONFIG.firebase);
        }
        if (firebase.apps.length) {
          firestoreDb = firebase.firestore();
          return firestoreDb;
        }
      } catch (err) {
        console.warn("ResponseService: Firebase init note:", err);
      }
    }
    return null;
  }

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
    const mode = (CONFIG.acceptance && CONFIG.acceptance.mode) || "local";

    // 1. FIRESTORE MODE
    if (mode === "firestore") {
      const db = getDb();
      if (db) {
        try {
          const docRef = db.collection("responses").doc(cleanId);
          const docSnap = await docRef.get();
          if (docSnap.exists) {
            const remoteData = docSnap.data();
            // Cache locally for offline performance
            try {
              localStorage.setItem(STORAGE_PREFIX + cleanId, JSON.stringify(remoteData));
            } catch (e) {}
            return remoteData;
          }
        } catch (err) {
          console.warn("ResponseService: Firestore get failed, falling back to local storage:", err);
        }
      }
    }

    // 2. LOCAL STORAGE (Fallback or Mode: "local")
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
    const mode = (CONFIG.acceptance && CONFIG.acceptance.mode) || "local";

    // Always cache in localStorage immediately (optimistic UI)
    try {
      localStorage.setItem(STORAGE_PREFIX + cleanId, JSON.stringify(cleanData));
    } catch (e) {}

    // 1. FIRESTORE MODE
    if (mode === "firestore") {
      const db = getDb();
      if (db) {
        try {
          const docRef = db.collection("responses").doc(cleanId);
          await docRef.set(cleanData, { merge: true });
          return { success: true, data: cleanData };
        } catch (err) {
          console.error("ResponseService: Firestore write error:", err);
          // Return success if stored locally, or throw if preferred
          return { success: true, data: cleanData, offlineWarning: true };
        }
      }
    }

    // 2. LOCAL MODE with simulated delay
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true, data: cleanData });
      }, 600);
    });
  }

  /**
   * Real-Time Subscription to all responses (for Admin Dashboard)
   * @param {function(Array<object>)} onUpdate
   * @param {function(Error)} onError
   * @returns {function()} Unsubscribe function
   */
  function subscribeAllResponses(onUpdate, onError) {
    const db = getDb();
    if (db) {
      return db.collection("responses")
        .orderBy("updatedAt", "desc")
        .onSnapshot((snapshot) => {
          const items = [];
          snapshot.forEach((doc) => {
            items.push({ id: doc.id, ...doc.data() });
          });
          onUpdate(items);
        }, (err) => {
          if (onError) onError(err);
        });
    }

    // Fallback: read from localStorage
    const localItems = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          localItems.push({ id: key.replace(STORAGE_PREFIX, ""), ...val });
        } catch (e) {}
      }
    }
    onUpdate(localItems);
    return () => {};
  }

  /**
   * Retrieves all responses once (for Admin export)
   * @returns {Promise<Array<object>>}
   */
  async function getAllResponses() {
    const db = getDb();
    if (db) {
      try {
        const snapshot = await db.collection("responses").orderBy("updatedAt", "desc").get();
        const list = [];
        snapshot.forEach((doc) => list.push({ id: doc.id, ...doc.data() }));
        return list;
      } catch (err) {
        console.warn("Firestore getAll failed:", err);
      }
    }

    // Fallback to local storage
    const list = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(STORAGE_PREFIX)) {
        try {
          const val = JSON.parse(localStorage.getItem(key));
          list.push({ id: key.replace(STORAGE_PREFIX, ""), ...val });
        } catch (e) {}
      }
    }
    return list;
  }

  // Expose Public API
  window.ResponseService = {
    getResponse: getResponse,
    saveResponse: saveResponse,
    getAllResponses: getAllResponses,
    subscribeAllResponses: subscribeAllResponses
  };
})();
