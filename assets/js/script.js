document.addEventListener("DOMContentLoaded", () => {
  initPreloader();
  loadHeader();
  loadFooter();
  initScrollFeatures();
  initScrollReveal();
  initCounterAnimation();
  initPortfolioFilters();
  initBlogFeatures();
  initContactForm();
  initHomeGetInTouchForm();
  initFooterForm();
  initEmptyLinksRedirect();
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
    initScrollReveal();
  } catch (error) {
    console.warn("Dynamic footer fetch encountered an issue:", error);
    setupFooterAssets(basePath);
    setupHeaderLinks(basePath);
    initScrollReveal();
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
  document
    .querySelectorAll("#header-logo, #mobile-menu-logo")
    .forEach((img) => {
      img.src = `${basePath}/assets/images/stackly-logo.webp`;
    });

  // Define route mapping
  const routeMap = {
    home: `${basePath}/index.html`,
    about: `${basePath}/pages/about.html`,
    services: `${basePath}/pages/services.html`,
    portfolio: `${basePath}/pages/portfolio.html`,
    blog: `${basePath}/pages/blog.html`,
    pricing: `${basePath}/pages/pricing.html`,
    contact: `${basePath}/pages/contact.html`,
    login: `${basePath}/pages/login.html`,
    register: `${basePath}/pages/register.html`,
    dashboard: `${basePath}/pages/dashboard.html`,
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

/**
 * Initializes interactive blog features (Search, Pagination, and Category Filtering)
 */
function initBlogFeatures() {
  const searchInput = document.querySelector(".blog-search-input");
  const blogCards = document.querySelectorAll(
    ".blog-listing-section .blog-card",
  );

  if (searchInput && blogCards.length) {
    searchInput.addEventListener("input", (e) => {
      const term = e.target.value.toLowerCase().trim();

      blogCards.forEach((card) => {
        const title =
          card.querySelector(".blog-card-title")?.textContent.toLowerCase() ||
          "";
        const desc =
          card.querySelector(".blog-card-desc")?.textContent.toLowerCase() ||
          "";
        const tag =
          card.querySelector(".blog-tag")?.textContent.toLowerCase() || "";
        const col = card.closest(".col-12");

        if (!col) return;

        if (title.includes(term) || desc.includes(term) || tag.includes(term)) {
          col.style.display = "";
        } else {
          col.style.display = "none";
        }
      });
    });
  }

  // Pagination buttons active state toggle
  const paginationNumbers = document.querySelectorAll(".pagination-number");
  paginationNumbers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      paginationNumbers.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Blog newsletter subscription redirect to 404 page
  const newsletterForm = document.querySelector(".blog-newsletter-form");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      window.location.href = get404Path();
    });
  }
}

/**
 * Returns the appropriate relative path to 404.html based on current page location
 */
function get404Path() {
  const isInPages =
    document.body.dataset.inPages === "true" ||
    window.location.pathname.replace(/\\/g, "/").includes("/pages/");
  return isInPages ? "../404.html" : "404.html";
}

/**
 * Restricts an input to alphabetic characters only (A-Z, a-z),
 * strictly blocking spaces, numbers, and special characters from being typed or entered.
 */
