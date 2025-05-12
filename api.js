export async function apiFetch(path, { method = "GET", body } = {}) {
  const token = localStorage.getItem("snakeToken");
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const resp = await fetch(`http://localhost:3000${path}`, {
    method,
    headers,
    body: body && JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}
