require('dotenv').config();

const email = process.env.TEST_OWNER_EMAIL || process.env.SEED_OWNER_EMAIL || 'owner@leadyfy.com';
const password = process.env.TEST_OWNER_PASSWORD || process.env.SEED_OWNER_PASSWORD || 'ChangeMe@Leadyfy2026';
const apiUrl = process.env.API_URL || `http://127.0.0.1:${process.env.PORT || 5000}`;

const testLogin = async () => {
  try {
    const response = await fetch(`${apiUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      console.error(`Login failed (${response.status}): ${payload.message || 'Unknown server error'}`);
      process.exitCode = 1;
      return;
    }

    const hasJwt = typeof payload.token === 'string' && payload.token.length > 0;
    const role = payload.user?.role;
    console.log(`Login succeeded: ${email}`);
    console.log(`Role: ${role || 'missing'}`);
    console.log(`JWT returned: ${hasJwt ? 'yes' : 'no'}`);

    if (!hasJwt || role !== 'Owner') {
      console.error('Login failed: response did not contain an Owner JWT session');
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(`Login test could not reach ${apiUrl}: ${error.message}`);
    process.exitCode = 1;
  }
};

testLogin();