function restrictToLettersOnly(inputElement) {
  if (!inputElement) return;

  // 1. Prevent typing of non-alphabet characters and spaces via keydown
  inputElement.addEventListener("keydown", (e) => {
    // Explicitly block space
    if (e.key === " " || e.code === "Space" || e.keyCode === 32) {
      e.preventDefault();
      return;
    }

    // Allow navigation, deletion, and system control keys
    if (
      e.key === "Backspace" ||
      e.key === "Delete" ||
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Home" ||
      e.key === "End" ||
      // Allow copy/cut/paste/select-all/undo shortcuts (Ctrl or Cmd + A/C/V/X/Z)
      ((e.ctrlKey || e.metaKey) &&
        ["a", "c", "v", "x", "z"].includes(e.key.toLowerCase()))
    ) {
      return;
    }

    // If single printable character that is NOT an English letter, block keypress completely
    if (e.key.length === 1 && !/^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  // 2. Prevent insertion on modern mobile/virtual keyboards (beforeinput)
  inputElement.addEventListener("beforeinput", (e) => {
    if (
      e.data &&
      e.inputType !== "deleteContentBackward" &&
      e.inputType !== "deleteContentForward"
    ) {
      if (!/^[a-zA-Z]+$/.test(e.data)) {
        e.preventDefault();
      }
    }
  });

  // 3. Fallback sanitizer for drag-and-drop, browser autofill, or IME composition
  inputElement.addEventListener("input", () => {
    const sanitized = inputElement.value.replace(/[^a-zA-Z]/g, "");
    if (inputElement.value !== sanitized) {
      inputElement.value = sanitized;
    }
  });

  // 4. Handle paste event specifically to filter out forbidden characters & spaces
  inputElement.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasteData =
      (e.clipboardData || window.clipboardData)?.getData("text") || "";
    const sanitized = pasteData.replace(/[^a-zA-Z]/g, "");
    const start = inputElement.selectionStart;
    const end = inputElement.selectionEnd;
    const currentValue = inputElement.value;
    inputElement.value =
      currentValue.substring(0, start) +
      sanitized +
      currentValue.substring(end);
    const newPos = start + sanitized.length;
    inputElement.setSelectionRange(newPos, newPos);
  });
}

/**
 * Initializes Contact Form:
 * - Prevents user from typing numbers, special characters, or space in the name field.
 * - Redirects to 404 page upon form submission.
 */
function initContactForm() {
  const nameInput = document.getElementById("contactUsername");
  if (nameInput) {
    restrictToLettersOnly(nameInput);
  }

  // Handle contact form submission -> redirect to 404 page if valid
  const contactForm = document.getElementById("contactForm");
  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();
      if (!contactForm.checkValidity()) {
        contactForm.reportValidity();
        return;
      }
      window.location.href = get404Path();
    });
  }
}

/**
 * Initializes Home Page Get In Touch / Call To Action Section form:
 * - Prevents user from typing numbers, special characters, or space in the name field.
 * - Redirects to 404 page upon form submission.
 */
function initHomeGetInTouchForm() {
  const getInTouchForm = document.querySelector(".get-in-touch-form");
  if (!getInTouchForm) return;

  const nameInput = getInTouchForm.querySelector('input[type="text"]');
  if (nameInput) {
    restrictToLettersOnly(nameInput);
  }

  getInTouchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    window.location.href = get404Path();
  });
}

/**
 * Initializes Footer Newsletter Subscribe Form:
 * - Redirects to 404 page upon form submission.
 */
function initFooterForm() {
  document.addEventListener("submit", (e) => {
    const footerForm = e.target.closest(".footer-newsletter-form");
    if (footerForm) {
      e.preventDefault();
      window.location.href = get404Path();
    }
  });
}

/**
 * Universal redirect for empty, hash (#), or placeholder links to 404 page
 */
function initEmptyLinksRedirect() {
  document.addEventListener("click", (e) => {
    const link = e.target.closest("a");
    if (!link) return;

    // Preserve special Bootstrap toggles or explicit data-no-redirect links
    if (
      link.getAttribute("data-bs-toggle") ||
      link.getAttribute("data-bs-target") ||
      link.hasAttribute("data-no-redirect")
    ) {
      return;
    }

    const href = link.getAttribute("href");

    // Check if the link is empty or a dummy placeholder
    const isDummyLink =
      href === null ||
      href === undefined ||
      href.trim() === "" ||
      href === "#" ||
      href === "#!" ||
      href === "javascript:;" ||
      href === "javascript:void(0)" ||
      href === "javascript:void(0);";

    if (isDummyLink) {
      e.preventDefault();
      window.location.href = get404Path();
    }
  });
}

/**
 * Creative Agency Preloader for Home Page
 * Delivers a sleek ~2s loading experience with smooth percentage counter and shutter reveal.
 */
