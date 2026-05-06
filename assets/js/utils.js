let currentLang = localStorage.getItem("lang") || "en";
function getAssetsPath() {
  if (window.location.pathname.includes('/pages/')) {
    return '../assets';
  }
  return './assets';
}

async function setLanguage(lang) {
  console.log(" switch to ar", lang);
  
  try {
    localStorage.setItem("lang", lang);
    currentLang = lang;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    const assetsPath = getAssetsPath();
    const response = await fetch(`${assetsPath}/lang/${lang}.json`);
    
    if (!response.ok) {
      throw new Error(`اHTTP ${response.status}`);
    }

    const translations = await response.json();
    console.log(" donee", `${assetsPath}/lang/${lang}.json`);

    document.querySelectorAll("[data-key]").forEach(el => {
      const key = el.getAttribute("data-key");
      
      if (translations[key]) {
        if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
          el.placeholder = translations[key];
        } else {
          el.textContent = translations[key];
        }
      }
    });

    document.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang } }));
    console.log("GJ");

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