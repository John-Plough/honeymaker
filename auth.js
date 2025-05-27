// auth.js
import { API_BASE } from "./config.js";
import { initGame } from "./game.js";

// UI Elements
const authContainer = document.getElementById("authContainer");
const loginContainer = document.getElementById("loginContainer");
const signupContainer = document.getElementById("signupContainer");
const gameContainer = document.querySelector(".game-container");
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
}

// Helper function for API calls
async function authFetch(endpoint, data) {
  const resp = await fetch(`${API_BASE}${endpoint}`, {
    method: "POST",
    credentials: "include",
    body: JSON.stringify(data),
  });
  return resp;
}

// Helper function to show status message
function showStatusMessage(element, message, type) {
  if (!element) {
    console.error("Status element not found:", message);
    return;
  }

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

    try {
      const resp = await authFetch("/login", {
        email: form.email.value,
        password: form.password.value,
      });

      if (!resp.ok) {
        const data = await resp.json();
        const errorMessage = data.error || "Email or password not recognized";
        showStatusMessage(statusEl, errorMessage, "error");
        return;
      }

      const { user } = await resp.json();
      updateHeaderState(user);
      form.reset();

      // Hide login modal
      const loginModal = document.getElementById("loginModal");
      if (loginModal) {
        loginModal.classList.remove("show");
        loginModal.classList.add("hidden");
      }

      // Show game and hide splash screen
      document.querySelector(".game-container").classList.remove("hidden");
      document.getElementById("splashContainer").classList.add("hidden");

      // Reset game state for new user
      if (typeof initGame === "function") {
        initGame();
      }
    } catch (err) {
      showStatusMessage(statusEl, "Network error. Please try again.", "error");
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

    // Validate passwords match
    if (form.password.value !== form.password_confirmation.value) {
      showStatusMessage(statusEl, "Passwords don't match", "error");
      return;
    }

    try {
      const resp = await authFetch("/users", {
        username: form.username.value,
        email: form.email.value,
        password: form.password.value,
        password_confirmation: form.password_confirmation.value,
      });

      if (!resp.ok) {
        const data = await resp.json();
        const errorMessage = data.errors ? data.errors.join(", ") : "Signup failed";
        showStatusMessage(statusEl, errorMessage, "error");
        return;
      }

      const { user } = await resp.json();
      updateHeaderState(user);
      form.reset();

      // Hide signup modal
      const signupModal = document.getElementById("signupModal");
      if (signupModal) {
        signupModal.classList.remove("show");
        signupModal.classList.add("hidden");
      }

      // Show game and hide splash screen
      document.querySelector(".game-container").classList.remove("hidden");
      document.getElementById("splashContainer").classList.add("hidden");

      // Reset game state for new user
      if (typeof initGame === "function") {
        initGame();
      }
    } catch (err) {
      showStatusMessage(statusEl, "Network error. Please try again.", "error");
      console.error("Signup error:", err);
    }
  });
}

// Logout handler
async function handleLogout() {
  try {
    const response = await fetch(`${API_BASE}/logout`, {
      method: "DELETE",
      credentials: "include",
    });

    if (response.ok) {
      updateHeaderState(null);
      // Hide game and show splash screen
      document.querySelector(".game-container").classList.add("hidden");
      document.getElementById("splashContainer").classList.remove("hidden");
      // Clear any game state
      if (typeof initGame === "function") {
        initGame();
      }
    } else {
      console.error("Logout failed:", response.status);
    }
  } catch (error) {
    console.error("Logout error:", error);
  }
}

