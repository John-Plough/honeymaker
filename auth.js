// auth.js
import { API_BASE } from "./config.js";

// UI Elements
const authContainer = document.getElementById("authContainer");
const loginContainer = document.getElementById("loginContainer");
const signupContainer = document.getElementById("signupContainer");
const gameContainer = document.querySelector(".game-container");
const leaderboard = document.getElementById("leaderboard");
const loggedOutButtons = document.querySelector(".logged-out-buttons");
const loggedInButtons = document.querySelector(".logged-in-buttons");
const usernameSpan = document.querySelector(".username");

// Score modal elements
const scoresModal = document.getElementById("scoresModal");
const scoresTitle = document.getElementById("scoresTitle");
const scoresTable = document.getElementById("scoresTable");
const personalScoresBtn = document.getElementById("personalScores");
const globalScoresBtn = document.getElementById("globalScores");
const closeScoresModal = document.getElementById("closeScoresModal");

// Show/Hide Functions
function updateHeaderState(user) {
  if (user) {
    loggedOutButtons.classList.add("hidden");
    loggedInButtons.classList.remove("hidden");
    // Prefer username over email for the welcome message
    const displayName = user.username || user.email.split("@")[0];
    usernameSpan.textContent = displayName;
    // Dispatch custom event for username change
    document.dispatchEvent(new CustomEvent("usernameUpdated", { detail: displayName }));
  } else {
    loggedInButtons.classList.add("hidden");
    loggedOutButtons.classList.remove("hidden");
    usernameSpan.textContent = "";
    // Dispatch custom event for username cleared
    document.dispatchEvent(new CustomEvent("usernameUpdated", { detail: "Guest" }));
  }
}

function showLogin() {
  authContainer.classList.remove("hidden");
  loginContainer.classList.remove("hidden");
  loginContainer.classList.add("show");
  signupContainer.classList.add("hidden");
  signupContainer.classList.remove("show");
}

function showSignup() {
  authContainer.classList.remove("hidden");
  signupContainer.classList.remove("hidden");
  signupContainer.classList.add("show");
  loginContainer.classList.add("hidden");
  loginContainer.classList.remove("show");
}

function showGame() {
  document.getElementById("splashContainer").classList.add("hidden");
  gameContainer.classList.remove("hidden");
  leaderboard.classList.remove("hidden");
}

// Helper function for API calls
async function authFetch(endpoint, data) {
  const resp = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(data),
  });
  return resp;
}

// Helper function to show status message
function showStatusMessage(element, message, type) {
  element.textContent = message;
  element.classList.remove("error", "success");
  element.classList.add("status-message", type, "show");

  // Hide message after 5 seconds for success messages
  if (type === "success") {
    setTimeout(() => {
      element.classList.remove("show");
    }, 5000);
  }
}

// Login form handlers
function setupLoginForm(formId, statusId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById(statusId);
    const modalStatus = document.getElementById("loginModalStatus");

    try {
      const resp = await authFetch("/login.json", {
        email: form.email.value,
        password: form.password.value,
      });

      if (!resp.ok) {
        const errorMessage = "Email or password not recognized";
        if (formId === "loginFormModal") {
          showStatusMessage(modalStatus, errorMessage, "error");
        } else {
          showStatusMessage(statusEl, errorMessage, "error");
        }
        return;
      }

      const { user } = await resp.json();
      updateHeaderState(user);
      form.reset();

      // Immediately hide login modal and show game
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        loginModal.classList.remove("show");
        loginModal.classList.add("hidden");
      }
      showGame();
    } catch (err) {
      const errorMessage = "Network error. Please try again.";
      if (formId === "loginFormModal") {
        showStatusMessage(modalStatus, errorMessage, "error");
      } else {
        showStatusMessage(statusEl, errorMessage, "error");
      }
      console.error("Login error:", err);
    }
  });
}

// Signup form handlers
function setupSignupForm(formId, statusId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const statusEl = document.getElementById(statusId);
    const modalStatus = document.getElementById("signupModalStatus");

    // Validate passwords match
    if (form.password.value !== form.password_confirmation.value) {
      const errorMessage = "Passwords don't match";
      if (formId === "signupFormModal") {
        showStatusMessage(modalStatus, errorMessage, "error");
      } else {
        showStatusMessage(statusEl, errorMessage, "error");
      }
      return;
    }

    try {
      const resp = await authFetch("/users.json", {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        password_confirmation: form.password_confirmation.value,
      });

      if (!resp.ok) {
        const data = await resp.json();
        const errorMessage = data.errors ? data.errors.join(", ") : "Signup failed";
        if (formId === "signupFormModal") {
          showStatusMessage(modalStatus, errorMessage, "error");
        } else {
          showStatusMessage(statusEl, errorMessage, "error");
        }
        return;
      }

      // After successful signup, automatically log them in
      const loginResp = await authFetch("/login.json", {
        email: form.email.value,
        password: form.password.value,
      });

      if (!loginResp.ok) {
        const successMessage = "Account created! Please log in.";
        if (formId === "signupFormModal") {
          showStatusMessage(modalStatus, successMessage, "success");
        } else {
          showStatusMessage(statusEl, successMessage, "success");
        }
        setTimeout(() => showLogin(), 1000);
        return;
      }

      const { user } = await loginResp.json();
      updateHeaderState(user);
      const successMessage = `Welcome ${user.email}! Account created and logged in.`;
      if (formId === "signupFormModal") {
        showStatusMessage(modalStatus, successMessage, "success");
      } else {
        showStatusMessage(statusEl, successMessage, "success");
      }
      form.reset();

      // Show game after successful signup and login
      setTimeout(() => {
        // Hide both signup and login modals
        const signupModal = document.getElementById("signupModal");
        const loginModal = document.getElementById("loginModal");
        if (signupModal) {
          signupModal.classList.remove("show");
          signupModal.classList.add("hidden");
        }
        if (loginModal) {
          loginModal.classList.remove("show");
          loginModal.classList.add("hidden");
        }
        showGame();
      }, 1000);
    } catch (err) {
      const errorMessage = "Network error. Please try again.";
      if (formId === "signupFormModal") {
        showStatusMessage(modalStatus, errorMessage, "error");
      } else {
        showStatusMessage(statusEl, errorMessage, "error");
      }
      console.error("Signup error:", err);
    }
  });
}

