let currentLang = localStorage.getItem("lang") || "en";
/** @type {Record<string, string>} */
let translationsCache = {};

function getAssetsPath() {
  if (window.location.pathname.includes('/pages/')) {
    return '../assets';
  }
  return './assets';
}

/** @returns {Record<string, string>} */
function getTranslationsObject() {
  return translationsCache;
}

function applyTranslationsFromDict(translations) {
  translationsCache = translations || {};
  window.gamegelTranslations = translationsCache;

  document.querySelectorAll("[data-key-title]").forEach(el => {
    const tkey = el.getAttribute("data-key-title");
    if (tkey && translationsCache[tkey] != null) {
      el.title = translationsCache[tkey];
    }
  });

  document.querySelectorAll("[data-key]").forEach(el => {
    const key = el.getAttribute("data-key");
    if (!key || !(key in translationsCache)) return;
    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
      el.placeholder = translationsCache[key];
    } else if (el.tagName === "OPTION") {
      el.textContent = translationsCache[key];
    } else {
      el.textContent = translationsCache[key];
    }
  });
}

/**
 * Untranslated game catalog fields (titles, genres, storefront text) stay in English from games.json.
 * @param {string} key
 * @returns {string}
 */
function getGamegelTranslation(key) {
  if (translationsCache[key] != null) return translationsCache[key];
  return key;
}

window.getGamegelTranslation = getGamegelTranslation;
window.getTranslationsObject = getTranslationsObject;
window.applyTranslationsFromDict = applyTranslationsFromDict;

async function setLanguage(lang) {
  try {
    localStorage.setItem("lang", lang);
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    const assetsPath = getAssetsPath();
    const response = await fetch(`${assetsPath}/lang/${lang}.json`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const translations = await response.json();

    applyTranslationsFromDict(translations);

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));

  } catch (error) {
    console.error("error", error);
  }
}

function initLanguage() {
  setLanguage(currentLang);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initLanguage);
} else {
  initLanguage();
}
setTimeout(() => {
  initLanguage();
}, 300);
new MutationObserver(() => {
  setTimeout(() => initLanguage(), 50);
}).observe(document.body, {
  childList: true,
  subtree: true
});
