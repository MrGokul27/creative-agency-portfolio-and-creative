document.addEventListener("DOMContentLoaded", () => {
  loadHeader();
  loadFooter();
  initScrollFeatures();
  initCounterAnimation();
  initPortfolioFilters();
});

function initScrollFeatures() {
  const handleScroll = () => {
    // Scroll To Top Button visibility toggle
    const btn = document.getElementById("scrollToTopBtn");
    if (btn) {
      btn.classList.toggle("visible", window.scrollY > 250);
    }

    // Header sticky/fixed scrolled styling
    const header = document.querySelector(".site-header");
    if (header) {
      header.classList.toggle("scrolled", window.scrollY > 20);
    }
  };

  window.addEventListener("scroll", handleScroll, { passive: true });
  handleScroll();

  document.addEventListener("click", (e) => {
    if (e.target.closest("#scrollToTopBtn")) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

/**
 * Loads the common header component into #header-placeholder
 */
async function loadHeader() {
  const headerPlaceholder = document.getElementById("header-placeholder");
  if (!headerPlaceholder) return;

  const isInPages =
    document.body.dataset.inPages === "true" ||
    window.location.pathname.replace(/\\/g, "/").includes("/pages/");

  const basePath = isInPages ? ".." : ".";
  const headerPath = isInPages
    ? "components/header.html"
    : "pages/components/header.html";

  try {
    const response = await fetch(headerPath);
    if (!response.ok) {
      throw new Error(`Failed to load header: ${response.statusText}`);
    }
    const html = await response.text();
    headerPlaceholder.innerHTML = html;

    setupHeaderLinks(basePath);
    setActiveNavLink();
  } catch (error) {
    console.warn("Dynamic header fetch encountered an issue:", error);
    setupHeaderLinks(basePath);
    setActiveNavLink();
  }
}

/**
 * Loads the common footer component into #footer-placeholder
 */
async function loadFooter() {
  const footerPlaceholder = document.getElementById("footer-placeholder");
  if (!footerPlaceholder) return;

  const isInPages =
    document.body.dataset.inPages === "true" ||
    window.location.pathname.replace(/\\/g, "/").includes("/pages/");

  const basePath = isInPages ? ".." : ".";
  const footerPath = isInPages
    ? "components/footer.html"
    : "pages/components/footer.html";

  try {
    const response = await fetch(footerPath);
    if (!response.ok) {
      throw new Error(`Failed to load footer: ${response.statusText}`);
    }
    const html = await response.text();
    footerPlaceholder.innerHTML = html;

    setupFooterAssets(basePath);
    setupHeaderLinks(basePath);
  } catch (error) {
    console.warn("Dynamic footer fetch encountered an issue:", error);
    setupFooterAssets(basePath);
    setupHeaderLinks(basePath);
  }
}

/**
 * Resolves images and social icons for the footer dynamically
 */
function setupFooterAssets(basePath) {
  // Update Footer Logo
  const footerLogo = document.getElementById("footer-logo");
  if (footerLogo) {
    footerLogo.src = `${basePath}/assets/images/stackly-footer-logo.webp`;
  }

  // Update Social Media Icons
  const iconMap = {
    "footer-icon-1": `${basePath}/assets/images/footer-icon-1-facebook.webp`,
    "footer-icon-2": `${basePath}/assets/images/footer-icon-2-instagram.webp`,
    "footer-icon-3": `${basePath}/assets/images/footer-icon-3-youtube.webp`,
    "footer-icon-4": `${basePath}/assets/images/footer-icon-4-whatsapp.webp`,
  };

  for (const [id, src] of Object.entries(iconMap)) {
    const iconImg = document.getElementById(id);
    if (iconImg) {
      iconImg.src = src;
    }
  }
}

/**
 * Resolves links and image sources for the header dynamically
 */
function setupHeaderLinks(basePath) {
  // Update Logo Image
  const logoImg = document.getElementById("header-logo");
  if (logoImg) {
    logoImg.src = `${basePath}/assets/images/stackly-logo.webp`;
  }

  // Define route mapping
  const routeMap = {
    home: `${basePath}/index.html`,
    about: `${basePath}/pages/about.html`,
    services: `${basePath}/pages/services.html`,
    portfolio: `${basePath}/pages/portfolio.html`,
    blog: `${basePath}/pages/blog.html`,
    pricing: `${basePath}/pages/pricing.html`,
    contact: `${basePath}/pages/contact.html`,
  };

  // Assign hrefs to all data-nav-link elements
  document.querySelectorAll("[data-nav-link]").forEach((element) => {
    const navKey = element.getAttribute("data-nav-link");
    if (routeMap[navKey]) {
      element.setAttribute("href", routeMap[navKey]);
    }
  });
}

/**
 * Marks the active link based on current page or body data-page attribute
 */
function setActiveNavLink() {
  const currentPage = document.body.dataset.page || getCurrentPageName();

  document.querySelectorAll(".site-header .nav-link").forEach((link) => {
    const linkTarget = link.getAttribute("data-nav-link");
    if (linkTarget === currentPage) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

/**
 * Helper to detect current page from filename
 */
function getCurrentPageName() {
  const path = window.location.pathname.toLowerCase();
  if (path.includes("about")) return "about";
  if (path.includes("service")) return "services";
  if (path.includes("portfolio")) return "portfolio";
  if (path.includes("blog")) return "blog";
  if (path.includes("pricing")) return "pricing";
  if (path.includes("contact")) return "contact";
  return "home";
}

/**
 * Animates running statistics counter numbers when scrolled into view
 */
function initCounterAnimation() {
  const statNumbers = document.querySelectorAll(".stat-number[data-target]");
  if (!statNumbers.length) return;

  const duration = 1800; // ms

  const animateCounter = (el) => {
    const rawTarget = el.getAttribute("data-target");
    const target = parseFloat(rawTarget);
    if (isNaN(target)) return;

    const decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    const suffix = el.getAttribute("data-suffix") || "";
    const startTime = performance.now();

    const updateCount = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Cubic ease-out curve for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentVal = target * easeOut;

      if (decimals > 0) {
        el.textContent = currentVal.toFixed(decimals) + suffix;
      } else {
        el.textContent = Math.floor(currentVal) + suffix;
      }

      if (progress < 1) {
        requestAnimationFrame(updateCount);
      } else {
        el.textContent =
          (decimals > 0 ? target.toFixed(decimals) : target) + suffix;
      }
    };

    requestAnimationFrame(updateCount);
  };

  if ("IntersectionObserver" in window) {
    const observerOptions = {
      root: null,
      threshold: 0.2,
    };

    const statsSections = document.querySelectorAll(
      ".home-stats-section, .services-why-choose-section, .about-impact-section",
    );

    if (statsSections.length > 0) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const numbers = entry.target.querySelectorAll(
              ".stat-number[data-target]",
            );
            numbers.forEach((el) => animateCounter(el));
            obs.unobserve(entry.target);
          }
        });
      }, observerOptions);

      statsSections.forEach((section) => observer.observe(section));
    } else {
      statNumbers.forEach((el) => animateCounter(el));
    }
  } else {
    statNumbers.forEach((el) => animateCounter(el));
  }
}

/**
 * Initializes portfolio filter pill buttons toggle interaction & card filtering
 */
function initPortfolioFilters() {
  const filterBtns = document.querySelectorAll(".portfolio-filter-btn");
  if (!filterBtns.length) return;

  filterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filterVal = btn.getAttribute("data-filter") || "all";
      const projectCols = document.querySelectorAll(
        ".portfolio-project-card-col",
      );

      projectCols.forEach((col) => {
        const category = col.getAttribute("data-category");
        if (filterVal === "all" || category === filterVal) {
          col.style.display = "";
          setTimeout(() => {
            col.style.opacity = "1";
            col.style.transform = "scale(1)";
          }, 10);
        } else {
          col.style.opacity = "0";
          col.style.transform = "scale(0.96)";
          setTimeout(() => {
            col.style.display = "none";
          }, 250);
        }
      });
    });
  });
}
