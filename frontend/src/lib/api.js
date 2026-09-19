const configuredApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
export const API_BASE = configuredApiUrl.replace(/\/$/, '');

const resolveUrl = (path) => `${API_BASE}/${String(path).replace(/^\//, '')}`;

export async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(resolveUrl(path), {
      credentials: 'include',
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
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

export function postJson(path, payload) {
  return apiRequest(path, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}