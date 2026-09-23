document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initPasswordStrengthValidator();
  initUsernameInputRestriction();
  initLoginFormValidation();
  initRegisterFormValidation();
  initSocialAuthProviders();
  initEmptyLinksRedirect();
});

/**
 * 1. Universal Password Visibility Toggle (Show / Hide Password)
 */
function initPasswordToggle() {
  const toggleButtons = document.querySelectorAll(
    ".auth-password-toggle-btn, #togglePasswordBtn",
  );

  toggleButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = btn.getAttribute("data-target") || "authPassword";
      const pwdInput = document.getElementById(targetId);
      const icon =
        btn.querySelector("i") || document.getElementById("pwdToggleIcon");

      if (!pwdInput) return;

      const isPassword = pwdInput.getAttribute("type") === "password";
      if (isPassword) {
        pwdInput.setAttribute("type", "text");
        if (icon) {
          icon.classList.remove("fa-eye");
          icon.classList.add("fa-eye-slash");
        }
        btn.setAttribute("aria-label", "Hide password");
      } else {
        pwdInput.setAttribute("type", "password");
        if (icon) {
          icon.classList.remove("fa-eye-slash");
          icon.classList.add("fa-eye");
        }
        btn.setAttribute("aria-label", "Show password");
      }
    });
  });
}

/**
 * 2. Password Strength Evaluation
 */
function evaluatePasswordStrength(password) {
  if (!password) {
    return {
      score: 0,
      level: "none",
      text: "Empty",
      isWeak: true,
      hint: "Must be at least 8 characters with letters, numbers & symbols",
    };
  }

  let score = 0;

  // Length check
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;

  // Complexity checks
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 1;

  if (score <= 2 || password.length < 8) {
    return {
      score,
      level: "weak",
      text: "Weak Password",
      isWeak: true,
      badgeClass: "text-weak",
      hint: "Too weak! Needs 8+ chars, upper/lower letters & numbers",
    };
  } else if (score >= 3 && score <= 4) {
    return {
      score,
      level: "medium",
      text: "Medium Strength",
      isWeak: false,
      badgeClass: "text-medium",
      hint: "Good. Add special characters for a strong password",
    };
  } else {
    return {
      score,
      level: "strong",
      text: "Strong Password",
      isWeak: false,
      badgeClass: "text-strong",
      hint: "Excellent! Your password is secure",
    };
  }
}

/**
 * Real-time Password Strength Meter Binding
 */
function initPasswordStrengthValidator() {
  const configs = [
    {
      inputId: "authPassword",
      meterId: "pwdStrengthWrap",
      badgeId: "pwdStrengthBadge",
      hintId: "pwdStrengthHint",
      errorId: "passwordErrorMsg",
    },
    {
      inputId: "regPassword",
      meterId: "regPwdStrengthWrap",
      badgeId: "regPwdStrengthBadge",
      hintId: "regPwdStrengthHint",
      errorId: "passwordErrorMsg",
    },
  ];

  configs.forEach(({ inputId, meterId, badgeId, hintId, errorId }) => {
    const pwdInput = document.getElementById(inputId);
    const meterWrap = document.getElementById(meterId);
    const badgeText = document.getElementById(badgeId);
    const hintText = document.getElementById(hintId);

    if (!pwdInput || !meterWrap || !badgeText || !hintText) return;

    pwdInput.addEventListener("input", () => {
      const val = pwdInput.value.trim();

      if (!val) {
        meterWrap.style.display = "none";
        meterWrap.removeAttribute("data-level");
        return;
      }

      meterWrap.style.display = "flex";
      const strength = evaluatePasswordStrength(val);

      meterWrap.setAttribute("data-level", strength.level);
      badgeText.textContent = strength.text;
      badgeText.className = `pwd-strength-badge ${strength.badgeClass || ""}`;
      hintText.textContent = strength.hint;

      // Clear invalid state if user enters a valid password
      if (!strength.isWeak && pwdInput.classList.contains("is-invalid")) {
        const errorMsg = document.getElementById(errorId);
        if (errorMsg) errorMsg.classList.remove("visible");
        pwdInput.classList.remove("is-invalid");
      }
    });
  });
}

/**
 * 3. Username Field Restriction: Prevent typing or pasting numbers and special characters
 * (Allows only alphabetic letters and spaces)
 */
