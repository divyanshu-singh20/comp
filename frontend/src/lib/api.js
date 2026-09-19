// Centralised API base URL for the Leadyfy OS backend.
// Falls back to the local Express server so the app works with zero setup,
// but can be pointed at another environment via VITE_API_URL.
export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:5000').replace(/\/$/, '');

/**
 * Minimal JSON POST helper.
 * The Leadyfy OS API always responds with `{ message }` on failure, so we
 * normalise both network errors and backend errors into a single Error.
 */
export async function postJson(path, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
  } catch {
    throw new Error('Unable to reach the Leadyfy OS API. Please check your connection and try again.');
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(data?.message || `Request failed with status ${response.status}`);
  }

  return data ?? {};
}