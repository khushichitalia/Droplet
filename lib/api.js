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

export function createFountain({ name, latitude, longitude }) {
  return request("/fountains", {
    method: "POST",
    body: JSON.stringify({ name, latitude, longitude }),
  });
}

// Water intake endpoints
export function getWaterIntake(userId) {
  return request(`/bottles/${userId}`);
}

export function recordWaterIntake(userId, amount) {
  return request(`/bottles/${userId}/drink`, {
    method: "POST",
    body: JSON.stringify({ amount }),
  });
}

export function resetDailyWaterIntake(userId) {
  return request(`/bottles/${userId}/reset-daily`, {
    method: "POST",
  });
}