function initUsernameInputRestriction() {
  const usernameInput = document.getElementById("regUsername");
  if (!usernameInput) return;

  // Intercept Keydown to block non-letters / non-spaces in real-time
  usernameInput.addEventListener("keydown", (e) => {
    // Allow navigation, control, and edit keys
    const allowedControlKeys = [
      "Backspace",
      "Delete",
      "Tab",
      "ArrowLeft",
      "ArrowRight",
      "ArrowUp",
      "ArrowDown",
      "Home",
      "End",
      "Enter",
      "Escape",
    ];

    if (allowedControlKeys.includes(e.key)) return;

    // Allow keyboard shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+Z, etc.)
    if (e.ctrlKey || e.metaKey || e.altKey) return;

    // If key is not a letter (a-z, A-Z) or a space, reject keypress
    if (!/^[a-zA-Z\s]$/.test(e.key)) {
      e.preventDefault();
    }
  });

  // Intercept beforeinput if supported
  usernameInput.addEventListener("beforeinput", (e) => {
    if (e.data && !/^[a-zA-Z\s]+$/.test(e.data)) {
      e.preventDefault();
    }
  });

  // Sanitize on input (catches paste, drag-and-drop, autofill)
  usernameInput.addEventListener("input", () => {
    const cleaned = usernameInput.value.replace(/[^a-zA-Z\s]/g, "");
    if (usernameInput.value !== cleaned) {
      usernameInput.value = cleaned;
    }
  });

  // Clean pasted text
  usernameInput.addEventListener("paste", (e) => {
    e.preventDefault();
    const pasteText = (e.clipboardData || window.clipboardData).getData("text");
    const cleaned = pasteText.replace(/[^a-zA-Z\s]/g, "");
    const start = usernameInput.selectionStart;
    const end = usernameInput.selectionEnd;
    const currentVal = usernameInput.value;
    usernameInput.value =
      currentVal.substring(0, start) + cleaned + currentVal.substring(end);
    usernameInput.setSelectionRange(
      start + cleaned.length,
      start + cleaned.length,
    );
    usernameInput.dispatchEvent(new Event("input"));
  });
}

/**
 * 4. Register Form Submission & Validations
 */
