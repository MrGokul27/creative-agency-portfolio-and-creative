document.addEventListener("DOMContentLoaded", () => {
  initPasswordToggle();
  initPasswordStrengthValidator();
  initLoginFormValidation();
  initSocialAuthProviders();
});

/**
 * 1. Password Visibility Toggle (Show / Hide Password)
 */
function initPasswordToggle() {
  const toggleBtn = document.getElementById("togglePasswordBtn");
  const pwdInput = document.getElementById("authPassword");
  const toggleIcon = document.getElementById("pwdToggleIcon");

  if (!toggleBtn || !pwdInput || !toggleIcon) return;

  toggleBtn.addEventListener("click", (e) => {
    e.preventDefault();
    const isPassword = pwdInput.getAttribute("type") === "password";

    if (isPassword) {
      pwdInput.setAttribute("type", "text");
      toggleIcon.classList.remove("fa-eye");
      toggleIcon.classList.add("fa-eye-slash");
      toggleBtn.setAttribute("aria-label", "Hide password");
    } else {
      pwdInput.setAttribute("type", "password");
      toggleIcon.classList.remove("fa-eye-slash");
      toggleIcon.classList.add("fa-eye");
      toggleBtn.setAttribute("aria-label", "Show password");
    }
  });
}

/**
 * 2. Password Strength Evaluation & Real-time Visual Meter
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

function initPasswordStrengthValidator() {
  const pwdInput = document.getElementById("authPassword");
  const meterWrap = document.getElementById("pwdStrengthWrap");
  const badgeText = document.getElementById("pwdStrengthBadge");
  const hintText = document.getElementById("pwdStrengthHint");

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

    // Clear invalid state if user improves password
    if (!strength.isWeak && pwdInput.classList.contains("is-invalid")) {
      const errorMsg = document.getElementById("passwordErrorMsg");
      if (errorMsg) errorMsg.classList.remove("visible");
      pwdInput.classList.remove("is-invalid");
    }
  });
}

/**
 * 3. Login Form Submission & Required Field Validations
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
  rememberCheckbox?.addEventListener("change", () =>
    clearError(rememberCheckbox, "rememberErrorMsg"),
  );

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    let isValid = true;

    // Hide any previous alert
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

    // 4. Validate Remember Me (Required per prompt specification)
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

    // Successful Submission Flow
    const submitBtn = document.getElementById("loginSubmitBtn");
    const originalText = submitBtn.innerHTML;

    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin me-2"></i> Authenticating...`;

    if (alertBox) {
      alertBox.textContent = "Authentication successful! Redirecting...";
      alertBox.className = "auth-alert-box auth-alert-success visible";
    }

    setTimeout(() => {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-check me-2"></i> Logged In Successfully`;

      // Determine redirection target (Home page)
      setTimeout(() => {
        const isInPages = window.location.pathname
          .replace(/\\/g, "/")
          .includes("/pages/");
        window.location.href = isInPages ? "../index.html" : "index.html";
      }, 1200);
    }, 1500);
  });
}

/**
 * 4. Social & Biometric Authentication Options Handler
 */
function initSocialAuthProviders() {
  const providers = document.querySelectorAll(".auth-provider-item");
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
