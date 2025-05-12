// auth.js

const API_BASE = "http://localhost:3000"; // keep in sync with game.js

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;

  let resp;
  try {
    resp = await fetch(`${API_BASE}/login.json`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: form.email.value,
        password: form.password.value,
      }),
    });
  } catch (err) {
    return (document.getElementById("loginStatus").textContent = "Network error");
  }

  const statusEl = document.getElementById("loginStatus");
  if (!resp.ok) {
    statusEl.textContent = "Login failed";
    return;
  }

  // Rails responds with { token, user: { id, email } }
  const { token, user } = await resp.json();

  localStorage.setItem("snakeToken", token);
  statusEl.textContent = `Logged in as ${user.email}`;
});
