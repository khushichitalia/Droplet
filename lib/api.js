const API_URL =
  process.env.EXPO_PUBLIC_API_URL || "http://localhost:3001/api";

async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function getFountains() {
  return request("/fountains");
}

export function getReviews(fountainId) {
  return request(`/fountains/${fountainId}/reviews`);
}

export function submitReview(fountainId, { userId, displayName, rating, text }) {
  return request(`/fountains/${fountainId}/reviews`, {
    method: "POST",
    body: JSON.stringify({ userId, displayName, rating, text }),
  });
}
