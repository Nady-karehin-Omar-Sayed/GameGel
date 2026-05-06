(() => {
  const navLinks = [
    { href: "index.html", label: "Home" },
    { href: "pages/games.html", label: "Games" },
    { href: "pages/cart.html", label: "Cart" },
    { href: "pages/dashboard.html", label: "Dashboard" },
    { href: "pages/leaderboard.html", label: "Leaderboard" },
    { href: "pages/login.html", label: "Login" },
    { href: "pages/register.html", label: "Register" },
    { href: "pages/blog.html", label: "Check Our Blog" },
    { href: "pages/contact.html", label: "Contact Us" },
    { href: "pages/forums.html", label: "Forums" },
  ];

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
      .map((link) => `<a href="${pathFor(link.href)}"><li>${link.label}</li></a>`)
      .join("");
    return `<ul class="head-font green ${listClass}">${items}</ul>`;
  }

  function buildNavbar(navbar) {
    navbar.innerHTML = `
      <a href="${logoPath()}" class="logo-link" aria-label="GameGel Home">
        <h1 class="logo"><span style="color: rgb(229, 255, 0);">G</span>ame<span style="color: rgb(229, 255, 0);">G</span>el</h1>
      </a>
      <div class="search-wrapper">
        <input type="text" id="searchInput" placeholder="Search games..." class="search-input">
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

  function initNavbar() {
    const navbar = document.querySelector(".navbar");
    if (!navbar) return;

    buildNavbar(navbar);
    initDrawer(navbar);
    initSearchFallback();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbar);
  } else {
    initNavbar();
  }
})();
