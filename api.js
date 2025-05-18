import { API_BASE } from "./config.js";

function getCSRFToken() {
  const meta = document.querySelector('meta[name="csrf-token"]');
  return meta ? meta.getAttribute("content") : null;
}

export async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = {
    "Content-Type": "application/json",
    "X-CSRF-Token": getCSRFToken(),
  };

  const resp = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    credentials: "include",
    body: body && JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}
