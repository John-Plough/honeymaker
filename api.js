export async function apiFetch(path, { method = "GET", body } = {}) {
  const headers = {
    "Content-Type": "application/json",
  };

  const resp = await fetch(`http://localhost:3000${path}`, {
    method,
    headers,
    credentials: "include",
    body: body && JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(await resp.text());
  return resp.json();
}
