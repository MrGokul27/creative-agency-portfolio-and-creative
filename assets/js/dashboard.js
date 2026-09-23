document.addEventListener("DOMContentLoaded", () => {
  initDashboardSession();
  initRoleSwitcher();
  initSidebarNavigation();
  initMobileSidebar();
  initInteractiveFeatures();
  initEmptyLinksRedirect();
});

// Role definitions and labels
const ROLE_CONFIGS = {
  agency_admin: {
    key: "agency_admin",
    name: "Agency Admin",
    icon: "fa-solid fa-crown",
    badgeClass: "badge-admin",
    welcome: "Welcome back, Executive Director",
    subtitle:
      "Real-time agency revenue, team capacity, project throughput, and client satisfaction metrics.",
    initialTab: "admin-overview",
  },
  creative_designer: {
    key: "creative_designer",
    name: "Creative Designer",
    icon: "fa-solid fa-palette",
    badgeClass: "badge-designer",
    welcome: "Welcome back, Lead Creative Designer",
    subtitle:
      "Your active artboards, sprint queue, client revisions, and live billable time tracker.",
    initialTab: "designer-tasks",
  },
  project_manager: {
    key: "project_manager",
    name: "Project Manager",
    icon: "fa-solid fa-diagram-project",
    badgeClass: "badge-pm",
    welcome: "Welcome back, Senior Project Director",
    subtitle:
      "Sprint health, delivery milestones, client SLA timelines, and team resource allocations.",
    initialTab: "pm-hub",
  },
  client: {
    key: "client",
    name: "Client",
    icon: "fa-solid fa-user-tie",
    badgeClass: "badge-client",
    welcome: "Welcome to your Creative Portal",
    subtitle:
      "Review your campaign deliverables, approve 3D prototypes, track design revisions, and view billing.",
    initialTab: "client-overview",
  },
  guest: {
    key: "guest",
    name: "Guest / Viewer",
    icon: "fa-solid fa-eye",
    badgeClass: "badge-guest",
    welcome: "Welcome to Stackly Agency Showcase",
    subtitle:
      "Explore our award-winning agency portfolio, design capabilities, client case studies, and rate cards.",
    initialTab: "guest-showcase",
  },
};

let currentActiveRole = "agency_admin";
let currentActiveUser = {
  name: "Gokul Creative",
  email: "admin@stackly.agency",
  role: "agency_admin",
};

/**
 * 1. Initialize user session from storage or default
 */
function initDashboardSession() {
  try {
    const rawData =
      sessionStorage.getItem("stackly_auth_user") ||
      localStorage.getItem("stackly_auth_user");
    if (rawData) {
      const parsed = JSON.parse(rawData);
      if (parsed.role && ROLE_CONFIGS[parsed.role]) {
        currentActiveRole = parsed.role;
        currentActiveUser = {
          name: parsed.name || parsed.email.split("@")[0],
          email: parsed.email || "user@stackly.agency",
          role: parsed.role,
        };
      }
    }
  } catch (err) {
    console.warn("Could not read auth storage:", err);
  }

  applyRole(currentActiveRole);
}

/**
 * 2. Apply role to UI (Sidebar, Topbar, Content Views)
 */
