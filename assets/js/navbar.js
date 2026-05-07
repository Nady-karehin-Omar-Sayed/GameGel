(() => {
  const navLinks = [
    { href: "index.html", label: "Home", dataKey: "nav_home" },
    { href: "pages/games.html", label: "Games", dataKey: "nav_games" },
    { href: "pages/cart.html", label: "Cart", dataKey: "nav_cart" },
    { href: "pages/dashboard.html", label: "Dashboard", dataKey: "nav_dashboard" },
    { href: "pages/leaderboard.html", label: "Leaderboard", dataKey: "nav_leaderboard" },
    { href: "pages/login.html", label: "Login", dataKey: "nav_login" },
    { href: "pages/register.html", label: "Register", dataKey: "nav_register" },
    { href: "pages/blog.html", label: "Check Our Blog", dataKey: "nav_blog" },
    { href: "pages/contact.html", label: "Contact Us", dataKey: "nav_contact" },
    { href: "pages/forums.html", label: "Forums", dataKey: "nav_forums" },
    { href: "pages/lobby.html", label: "Lobby", dataKey: "nav_lobby" },
    { href: "pages/live-chat.html", label: "Live Chat", dataKey: "nav_livechat" },
    { href: "pages/event.html", label: "Events", dataKey: "nav_events" },
  ];

  function langToggleLabel() {
    return (localStorage.getItem('lang') || 'en') === 'en' ? 'AR' : 'EN';
  }

  function isInPagesDir() {
    return window.location.pathname.includes("/pages/");
  }

  function pathFor(link) {
    return isInPagesDir() ? `../${link}` : `./${link}`;
  }

  function logoPath() {
    return pathFor("index.html");
  }

  function navListMarkup(listClass = "") {
    const items = navLinks
      .map((link) => `<a href="${pathFor(link.href)}"><li data-key="${link.dataKey}">${link.label}</li></a>`)
      .join("");
    return `<ul class="head-font green ${listClass}">${items}</ul>`;
  }

  function buildNavbar(navbar) {
    navbar.innerHTML = `
      <a href="${logoPath()}" class="logo-link" aria-label="GameGel Home">
        <h1 class="logo"><span style="color: rgb(229, 255, 0);">G</span>ame<span style="color: rgb(229, 255, 0);">G</span>el</h1>
      </a>
      <div class="search-wrapper">
        <input type="text" id="searchInput" data-key="search_placeholder" placeholder="Search games..." class="search-input">
      </div>
      <div class="lang-switcher">
        <button class="lang-btn" id="langToggle">${langToggleLabel()}</button>
      </div>
      <button class="menu-toggle head-font" type="button" aria-label="Open menu" aria-expanded="false">☰</button>
      ${navListMarkup("desktop-nav")}
    `;
  }

  function buildDrawer() {
    const existingOverlay = document.querySelector(".mobile-nav-overlay");
    if (existingOverlay) existingOverlay.remove();

    const overlay = document.createElement("div");
    overlay.className = "mobile-nav-overlay";
    overlay.innerHTML = `
      <aside class="mobile-nav-drawer">
        <div class="mobile-nav-header">
          <span class="head-font">Menu</span>
          <button class="mobile-nav-close" type="button" aria-label="Close menu">x</button>
        </div>
        ${navListMarkup("mobile-nav-list")}
        <div class="lang-switcher" style="padding: 15px 20px;">
          <button class="lang-btn" id="mobileLangToggle">${langToggleLabel()}</button>
        </div>
      </aside>
    `;
    document.body.appendChild(overlay);
    return overlay;
  }

  function initDrawer(navbar) {
    const toggle = navbar.querySelector(".menu-toggle");
    const overlay = buildDrawer();
    const closeBtn = overlay.querySelector(".mobile-nav-close");

    const openDrawer = () => {
      overlay.classList.add("active");
      toggle.setAttribute("aria-expanded", "true");
      document.body.classList.add("nav-open");
    };

    const closeDrawer = () => {
      overlay.classList.remove("active");
      toggle.setAttribute("aria-expanded", "false");
      document.body.classList.remove("nav-open");
    };

    toggle.addEventListener("click", () => {
      if (overlay.classList.contains("active")) closeDrawer();
      else openDrawer();
    });

    closeBtn.addEventListener("click", closeDrawer);
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeDrawer();
    });
    overlay.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeDrawer));

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrawer();
    });
  }

  function initSearchFallback() {
    const input = document.getElementById("searchInput");
    if (!input) return;

    input.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const query = input.value.trim();
      if (!query) return;
      const gamesPath = pathFor("pages/games.html");
      window.location.href = `${gamesPath}?search=${encodeURIComponent(query)}`;
    });
  }
  function initLangToggle() {
    document.addEventListener('click', (e) => {
      if (e.target.id === 'langToggle' || e.target.id === 'mobileLangToggle') {
        const newLang = localStorage.getItem('lang') === 'ar' ? 'en' : 'ar';
        setLanguage(newLang);
      }
    });

    document.addEventListener('languageChanged', (e) => {
      const label = e.detail.lang === 'en' ? 'AR' : 'EN';
      const dt = document.getElementById('langToggle');
      const mt = document.getElementById('mobileLangToggle');
      if (dt) dt.textContent = label;
      if (mt) mt.textContent = label;
    });
  }

  let initialized = false;
  function initNavbar() {
    if (initialized) return;
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    buildNavbar(navbar);
    initDrawer(navbar);
    initSearchFallback();
    initLangToggle();
    setTimeout(() => {
      if (typeof setLanguage === 'function') {
        setLanguage(localStorage.getItem('lang') || 'en');
      }
    }, 50);
    
    initialized = true;
  }
  initNavbar();
  if (!initialized) {
    document.addEventListener("DOMContentLoaded", initNavbar, { once: true });
  }
})();