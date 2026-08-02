// Devise JSON endpoints for the auth modal. Sends the CSRF token from the layout
// meta tag so the same code works outside the test env (where forgery protection
// is disabled).
function csrfToken() {
  return document.querySelector('meta[name="csrf-token"]')?.content ?? '';
}

async function request(path, { method = 'POST', body } = {}) {
  const response = await fetch(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'X-CSRF-Token': csrfToken(),
    },
    credentials: 'same-origin',
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    let message = 'Something went wrong';
    try {
      const data = await response.json();
      message = data.errors ? data.errors.join(', ') : data.error || message;
    } catch {
      // non-JSON error body — keep the default message
    }
    throw new Error(message);
  }

  return response.status === 204 ? null : response.json();
}

export async function signIn({ email, password }) {
  const data = await request('/users/sign_in', { body: { user: { email, password } } });
  return data.user;
}

export async function signUp({ email, password }) {
  const data = await request('/users', { body: { user: { email, password } } });
  return data.user;
}

export async function requestReset(email) {
  return request('/users/password', { body: { user: { email } } });
}

export async function signOut() {
  return request('/users/sign_out', { method: 'DELETE' });
}
