// Internationalization (i18n) support for When's My Shabbos
// Supports English (en) and Hebrew (he)

const translations = {
    en: {
        // Header
        title: "When's My Shabbos?",
        subtitle: "Find Shabbat candle lighting and Havdalah times for any location worldwide",

        // Loading
        detectingLocation: "Detecting your location...",
        loading: "Loading...",

        // Labels
        candleLighting: "Candle Lighting",
        havdalah: "Havdalah",
        torahPortion: "Torah Portion (Parsha)",
        havdalahStandard: "Standard (3 stars)",
        havdalahRabeinuTam: "Rabeinu Tam (72 min)",

        // Placeholder
        yourLocation: "Your Location",
        notAvailable: "N/A",

        // Error messages
        geolocationNotSupported: "Geolocation is not supported by your browser. Please click on the map to select a location.",
        locationDeniedPreviously: "Location access was previously denied. Please enable location in your browser settings, or click on the map to select a location.",
        locationDenied: "Location access denied. Please enable location permissions in your browser settings, or click on the map to select a location.",
        locationUnavailable: "Unable to determine your location. Please check your device's location settings, or click on the map to select a location.",
        locationTimeout: "Location request timed out. Please try refreshing the page, or click on the map to select a location.",
        locationError: "Unable to detect location. Please click on the map to select a location.",
        fetchError: "Unable to fetch Shabbos times: {message}. Please check the browser console for details.",
        apiKeyError: "Please set your MapTiler API key in main.js",

        // Accessibility
        ariaInfoPanel: "Shabbat times information",
        ariaMap: "Interactive world map for finding Shabbat times",
        ariaLocationMarker: "Location marker",

        // Language
        language: "Language",
        languageEn: "English",
        languageHe: "עברית"
    },
    he: {
        // Header
        title: "?מתי השבת שלי",
        subtitle: "מצאו זמני הדלקת נרות והבדלה לכל מיקום בעולם",

        // Loading
        detectingLocation: "...מאתר את המיקום שלך",
        loading: "...טוען",

        // Labels
        candleLighting: "הדלקת נרות",
        havdalah: "הבדלה",
        torahPortion: "פרשת השבוע",
        havdalahStandard: "רגיל (3 כוכבים)",
        havdalahRabeinuTam: "רבינו תם (72 דק׳)",

        // Placeholder
        yourLocation: "המיקום שלך",
        notAvailable: "לא זמין",

        // Error messages
        geolocationNotSupported: "הדפדפן שלך אינו תומך באיתור מיקום. אנא לחץ על המפה לבחירת מיקום.",
        locationDeniedPreviously: "הגישה למיקום נדחתה בעבר. אנא אפשר גישה למיקום בהגדרות הדפדפן, או לחץ על המפה לבחירת מיקום.",
        locationDenied: "הגישה למיקום נדחתה. אנא אפשר הרשאות מיקום בהגדרות הדפדפן, או לחץ על המפה לבחירת מיקום.",
        locationUnavailable: "לא ניתן לקבוע את המיקום שלך. אנא בדוק את הגדרות המיקום של המכשיר, או לחץ על המפה לבחירת מיקום.",
        locationTimeout: "בקשת המיקום פגה. אנא נסה לרענן את הדף, או לחץ על המפה לבחירת מיקום.",
        locationError: "לא ניתן לאתר מיקום. אנא לחץ על המפה לבחירת מיקום.",
        fetchError: "לא ניתן לטעון זמני שבת: {message}. אנא בדוק את קונסול הדפדפן לפרטים.",
        apiKeyError: "אנא הגדר את מפתח API של MapTiler ב-main.js",

        // Accessibility
        ariaInfoPanel: "מידע על זמני שבת",
        ariaMap: "מפה אינטראקטיבית למציאת זמני שבת",
        ariaLocationMarker: "סמן מיקום",

        // Language
        language: "שפה",
        languageEn: "English",
        languageHe: "עברית"
    }
};