function initRegisterFormValidation() {
  const form = document.getElementById("registerForm");
  if (!form) return;

  const usernameInput = document.getElementById("regUsername");
  const roleSelect = document.getElementById("regRole");
  const emailInput = document.getElementById("regEmail");
  const pwdInput = document.getElementById("regPassword");
  const confirmPwdInput = document.getElementById("regConfirmPassword");
  const termsCheckbox = document.getElementById("regTerms");
  const alertBox = document.getElementById("authAlertBox");

  const showError = (inputEl, errorElId, message) => {
    if (inputEl) inputEl.classList.add("is-invalid");
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  };

  const clearError = (inputEl, errorElId) => {
    if (inputEl) inputEl.classList.remove("is-invalid");
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  };

  // Real-time error clearing
  usernameInput?.addEventListener("input", () =>
    clearError(usernameInput, "usernameErrorMsg"),
  );
  roleSelect?.addEventListener("change", () =>
    clearError(roleSelect, "roleErrorMsg"),
  );
  emailInput?.addEventListener("input", () =>
    clearError(emailInput, "emailErrorMsg"),
  );
  pwdInput?.addEventListener("input", () => {
    clearError(pwdInput, "passwordErrorMsg");
    if (confirmPwdInput.value.trim().length > 0) {
      if (confirmPwdInput.value === pwdInput.value) {
        clearError(confirmPwdInput, "confirmPasswordErrorMsg");
      }
    }
  });
  confirmPwdInput?.addEventListener("input", () => {
    if (confirmPwdInput.value === pwdInput.value) {
      clearError(confirmPwdInput, "confirmPasswordErrorMsg");
    } else {
      showError(
        confirmPwdInput,
        "confirmPasswordErrorMsg",
        "Passwords do not match.",
      );
    }
  });
  termsCheckbox?.addEventListener("change", () =>
    clearError(termsCheckbox, "termsErrorMsg"),
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    // Reset top alert box
    if (alertBox) {
      alertBox.className = "auth-alert-box";
      alertBox.textContent = "";
    }

    // 1. Validate Username (Required, Letters & Spaces only, min 2 chars)
    const usernameVal = usernameInput.value.trim();
    if (!usernameVal) {
      showError(
        usernameInput,
        "usernameErrorMsg",
        "Username is required (letters and spaces only).",
      );
      isValid = false;
    } else if (usernameVal.length < 2) {
      showError(
        usernameInput,
        "usernameErrorMsg",
        "Username must be at least 2 characters long.",
      );
      isValid = false;
    } else {
      clearError(usernameInput, "usernameErrorMsg");
    }

    // 2. Validate Role (Required)
    if (!roleSelect.value || roleSelect.value === "") {
      showError(roleSelect, "roleErrorMsg", "Please select your role.");
      isValid = false;
    } else {
      clearError(roleSelect, "roleErrorMsg");
    }

    // 3. Validate Email (Required & Valid Format)
    const emailVal = emailInput.value.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      showError(emailInput, "emailErrorMsg", "Email address is required.");
      isValid = false;
    } else if (!emailRegex.test(emailVal)) {
      showError(
        emailInput,
        "emailErrorMsg",
        "Please enter a valid email address (e.g. name@example.com).",
      );
      isValid = false;
    } else {
      clearError(emailInput, "emailErrorMsg");
    }

    // 4. Validate Password (Required & Weak Password Validation)
    const pwdVal = pwdInput.value;
    if (!pwdVal) {
      showError(pwdInput, "passwordErrorMsg", "Password is required.");
      isValid = false;
    } else {
      const strength = evaluatePasswordStrength(pwdVal);
      if (strength.isWeak) {
        showError(
          pwdInput,
          "passwordErrorMsg",
          "Weak password! Provide at least 8 characters including letters and numbers.",
        );
        isValid = false;
      } else {
        clearError(pwdInput, "passwordErrorMsg");
      }
    }

    // 5. Validate Confirm Password (Required & Must Match Password)
    const confirmPwdVal = confirmPwdInput.value;
    if (!confirmPwdVal) {
      showError(
        confirmPwdInput,
        "confirmPasswordErrorMsg",
        "Please confirm your password.",
      );
      isValid = false;
    } else if (confirmPwdVal !== pwdVal) {
      showError(
        confirmPwdInput,
        "confirmPasswordErrorMsg",
        "Passwords do not match.",
      );
      isValid = false;
    } else {
      clearError(confirmPwdInput, "confirmPasswordErrorMsg");
    }

    // 6. Validate Terms & Conditions Checkbox (Required)
    if (!termsCheckbox.checked) {
      showError(
        termsCheckbox,
        "termsErrorMsg",
        "You must agree to the Terms & Conditions and Privacy Policy.",
      );
      isValid = false;
    } else {
      clearError(termsCheckbox, "termsErrorMsg");
    }

    if (!isValid) {
      if (alertBox) {
        alertBox.textContent =
          "Please fix the highlighted errors before signing up.";
        alertBox.className = "auth-alert-box auth-alert-danger visible";
      }
      return;
    }

    // Successful Registration Flow
    const submitBtn = document.getElementById("regSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Creating Account...`;

    if (alertBox) {
      alertBox.textContent =
        "Account created successfully! Redirecting to login...";
      alertBox.className = "auth-alert-box auth-alert-success visible";
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-check me-2"></i> Registered Successfully`;

      // Redirect to Login Page
      setTimeout(() => {
        window.location.href = "login.html";
      }, 1200);
    }, 1500);
  });
}

/**
 * 5. Login Form Submission & Validations
 */