function applyRole(roleKey) {
  const config = ROLE_CONFIGS[roleKey] || ROLE_CONFIGS.agency_admin;
  currentActiveRole = config.key;

  // Update Topbar Role Pill & Switcher text
  const currentRoleNameEl = document.getElementById("currentRoleName");
  const currentRoleIconEl = document.getElementById("currentRoleIcon");
  if (currentRoleNameEl) currentRoleNameEl.textContent = config.name;
  if (currentRoleIconEl) currentRoleIconEl.className = `${config.icon} me-1`;

  // Update Topbar User Display
  const userNameEl = document.getElementById("topbarUserName");
  const userRoleEl = document.getElementById("topbarUserRole");
  const userAvatarEl = document.getElementById("topbarUserAvatar");

  if (userNameEl) userNameEl.textContent = currentActiveUser.name;
  if (userRoleEl) userRoleEl.textContent = config.name;
  if (userAvatarEl) {
    const initials = (currentActiveUser.name || "U")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();
    userAvatarEl.textContent = initials || "SA";
  }

  // Update Sidebar Role Indicator
  const sideRoleNameEl = document.getElementById("sidebarRoleTitle");
  const sideRoleIconEl = document.getElementById("sidebarRoleIcon");
  if (sideRoleNameEl) sideRoleNameEl.textContent = config.name;
  if (sideRoleIconEl) sideRoleIconEl.className = config.icon;

  // Show/Hide Role-Specific Sidebar Nav Groups
  document.querySelectorAll(".role-sidebar-group").forEach((group) => {
    const targetRole = group.getAttribute("data-role");
    if (targetRole === roleKey) {
      group.style.display = "block";
    } else {
      group.style.display = "none";
    }
  });

  // Show/Hide Role-Specific Main Content Sections
  document.querySelectorAll(".role-view-section").forEach((section) => {
    const targetRole = section.getAttribute("data-role");
    if (targetRole === roleKey) {
      section.classList.add("active-view");
    } else {
      section.classList.remove("active-view");
    }
  });

  // Activate the initial or active tab for this role
  const firstNavBtn = document.querySelector(
    `.role-sidebar-group[data-role="${roleKey}"] .sidebar-nav-link`,
  );
  if (firstNavBtn) {
    // Reset other active nav links
    document
      .querySelectorAll(
        `.role-sidebar-group[data-role="${roleKey}"] .sidebar-nav-link`,
      )
      .forEach((btn) => btn.classList.remove("active"));
    firstNavBtn.classList.add("active");

    const targetTabId = firstNavBtn.getAttribute("data-tab-target");
    if (targetTabId) {
      showTabPane(roleKey, targetTabId);
    }
  }

  // Update Role Switcher active checkmark in dropdown
  document.querySelectorAll(".dropdown-item-role").forEach((item) => {
    const itemRole = item.getAttribute("data-role-value");
    if (itemRole === roleKey) {
      item.classList.add("active");
    } else {
      item.classList.remove("active");
    }
  });
}

/**
 * 3. Handle live Role Switcher from topbar dropdown
 */
function initRoleSwitcher() {
  document.querySelectorAll(".dropdown-item-role").forEach((item) => {
    item.addEventListener("click", (e) => {
      e.preventDefault();
      const newRole = item.getAttribute("data-role-value");
      if (newRole && ROLE_CONFIGS[newRole]) {
        // Update stored session data
        currentActiveUser.role = newRole;
        try {
          const sessionData = {
            ...currentActiveUser,
            role: newRole,
            loginTime: new Date().toISOString(),
          };
          sessionStorage.setItem(
            "stackly_auth_user",
            JSON.stringify(sessionData),
          );
          localStorage.setItem(
            "stackly_auth_user",
            JSON.stringify(sessionData),
          );
        } catch (err) {
          console.warn("Storage update error:", err);
        }

        applyRole(newRole);
      }
    });
  });

  // Handle Logout Button
  const logoutBtn = document.getElementById("btnLogout");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      try {
        sessionStorage.removeItem("stackly_auth_user");
        localStorage.removeItem("stackly_auth_user");
      } catch (err) {}
      window.location.href = "login.html";
    });
  }
}

/**
 * 4. Sidebar Nav Link Click & Tab Pane Switcher
 */
function initSidebarNavigation() {
  document.addEventListener("click", (e) => {
    const navLink = e.target.closest(".sidebar-nav-link");
    if (!navLink) return;

    e.preventDefault();
    const group = navLink.closest(".role-sidebar-group");
    if (!group) return;

    const role = group.getAttribute("data-role");
    const targetTabId = navLink.getAttribute("data-tab-target");

    // Remove active from sibling links
    group
      .querySelectorAll(".sidebar-nav-link")
      .forEach((link) => link.classList.remove("active"));
    navLink.classList.add("active");

    if (targetTabId) {
      showTabPane(role, targetTabId);
    }

    // Close mobile sidebar on click
    closeMobileSidebar();
  });
}

function showTabPane(roleKey, tabId) {
  const roleSection = document.querySelector(
    `.role-view-section[data-role="${roleKey}"]`,
  );
  if (!roleSection) return;

  roleSection.querySelectorAll(".role-tab-pane").forEach((pane) => {
    if (pane.id === tabId) {
      pane.classList.add("active-pane");
    } else {
      pane.classList.remove("active-pane");
    }
  });
}

/**
 * 5. Mobile Sidebar Toggle & Overlay
 */