function initPreloader() {
  const preloader = document.getElementById("preloader");
  if (!preloader) return;

  const percentEl = document.getElementById("preloaderPercent");
  const barEl = document.getElementById("preloaderBar");
  const statusEl = document.getElementById("preloaderStatus");

  // Lock body scroll during preloader
  document.body.classList.add("preloader-active");

  const totalDuration = 2000; // 2 seconds total loading duration
  const startTime = performance.now();

  const statusStages = [
    { threshold: 0, text: "Initializing Creative Engine..." },
    { threshold: 35, text: "Crafting Digital Experiences..." },
    { threshold: 75, text: "Preparing Visual Showcase..." },
    { threshold: 99, text: "Welcome to Stackly" },
  ];

  let currentStageIndex = 0;

  function updatePreloader(currentTime) {
    const elapsed = currentTime - startTime;
    const rawProgress = Math.min(elapsed / (totalDuration * 0.92), 1);

    // Smooth ease-out cubic curve
    const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
    const currentPercent = Math.min(Math.round(easedProgress * 100), 100);

    // Update percentage display
    if (percentEl) {
      percentEl.textContent = `${currentPercent}%`;
    }

    // Update progress bar width
    if (barEl) {
      barEl.style.width = `${currentPercent}%`;
    }

    // Update dynamic status message
    for (let i = statusStages.length - 1; i >= 0; i--) {
      if (currentPercent >= statusStages[i].threshold) {
        if (currentStageIndex !== i && statusEl) {
          currentStageIndex = i;
          statusEl.style.opacity = "0";
          statusEl.style.transform = "translateY(4px)";
          setTimeout(() => {
            statusEl.textContent = statusStages[i].text;
            statusEl.style.opacity = "1";
            statusEl.style.transform = "translateY(0)";
          }, 150);
        }
        break;
      }
    }

    if (rawProgress < 1) {
      requestAnimationFrame(updatePreloader);
    } else {
      // Complete loading sequence
      if (percentEl) percentEl.textContent = "100%";
      if (barEl) barEl.style.width = "100%";
      if (statusEl) statusEl.textContent = "Welcome to Stackly";

      // Brief moment at 100% then trigger curtain reveal
      setTimeout(() => {
        preloader.classList.add("preloader-loaded");
        document.body.classList.remove("preloader-active");
        initScrollReveal();

        // Completely hide preloader after shutters finish sliding
        setTimeout(() => {
          preloader.classList.add("preloader-hidden");
          preloader.setAttribute("aria-hidden", "true");
        }, 750);
      }, 150);
    }
  }

  requestAnimationFrame(updatePreloader);
}

/**
 * Global Scroll Reveal Animation Engine
 * Observes elements with .reveal or [data-reveal]
 * and triggers high-performance GPU animations on scroll into viewport.
 */
let scrollRevealObserver = null;

function initScrollReveal() {
  const revealElements = document.querySelectorAll(
    ".reveal:not(.is-revealed), [data-reveal]:not(.is-revealed)",
  );
  if (!revealElements.length) return;

  // Process stagger containers
  document.querySelectorAll("[data-reveal-stagger]").forEach((container) => {
    const step = parseInt(
      container.getAttribute("data-reveal-stagger") || "100",
      10,
    );
    const children = Array.from(container.children).filter(
      (child) =>
        child.classList.contains("reveal") || child.hasAttribute("data-reveal"),
    );
    children.forEach((child, idx) => {
      if (!child.hasAttribute("data-reveal-delay")) {
        child.style.transitionDelay = `${idx * step}ms`;
      }
    });
  });

  if (!("IntersectionObserver" in window)) {
    revealElements.forEach((el) => el.classList.add("is-revealed"));
    return;
  }

  if (!scrollRevealObserver) {
    scrollRevealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-revealed");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        root: null,
        rootMargin: "0px 0px -40px 0px",
        threshold: 0.08,
      },
    );
  }

  revealElements.forEach((el) => {
    const delay = el.getAttribute("data-reveal-delay");
    if (delay && !el.style.transitionDelay) {
      el.style.transitionDelay = `${delay}ms`;
    }
    const duration = el.getAttribute("data-reveal-duration");
    if (duration && !el.style.transitionDuration) {
      el.style.transitionDuration = `${duration}ms`;
    }

    scrollRevealObserver.observe(el);
  });
}
