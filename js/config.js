/**
 * ============================================================================
 * js/config.js - MASTER CONFIGURATION FOR LUXURY RING CEREMONY INVITATION
 * "Midnight & Gold Foil" Edition
 * ALL editable text, dates, links, palette swatches, and translations live here!
 * ============================================================================
 */

const CONFIG = {
  // Couple Names & Initials (No surnames as requested)
  groomName: "Vikas",
  brideName: "Shailja",
  groomNameHi: "विकास",
  brideNameHi: "शैलजा",
  groomInitial: "V",
  brideInitial: "S",

  // Target Event Date & Time (ISO format for countdown & .ics calendar sync)
  eventDateTimeISO: "2026-12-05T13:00:00+05:30",

  // Date Hero Block Display
  dayNumber: "05",
  monthYear: "DECEMBER 2026",
  weekday: "SATURDAY",

  // Logistics & Venue
  timeRange: "01:00 PM to 05:00 PM",
  timeNote: "Followed by Royal Feast",

  venueName: "Hotel Samdareeya Inn",
  venueAddress: "Russel Chowk, Napier Town, Jabalpur, Madhya Pradesh 482001",
  venueLandmark: "Near Dr. Barat Road / Maharshi Dayanand Saraswati Chowk",
  googleMapsUrl: "https://www.google.com/search?kgmid=%2Fg%2F11gbw8x8ry",

  // Hosts & Elders
  hostedBy: "Rajak Family",
  blessingsOf: "Late Shri & Shrimati Elders of the Family",

  // Acceptance & RSVP Configuration (Backend-ready for local storage & future Firestore)
  acceptance: {
    mode: "firestore", // "firestore" live backend active
    askGuestCount: false, // Set to true to display guest count stepper (- 1 +)
    maxGuests: 4,
    replyBy: "25th November 2026",
    replyByHi: "25 नवंबर 2026",
    texts: {
      en: {
        heading: "Will you celebrate with us?",
        replyByPrefix: "Kindly let us know by ",
        acceptBtn: "Accept Invitation",
        declineBtn: "Regretfully, I can't attend",
        guestCountLabel: "Number of guests (including you)",
        thankYouPrefix: "Thank you, ",
        confirmedSuffix: ". Your presence is confirmed.",
        cantWait: "We can't wait to celebrate with you.",
        declineMsgPrefix: "We will miss you, ",
        declineMsgSuffix: ". Thank you for letting us know.",
        changeMindAccept: "Changed your mind? Accept invitation",
        changeResponse: "Need to update? Change response",
        errorMsg: "Something went wrong, please try again."
      },
      hi: {
        heading: "क्या आप हमारे साथ इस उत्सव में शामिल होंगे?",
        replyByPrefix: "कृपया हमें सूचित करें ",
        acceptBtn: "निमंत्रण स्वीकार करें",
        declineBtn: "खेद है, मैं उपस्थित नहीं हो पाऊँगा/पाऊँगी",
        guestCountLabel: "अतिथियों की संख्या (आपको मिलाकर)",
        thankYouPrefix: "धन्यवाद, ",
        confirmedSuffix: "। आपकी उपस्थिति सुनिश्चित हो गई है।",
        cantWait: "हम आपके साथ इस उत्सव को मनाने के लिए उत्सुक हैं।",
        declineMsgPrefix: "हमें आपकी कमी खलेगी, ",
        declineMsgSuffix: "। हमें सूचित करने के लिए धन्यवाद।",
        changeMindAccept: "अपना विचार बदलें? निमंत्रण स्वीकार करें",
        changeResponse: "उत्तर बदलना चाहते हैं? यहाँ क्लिक करें",
        errorMsg: "कुछ त्रुटि हुई, कृपया पुनः प्रयास करें।"
      }
    }
  },

  // Programme Timeline
  timeline: [
    { time: "01:00 PM", titleEn: "Arrival & Welcoming Guests", titleHi: "अतिथि आगमन एवं स्वागत सत्कार" },
    { time: "02:00 PM", titleEn: "Auspicious Ring Exchange", titleHi: "शुभ सगाई एवं अंगूठी रस्म" },
    { time: "03:00 PM", titleEn: "Royal Feast & Family Blessings", titleHi: "शाही प्रीतिभोज एवं आशीर्वाद" },
    { time: "04:30 PM", titleEn: "Photographs & Sweet Celebrations", titleHi: "छायाचित्र एवं मधुर स्मृतियाँ" }
  ],

  // Firebase Web App Configuration (Connected for Real-Time Firestore)
  firebase: {
    apiKey: "AIzaSyAg7KAg8sBLgMjJGKeWD46eNsIsKQC5jL8",
    authDomain: "ring-ceremony-e2a81.firebaseapp.com",
    projectId: "ring-ceremony-e2a81",
    storageBucket: "ring-ceremony-e2a81.firebasestorage.app",
    messagingSenderId: "743533340081",
    appId: "1:743533340081:web:d889c184122694e5ae8990"
  },

  // Multilingual Texts (English & Hindi)
  i18n: {
    en: {
      langLabel: "English",
      pressToEnter: "Press to enter",
      scrollHint: "Scroll to explore",
      coverTagline: "THE RING CEREMONY OF",
      salutationDefault: "Dear Guest,",
      invitationLead: "Together with their families",
      invitationProse: "Request the honour of your presence as they exchange rings and make a solemn vow of eternal love and togetherness.",
      invitationBlessings: "With the eternal blessings of our revered elders",
      countdownDays: "DAYS",
      countdownHours: "HOURS",
      countdownMins: "MINS",
      countdownSecs: "SECS",
      celebrationArchTag: "CELESTIAL VOW",
      celebrationTimeLabel: "TIME",
      celebrationVenueLabel: "VENUE",
      celebrationOccasionLabel: "CEREMONY",
      celebrationOccasionVal: "Auspicious Ring Exchange & Feast",
      programmeTitle: "Programme",
      venueTitle: "The Venue",
      getDirectionsBtn: "Get Directions",
      calendarBtn: "Add to Calendar",
      shareBtn: "Share Invitation",
      closingQuote: "We can't wait to celebrate with you",
      closingLove: "With love & warm regards,",
      linkCopiedToast: "Invitation link copied to clipboard!"
    },
    hi: {
      langLabel: "हिंदी",
      pressToEnter: "प्रवेश करने हेतु स्पर्श करें",
      scrollHint: "आगे बढ़ने के लिए स्क्रॉल करें",
      coverTagline: "शुभ सगाई एवं अंगूठी समारोह",
      salutationDefault: "सादर अतिथि महोदय,",
      invitationLead: "सपरिवार सादर आमंत्रित हैं",
      invitationProse: "अंगूठी समारोह (सगाई) के पावन व मांगलिक अवसर पर आप सपरिवार सादर आमंत्रित हैं। आपकी गरिमामयी उपस्थिति नवयुगल हेतु आशीर्वाद स्वरूप होगी।",
      invitationBlessings: "परम पूज्य पूर्वजों एवं समस्त वरिष्ठजनों के शुभाशीर्वाद सहित",
      countdownDays: "दिन",
      countdownHours: "घंटे",
      countdownMins: "मिनट",
      countdownSecs: "सेकंड",
      celebrationArchTag: "मांगलिक बंधन",
      celebrationTimeLabel: "समय",
      celebrationVenueLabel: "स्थान",
      celebrationOccasionLabel: "समारोह",
      celebrationOccasionVal: "अंगूठी रस्म एवं शाही प्रीतिभोज",
      programmeTitle: "कार्यक्रम रूपरेखा",
      venueTitle: "कार्यक्रम स्थल",
      getDirectionsBtn: "दिशा-निर्देश (गूगल मैप्स)",
      calendarBtn: "कैलेंडर में जोड़ें",
      shareBtn: "निमंत्रण साझा करें",
      closingQuote: "आपके स्नेहिल आगमन की प्रतीक्षा में...",
      closingLove: "स्नेह एवं आदर सहित,",
      linkCopiedToast: "निमंत्रण लिंक कॉपी हो गया है!"
    }
  }
};

/**
 * Returns computed monogram initials, e.g. "S & V"
 */
function getMonogram() {
  return `${CONFIG.brideInitial} & ${CONFIG.groomInitial}`;
}