function initLoginFormValidation() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  const roleSelect = document.getElementById("authRole");
  const emailInput = document.getElementById("authEmail");
  const pwdInput = document.getElementById("authPassword");
  const rememberCheckbox = document.getElementById("rememberMe");
  const alertBox = document.getElementById("authAlertBox");

  const showError = (inputEl, errorElId, message) => {
    if (inputEl) inputEl.classList.add("is-invalid");
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add("visible");
    }
  };

  const clearError = (inputEl, errorElId) => {
    if (inputEl) inputEl.classList.remove("is-invalid");
    const errorEl = document.getElementById(errorElId);
    if (errorEl) {
      errorEl.textContent = "";
      errorEl.classList.remove("visible");
    }
  };

  // Real-time error clearing on input change
  roleSelect?.addEventListener("change", () =>
    clearError(roleSelect, "roleErrorMsg"),
  );
  emailInput?.addEventListener("input", () =>
    clearError(emailInput, "emailErrorMsg"),
  );
  pwdInput?.addEventListener("input", () =>
    clearError(pwdInput, "passwordErrorMsg"),
  );
  rememberCheckbox?.addEventListener("change", () =>
    clearError(rememberCheckbox, "rememberErrorMsg"),
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    // Reset alert box
    if (alertBox) {
      alertBox.className = "auth-alert-box";
      alertBox.textContent = "";
    }

    // 1. Validate Role (Required)
    if (!roleSelect.value || roleSelect.value === "") {
      showError(roleSelect, "roleErrorMsg", "Please select your role.");
      isValid = false;
    } else {
      clearError(roleSelect, "roleErrorMsg");
    }

    // 2. Validate Email / Customer ID (Required)
    const emailVal = emailInput.value.trim();
    if (!emailVal) {
      showError(
        emailInput,
        "emailErrorMsg",
        "Email Address or Customer ID is required.",
      );
      isValid = false;
    } else {
      clearError(emailInput, "emailErrorMsg");
    }

    // 3. Validate Password (Required & Weak Password Validation)
    const pwdVal = pwdInput.value;
    if (!pwdVal) {
      showError(pwdInput, "passwordErrorMsg", "Password is required.");
      isValid = false;
    } else {
      const strength = evaluatePasswordStrength(pwdVal);
      if (strength.isWeak) {
        showError(
          pwdInput,
          "passwordErrorMsg",
          "Weak password detected! Please provide at least 8 characters including letters and numbers.",
        );
        isValid = false;
      } else {
        clearError(pwdInput, "passwordErrorMsg");
      }
    }

    // 4. Validate Remember Me (Required)
    if (!rememberCheckbox.checked) {
      showError(
        rememberCheckbox,
        "rememberErrorMsg",
        "Please check 'Remember me' to proceed.",
      );
      isValid = false;
    } else {
      clearError(rememberCheckbox, "rememberErrorMsg");
    }

    if (!isValid) {
      if (alertBox) {
        alertBox.textContent =
          "Please resolve the highlighted errors before continuing.";
        alertBox.className = "auth-alert-box auth-alert-danger visible";
      }
      return;
    }

    // Successful Login Flow
    const submitBtn = document.getElementById("loginSubmitBtn");
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Authenticating...`;

    // Extract role and user details
    const selectedRole = roleSelect.value;
    const userIdentifier = emailVal;

    // Save to storage for Dashboard role retrieval
    const sessionData = {
      role: selectedRole,
      email: userIdentifier,
      name:
        userIdentifier
          .split("@")[0]
          .replace(/[^a-zA-Z0-9]/g, " ")
          .trim() || "Creative User",
      rememberMe: rememberCheckbox.checked,
      loginTime: new Date().toISOString(),
    };

    try {
      localStorage.setItem("stackly_auth_user", JSON.stringify(sessionData));
      sessionStorage.setItem("stackly_auth_user", JSON.stringify(sessionData));
    } catch (err) {
      console.warn("Storage write error:", err);
    }

    if (alertBox) {
      alertBox.textContent =
        "Authentication successful! Redirecting to Dashboard...";
      alertBox.className = "auth-alert-box auth-alert-success visible";
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-check me-2"></i> Logged In Successfully`;

      // Redirection target (Dashboard page)
      setTimeout(() => {
        const isInPages = window.location.pathname
          .replace(/\\/g, "/")
          .includes("/pages/");
        window.location.href = isInPages
          ? "dashboard.html"
          : "pages/dashboard.html";
      }, 1000);
    }, 1200);
  });
}

/**
 * 6. Social & Biometric Authentication Options Handler
 */
function initSocialAuthProviders() {
  const providers = document.querySelectorAll(
    ".auth-provider-item, .auth-social-btn",
  );
  const alertBox = document.getElementById("authAlertBox");

  providers.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      const providerType = btn.getAttribute("data-provider") || "Social Auth";

      if (alertBox) {
        alertBox.textContent = `Connecting with ${providerType}...`;
        alertBox.className = "auth-alert-box auth-alert-success visible";
        setTimeout(() => {
          alertBox.className = "auth-alert-box";
        }, 3000);
      }
    });
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
      const isInPages =
        document.body.dataset.inPages === "true" ||
        window.location.pathname.replace(/\\/g, "/").includes("/pages/");

      const target404 = isInPages ? "../404.html" : "404.html";
      window.location.href = target404;
    }
  });
}
