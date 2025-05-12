import { apiFetch } from "./api.js";

async function loadLeaderboard() {
  try {
    const scores = await apiFetch("/scores.json");
    // e.g. render a table
    const tbody = document.querySelector("#leaderboard tbody");
    tbody.innerHTML = "";
    scores.forEach((s, i) => {
      const row = `<tr>
        <td>${i + 1}</td>
        <td>${s.username}</td>
        <td>${s.value}</td>
      </tr>`;
      tbody.insertAdjacentHTML("beforeend", row);
    });
  } catch (err) {
    console.error(err);
  }
}

loadLeaderboard();