// Format date for display
const formatDate = (dateString) => {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

// Populate scores table
const populateScoresTable = (scores, isPersonal = false) => {
  const tbody = scoresTable.querySelector("tbody");
  tbody.innerHTML = "";

  // Get current username for comparison (only needed for global scores)
  const usernameElement = document.querySelector(".username");
  const currentUsername = usernameElement ? usernameElement.textContent.trim() : "";

  scores.forEach((score, index) => {
    const row = document.createElement("tr");

    // Create cells
    const cells = {
      rank: document.createElement("td"),
      player: document.createElement("td"),
      score: document.createElement("td"),
      date: document.createElement("td"),
    };

    // Set cell content
    cells.rank.textContent = index + 1;
    // Use score.user.username if available, otherwise fallback to score.username
    cells.player.textContent = score.user && score.user.username ? score.user.username : score.username || "";
    cells.score.textContent = score.value;
    cells.date.textContent = formatDate(score.created_at);

    // Style for global scores - current user's scores only
    if (
      !isPersonal &&
      ((score.user && score.user.username === currentUsername) || score.username === currentUsername)
    ) {
      row.classList.add("highlight-score");
      Object.values(cells).forEach((cell) => {
        cell.style.setProperty("color", "#2e7d32", "important");
        cell.style.setProperty("font-weight", "bold", "important");
      });
    }

    // Append cells to row
    Object.values(cells).forEach((cell) => row.appendChild(cell));
    tbody.appendChild(row);
  });
};

// Fetch and display personal scores
const showPersonalScores = async () => {
  try {
    const response = await fetch(`${API_BASE}/scores/personal`, {
      method: "GET",
      credentials: "include",
    });

    if (response.ok) {
      const scores = await response.json();
      scoresTitle.textContent = "My Top Scores";
      populateScoresTable(scores, true);
      scoresModal.classList.remove("hidden");
      scoresModal.classList.add("show");
    } else {
      console.error("Failed to fetch personal scores:", response.status);
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
      populateScoresTable(scores, false);
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

// Add this function before the DOMContentLoaded event listener
async function checkAuthStatus() {
  try {
    const response = await fetch(`${API_BASE}/auth/check`, {
      credentials: "include",
    });

    if (response.ok) {
      const { user } = await response.json();
      updateHeaderState(user);
      // Show game and hide splash screen
      document.querySelector(".game-container").classList.remove("hidden");
      document.getElementById("splashContainer").classList.add("hidden");
    } else if (response.status === 401) {
      // User is not logged in - show splash screen and hide game
      updateHeaderState(null);
      document.querySelector(".game-container").classList.add("hidden");
      document.getElementById("splashContainer").classList.remove("hidden");
    } else {
      console.error("Unexpected error checking auth status:", response.status);
      updateHeaderState(null);
      // On error, default to showing splash screen
      document.querySelector(".game-container").classList.add("hidden");
      document.getElementById("splashContainer").classList.remove("hidden");
    }
  } catch (error) {
    // Only log network-level errors
    if (error.name !== "TypeError") {
      console.error("Error checking auth status:", error);
    }
    updateHeaderState(null);
    // On error, default to showing splash screen
    document.querySelector(".game-container").classList.add("hidden");
    document.getElementById("splashContainer").classList.remove("hidden");
  }
}

// Setup all forms
document.addEventListener("DOMContentLoaded", () => {
  setupLoginForm("loginFormModal", "loginModalStatus");
  setupSignupForm("signupFormModal", "signupModalStatus");

  // Modal handlers
  const loginButton = document.querySelector(".auth-buttons .login");
  const signupButton = document.querySelector(".auth-buttons .signup");
  const logoutButton = document.querySelector(".auth-buttons .logout");
  const loginModal = document.getElementById("loginModal");
  const signupModal = document.getElementById("signupModal");
  const closeLoginModal = document.getElementById("closeLoginModal");
  const closeSignupModal = document.getElementById("closeSignupModal");
  const githubLoginButton = document.getElementById("githubLogin");

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

  // Add GitHub login handler
  if (githubLoginButton) {
    githubLoginButton.addEventListener("click", async () => {
      try {
        // Create a form to submit
        const form = document.createElement("form");
        form.method = "post";
        form.action = `${API_BASE}/auth/github`;
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } catch (error) {
        console.error("GitHub login error:", error);
      }
    });
  }

  // Add Google login handler
  const googleLoginButton = document.getElementById("googleLogin");
  if (googleLoginButton) {
    googleLoginButton.addEventListener("click", async () => {
      try {
        // Create a form to submit
        const form = document.createElement("form");
        form.method = "post";
        form.action = `${API_BASE}/auth/google_oauth2`;
        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      } catch (error) {
        console.error("Google login error:", error);
      }
    });
  }

  // Check for error in URL (from OAuth redirect)
  const urlParams = new URLSearchParams(window.location.search);
  const error = urlParams.get("error");

  if (error) {
    // Handle error
    const loginStatus = document.getElementById("loginModalStatus");
    if (loginStatus) {
      showStatusMessage(loginStatus, error, "error");
    }
    // Remove error from URL
    window.history.replaceState({}, document.title, window.location.pathname);
  } else {
    // Check auth status on page load
    checkAuthStatus();
  }
});