// Current language (default to English, or detect from browser)
let currentLanguage = 'en';

// Initialize language from localStorage or browser preference
function initLanguage() {
    const saved = localStorage.getItem('whensmyshabbos-lang');
    if (saved && translations[saved]) {
        currentLanguage = saved;
    } else {
        // Detect browser language
        const browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.startsWith('he')) {
            currentLanguage = 'he';
        }
    }
    return currentLanguage;
}

// Get translation for a key
function t(key, replacements = {}) {
    let text = translations[currentLanguage]?.[key] || translations['en'][key] || key;

    // Replace placeholders like {message}
    Object.keys(replacements).forEach(placeholder => {
        text = text.replace(`{${placeholder}}`, replacements[placeholder]);
    });

    return text;
}

// Set language and save preference
function setLanguage(lang) {
    if (translations[lang]) {
        currentLanguage = lang;
        localStorage.setItem('whensmyshabbos-lang', lang);
        updatePageLanguage();
        return true;
    }
    return false;
}

// Get current language
function getLanguage() {
    return currentLanguage;
}

// Check if current language is RTL
function isRTL() {
    return currentLanguage === 'he';
}

// Get locale for date/time formatting
function getLocale() {
    return currentLanguage === 'he' ? 'he-IL' : 'en-US';
}

// Update all page text based on current language
function updatePageLanguage() {
    const lang = currentLanguage;
    const rtl = isRTL();

    // Update HTML attributes
    document.documentElement.lang = lang;
    document.documentElement.dir = rtl ? 'rtl' : 'ltr';
    document.body.classList.toggle('rtl', rtl);

    // Update static text elements
    const titleEl = document.querySelector('header h1');
    if (titleEl) {
        // Keep the emoji at the end for both languages
        titleEl.textContent = t('title') + ' 🕯️';
    }

    const subtitleEl = document.querySelector('.subtitle');
    if (subtitleEl) {
        subtitleEl.textContent = t('subtitle');
    }

    // Update loading text
    const loadingText = document.querySelector('#loading p');
    if (loadingText) {
        loadingText.textContent = t('detectingLocation');
    }

    // Update labels
    const labels = document.querySelectorAll('.label');
    const labelKeys = ['candleLighting', 'havdalah', 'torahPortion'];
    const emojis = ['🕯️', '⭐', '📖'];
    labels.forEach((label, index) => {
        if (labelKeys[index]) {
            label.textContent = `${emojis[index]} ${t(labelKeys[index])}`;
        }
    });

    // Update Havdalah dropdown labels
    const dropdownLabels = document.querySelectorAll('.dropdown-label');
    const dropdownKeys = ['havdalahStandard', 'havdalahRabeinuTam'];
    dropdownLabels.forEach((label, index) => {
        if (dropdownKeys[index]) {
            label.textContent = t(dropdownKeys[index]);
        }
    });

    // Update aria labels
    const infoPanel = document.getElementById('info-panel');
    if (infoPanel) {
        infoPanel.setAttribute('aria-label', t('ariaInfoPanel'));
    }

    const mapEl = document.getElementById('map');
    if (mapEl) {
        mapEl.setAttribute('aria-label', t('ariaMap'));
    }

    // Update error message if visible and has default text
    const errorEl = document.getElementById('error-message');
    if (errorEl && !errorEl.classList.contains('hidden')) {
        const errorP = errorEl.querySelector('p');
        if (errorP && errorP.textContent.includes('Unable to detect location')) {
            errorP.textContent = t('locationError');
        }
    }

    // Update language switcher button text
    const langBtn = document.getElementById('lang-switcher-btn');
    if (langBtn) {
        langBtn.textContent = lang === 'he' ? 'EN' : 'עב';
        langBtn.setAttribute('title', t('language'));
    }
}

// Export functions for use in main.js
window.i18n = {
    t,
    setLanguage,
    getLanguage,
    isRTL,
    getLocale,
    initLanguage,
    updatePageLanguage
};
