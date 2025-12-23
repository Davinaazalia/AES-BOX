const API_BASE = 'http://127.0.0.1:5000/api';

async function getJson(url, opts = {}) {
  const res = await fetch(url, opts);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function generateSbox() {
  return getJson(`${API_BASE}/generate-sbox`);
}

export async function validateSboxDebug() {
  return getJson(`${API_BASE}/validate-sbox-debug`);
}

export async function uploadSbox(formData) {
  const res = await fetch('/analyze', { method: 'POST', body: formData });
  if (!res.ok) throw new Error(await res.text());
  return res.text();
}
