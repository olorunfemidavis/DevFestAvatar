(function () {
  var SUPPORTED_LANGUAGES = {
    en: { name: 'English', native: 'English' },
    es: { name: 'Spanish', native: 'Español' },
    fr: { name: 'French', native: 'Français' },
    pt: { name: 'Portuguese', native: 'Português' },
    yo: { name: 'Yoruba', native: 'Èdè Yorùbá' },
    de: { name: 'German', native: 'Deutsch' },
    tr: { name: 'Turkish', native: 'Türkçe' },
    ar: { name: 'Arabic', native: 'العربية', rtl: true },
    hi: { name: 'Hindi', native: 'हिन्दी' },
    ja: { name: 'Japanese', native: '日本語' },
    ko: { name: 'Korean', native: '한국어' },
    sw: { name: 'Swahili', native: 'Kiswahili' }
  };

  var DEFAULT_LANG = 'en';
  var STORAGE_KEY = 'devfest_avatar_lang';
  var currentLang = DEFAULT_LANG;
  var dictionaries = {};

  var EMBEDDED_EN = {
    "app_title": "#DevFest Avatar Creator",
    "app_tagline": "Create a DevFest 2026 profile avatar for the world's largest community-driven tech conference.",
    "stage_eyebrow": "DevFest Avatar 2026",
    "stage_title": "Frame your photo",
    "create_eyebrow": "Create",
    "create_title": "Upload your photo",
    "step_1": "Upload a photo",
    "step_2": "Pick a frame",
    "step_3": "Share your avatar",
    "upload_btn": "Upload photo",
    "language_selector_label": "Language",

    "color_blue_label": "Blue",
    "color_blue_desc": "Cool badge",
    "color_green_label": "Green",
    "color_green_desc": "GDG energy",
    "color_pink_label": "Pink",
    "color_pink_desc": "Social pop",
    "color_yellow_label": "Yellow",
    "color_yellow_desc": "2026 glow",
    "color_date_label": "2026",
    "color_date_desc": "Dated mark",
    "color_general_label": "Classic",
    "color_general_desc": "Logo frame",
    "color_gemini_label": "Gemini",
    "color_gemini_desc": "AI edit",

    "stat_prefix": "{year} community count:",
    "stat_suffix": "avatars",

    "ready_eyebrow": "Ready",
    "ready_title": "Your avatar is ready",
    "btn_share_x": "Share on X",
    "btn_share_facebook": "Facebook",
    "btn_share_linkedin": "LinkedIn",
    "btn_copy_caption": "Copy caption",
    "btn_download": "Download",

    "footer_built_with": "Built with",
    "footer_by": "by",
    "footer_and": "and",
    "footer_link_privacy": "Privacy",
    "footer_link_print_badge": "Print badge",

    "toast_photo_uploaded": "Photo uploaded! Now select a frame style.",
    "toast_avatar_downloaded": "{color} avatar downloaded!",
    "toast_avatar_created": "{color} avatar created! Click Download below.",
    "toast_caption_copied": "Caption copied to clipboard!",
    "default_share_caption": "I just generated my #DevFest 2026 profile avatar! Join your local Google Developer Group and frame your photo at https://devfestavatar.web.app"
  };

  dictionaries.en = EMBEDDED_EN;

  function detectLanguage() {
    var params = new URLSearchParams(window.location.search);
    var queryLang = params.get('lang') || params.get('locale');
    if (queryLang && normalizeLangCode(queryLang)) {
      return normalizeLangCode(queryLang);
    }

    var savedLang = localStorage.getItem(STORAGE_KEY);
    if (savedLang && normalizeLangCode(savedLang)) {
      return normalizeLangCode(savedLang);
    }

    var browserLangs = window.navigator.languages || [window.navigator.language || window.navigator.userLanguage];
    for (var i = 0; i < browserLangs.length; i += 1) {
      var code = normalizeLangCode(browserLangs[i]);
      if (code) return code;
    }

    return DEFAULT_LANG;
  }

  function normalizeLangCode(raw) {
    if (!raw) return null;
    var clean = String(raw).trim().toLowerCase().split('-')[0];
    return SUPPORTED_LANGUAGES[clean] ? clean : null;
  }

  async function loadDictionary(lang) {
    if (dictionaries[lang]) return dictionaries[lang];

    try {
      var response = await fetch('locales/' + lang + '.json');
      if (!response.ok) throw new Error('Could not fetch locale file');
      var dict = await response.json();
      dictionaries[lang] = dict;
      return dict;
    } catch (error) {
      console.warn('[i18n] Fallback to English for lang:', lang, error);
      return dictionaries.en;
    }
  }

  function t(key, params) {
    var dict = dictionaries[currentLang] || dictionaries.en;
    var template = dict[key] || dictionaries.en[key] || key;

    params = params || {};

    var result = String(template);
    Object.keys(params).forEach(function (param) {
      result = result.replace(new RegExp('\\{' + param + '\\}', 'g'), params[param]);
    });

    return result;
  }

  function applyDomTranslations() {
    if (typeof document === 'undefined') return;

    var langConfig = SUPPORTED_LANGUAGES[currentLang] || SUPPORTED_LANGUAGES.en;
    if (document.documentElement) {
      document.documentElement.lang = currentLang;
      document.documentElement.dir = langConfig.rtl ? 'rtl' : 'ltr';
    }

    var currentYear = new Date().getFullYear();
    var i18nElements = document.querySelectorAll('[data-i18n]');
    i18nElements.forEach(function (elem) {
      var key = elem.getAttribute('data-i18n');
      if (key === 'stat_prefix') {
        elem.textContent = t(key, { year: currentYear });
      } else if (key) {
        elem.textContent = t(key);
      }
    });

    var titleElements = document.querySelectorAll('[data-i18n-title]');
    titleElements.forEach(function (elem) {
      var key = elem.getAttribute('data-i18n-title');
      if (key) {
        elem.setAttribute('title', t(key));
      }
    });

    var selectElem = document.getElementById('language-select');
    if (selectElem && selectElem.value !== currentLang) {
      selectElem.value = currentLang;
    }
  }

  async function setLanguage(lang) {
    var normalized = normalizeLangCode(lang) || DEFAULT_LANG;
    currentLang = normalized;
    localStorage.setItem(STORAGE_KEY, normalized);

    await loadDictionary(normalized);
    applyDomTranslations();

    if (typeof window !== 'undefined' && typeof window.dispatchEvent === 'function' && typeof CustomEvent === 'function') {
      window.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: normalized } }));
    }
  }

  async function init() {
    var detected = detectLanguage();
    currentLang = detected;
    await loadDictionary(detected);
    applyDomTranslations();
  }

  window.i18n = {
    t: t,
    init: init,
    setLanguage: setLanguage,
    getCurrentLanguage: function () { return currentLang; },
    getSupportedLanguages: function () { return SUPPORTED_LANGUAGES; }
  };
})();