// Logout handler
async function handleLogout() {
  try {
    const resp = await fetch(`${API_BASE}/logout.json`, {
      method: "DELETE",
      credentials: "include",
    });

    if (resp.ok) {
      updateHeaderState(null);
      // Hide game and show splash screen
      gameContainer.classList.add("hidden");
      leaderboard.classList.add("hidden");
      document.getElementById("splashContainer").classList.remove("hidden");
      loggedOutButtons.classList.remove("hidden");
      loggedInButtons.classList.add("hidden");
    } else {
      console.error("Logout failed:", await resp.text());
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// Format date for display
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Populate scores table
const populateScoresTable = (scores) => {
  const tbody = scoresTable.querySelector("tbody");
  tbody.innerHTML = "";

  scores.forEach((score, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${index + 1}</td>
      <td>${score.username}</td>
      <td>${score.value}</td>
      <td>${formatDate(score.created_at)}</td>
    `;
    tbody.appendChild(row);
  });
};

// Fetch and display personal scores
const showPersonalScores = async () => {
  try {
    const response = await fetch(`${API_BASE}/scores/personal`, {
      credentials: "include",
    });

    if (response.ok) {
      const scores = await response.json();
      scoresTitle.textContent = "My Top Scores";
      populateScoresTable(scores);
      scoresModal.classList.remove("hidden");
      scoresModal.classList.add("show");
    } else {
      console.error("Failed to fetch personal scores");
    }
  } catch (error) {
    console.error("Error fetching personal scores:", error);
  }
};

// Fetch and display global scores
const showGlobalScores = async () => {
  try {
    const response = await fetch(`${API_BASE}/scores/global`, {
      credentials: "include",
    });

    if (response.ok) {
      const scores = await response.json();
      scoresTitle.textContent = "All-Time Best Scores";
      populateScoresTable(scores);
      scoresModal.classList.remove("hidden");
      scoresModal.classList.add("show");
    } else {
      console.error("Failed to fetch global scores");
    }
  } catch (error) {
    console.error("Error fetching global scores:", error);
  }
};

// Event listeners for score buttons
personalScoresBtn.addEventListener("click", showPersonalScores);
globalScoresBtn.addEventListener("click", showGlobalScores);
closeScoresModal.addEventListener("click", () => {
  scoresModal.classList.remove("show");
  scoresModal.classList.add("hidden");
});

// Close modal when clicking outside
scoresModal.addEventListener("click", (e) => {
  if (e.target === scoresModal) {
    scoresModal.classList.remove("show");
    scoresModal.classList.add("hidden");
  }
});

// Setup all forms
document.addEventListener("DOMContentLoaded", () => {
  setupLoginForm("loginFormSplash", "loginStatus");
  setupLoginForm("loginFormModal", "loginStatus");
  setupSignupForm("signupFormSplash", "signupStatus");
  setupSignupForm("signupFormModal", "signupStatus");

  // Modal handlers
  const loginButton = document.querySelector(".auth-buttons .login");
  const signupButton = document.querySelector(".auth-buttons .signup");
  const logoutButton = document.querySelector(".auth-buttons .logout");
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");
  const closeLoginModal = document.getElementById("closeLoginModal");
  const closeSignupModal = document.getElementById("closeSignupModal");

  if (loginButton && loginModal) {
    loginButton.addEventListener("click", () => {
      loginModal.classList.remove("hidden");
      loginModal.classList.add("show");
    });
  }

  if (signupButton && signupModal) {
    signupButton.addEventListener("click", () => {
      signupModal.classList.remove("hidden");
      signupModal.classList.add("show");
    });
  }

  if (logoutButton) {
    logoutButton.addEventListener("click", handleLogout);
  }

  if (closeLoginModal && loginModal) {
    closeLoginModal.addEventListener("click", () => {
      loginModal.classList.remove("show");
      loginModal.classList.add("hidden");
    });
  }

  if (closeSignupModal && signupModal) {
    closeSignupModal.addEventListener("click", () => {
      signupModal.classList.remove("show");
      signupModal.classList.add("hidden");
    });
  }

  // Close modals when clicking outside
  window.addEventListener("click", (event) => {
    if (event.target === loginModal) {
      loginModal.classList.remove("show");
      loginModal.classList.add("hidden");
    }
    if (event.target === signupModal) {
      signupModal.classList.remove("show");
      signupModal.classList.add("hidden");
    }
  });
});