function initMobileSidebar() {
  const toggleBtn = document.getElementById("mobileToggleBtn");
  const closeBtn = document.getElementById("sidebarCloseBtn");
  const overlay = document.getElementById("sidebarOverlay");
  const sidebar = document.getElementById("dashboardSidebar");

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener("click", () => {
      sidebar.classList.add("sidebar-open");
      overlay.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", closeMobileSidebar);
  }

  if (overlay) {
    overlay.addEventListener("click", closeMobileSidebar);
  }
}

function closeMobileSidebar() {
  const sidebar = document.getElementById("dashboardSidebar");
  const overlay = document.getElementById("sidebarOverlay");
  if (sidebar) sidebar.classList.remove("sidebar-open");
  if (overlay) overlay.classList.remove("active");
}

/**
 * 6. Interactive Features (Live Timer, Search Filter)
 */
function initInteractiveFeatures() {
  // Live Timer for Designer Workspace
  let timerInterval = null;
  let timerSeconds = 3600 * 2 + 14 * 60 + 35; // 02:14:35
  let isTimerRunning = false;

  const timerDigits = document.getElementById("liveTimerDigits");
  const timerToggleBtn = document.getElementById("btnTimerToggle");

  function formatTime(totalSecs) {
    const hrs = String(Math.floor(totalSecs / 3600)).padStart(2, "0");
    const mins = String(Math.floor((totalSecs % 3600) / 60)).padStart(2, "0");
    const secs = String(totalSecs % 60).padStart(2, "0");
    return `${hrs}:${mins}:${secs}`;
  }

  if (timerToggleBtn && timerDigits) {
    timerDigits.textContent = formatTime(timerSeconds);

    timerToggleBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      if (isTimerRunning) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        timerToggleBtn.innerHTML =
          '<i class="fa-solid fa-play me-1"></i> Resume Timer';
        timerToggleBtn.style.background = "#38bdf8";
      } else {
        isTimerRunning = true;
        timerToggleBtn.innerHTML =
          '<i class="fa-solid fa-pause me-1"></i> Pause Timer';
        timerToggleBtn.style.background = "#fbbf24";
        timerInterval = setInterval(() => {
          timerSeconds += 1;
          timerDigits.textContent = formatTime(timerSeconds);
        }, 1000);
      }
    });
  }

  // Table Filter Search inputs
  document.querySelectorAll(".table-search-filter").forEach((input) => {
    input.addEventListener("input", () => {
      const term = input.value.toLowerCase().trim();
      const tableId = input.getAttribute("data-target-table");
      const table = document.getElementById(tableId);
      if (!table) return;

      table.querySelectorAll("tbody tr").forEach((row) => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(term) ? "" : "none";
      });
    });
  });
}

/**
 * 7. Universal 404 Redirection for Empty/Dummy Links & Action Placeholders
 * Strictly preserves:
 * - Functional sidebar tabs (.sidebar-nav-link)
 * - Role Switcher items (.dropdown-item-role, #roleSwitcherDropdown)
 * - Logout Button (#btnLogout)
 * - Mobile sidebar toggle & close buttons (#mobileToggleBtn, #sidebarCloseBtn)
 * - Timer toggle button (#btnTimerToggle)
 *
 * All other buttons, # links, and empty links simply redirect to 404 without alerts.
 */
function initEmptyLinksRedirect() {
  document.addEventListener("click", (e) => {
    // 1. Check for <a> links
    const link = e.target.closest("a");
    if (link) {
      // Functional link exclusions
      if (
        link.classList.contains("sidebar-nav-link") ||
        link.classList.contains("dropdown-item-role") ||
        link.classList.contains("btn-role-select") ||
        link.getAttribute("id") === "btnLogout" ||
        link.getAttribute("data-bs-toggle") ||
        link.getAttribute("data-bs-target") ||
        link.getAttribute("data-tab-target") ||
        link.hasAttribute("data-no-redirect")
      ) {
        return;
      }

      const href = link.getAttribute("href");
      const isDummy =
        href === null ||
        href === undefined ||
        href.trim() === "" ||
        href === "#" ||
        href === "#!" ||
        href === "javascript:;" ||
        href === "javascript:void(0)" ||
        href === "javascript:void(0);";

      if (isDummy) {
        e.preventDefault();
        window.location.href = "../404.html";
        return;
      }
    }

    // 2. Check for buttons
    const btn = e.target.closest("button");
    if (btn) {
      // Exclude functional dashboard controls
      if (
        btn.getAttribute("id") === "btnLogout" ||
        btn.getAttribute("id") === "mobileToggleBtn" ||
        btn.getAttribute("id") === "sidebarCloseBtn" ||
        btn.getAttribute("id") === "roleSwitcherDropdown" ||
        btn.getAttribute("id") === "btnTimerToggle" ||
        btn.classList.contains("sidebar-nav-link") ||
        btn.classList.contains("dropdown-item-role") ||
        btn.classList.contains("btn-role-select") ||
        btn.getAttribute("data-bs-toggle") ||
        btn.getAttribute("data-bs-target") ||
        btn.getAttribute("data-tab-target") ||
        btn.hasAttribute("data-no-redirect")
      ) {
        return;
      }

      // Any other button clicked in dashboard directly redirects to 404
      e.preventDefault();
      window.location.href = "../404.html";
    }
  });
}
