/**
 * Deep End-to-End Live Integration Test:
 * Tests live HTTP communication from Frontend ApiClient directly to Django REST Framework backend,
 * performing write operations and verifying database persistence in Django.
 */

const DJANGO_BASE_URL = 'http://127.0.0.1:8000/api/v1';

async function runDeepLiveIntegrationTest() {
  console.log('================================================================');
  console.log('🚀 STARTING DEEP FRONTEND -> BACKEND INTEGRATION TEST');
  console.log(`🎯 Target Django Backend: ${DJANGO_BASE_URL}`);
  console.log('================================================================\n');

  // Helper request function simulating frontend ApiClient
  async function apiRequest(endpoint, method = 'GET', body = null, token = null) {
    let cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
    if (!cleanEndpoint.endsWith('/') && !cleanEndpoint.includes('?')) {
      cleanEndpoint = `${cleanEndpoint}/`;
    }
    const url = `${DJANGO_BASE_URL}${cleanEndpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await res.json();
    return { status: res.status, ok: res.ok, data };
  }

  // -------------------------------------------------------------------------
  // STEP 1: READ TEST - Query Destinations
  // -------------------------------------------------------------------------
  console.log('📡 [Step 1] Testing Public Read API: GET /api/v1/destinations/');
  const readRes = await apiRequest('destinations/');
  console.log(`   Status: ${readRes.status}`);
  console.log(`   Envelope Success: ${readRes.data.success}`);
  console.log(`   Message: "${readRes.data.message}"`);
  console.log(`   Found ${readRes.data.data?.results?.length ?? 0} destinations in Django DB.\n`);

  if (!readRes.ok || !readRes.data.success) {
    throw new Error('Step 1 Failed: Could not read destinations from backend.');
  }

  // -------------------------------------------------------------------------
  // STEP 2: WRITE TEST - Submit Customer Inquiry from Frontend
  // -------------------------------------------------------------------------
  const timestamp = Date.now();
  const testEmail = `traveler.${timestamp}@dreamscapetreks.com`;
  const testName = `Verified Traveler ${timestamp.toString().slice(-4)}`;
  const testMessage = `Automated end-to-end integration test executed from Next.js frontend at ${new Date().toISOString()}`;

  console.log(`📝 [Step 2] Testing Write API: POST /api/v1/inquiries/`);
  console.log(`   Sending inquiry for: "${testName}" (${testEmail})`);

  const inquiryRes = await apiRequest('inquiries/', 'POST', {
    inquiry_type: 'GENERAL',
    full_name: testName,
    email: testEmail,
    phone: '+977 9851000000',
    message: testMessage,
  });

  console.log(`   Status: ${inquiryRes.status}`);
  console.log(`   Backend Response:`, JSON.stringify(inquiryRes.data));

  if (!inquiryRes.ok || !inquiryRes.data.success) {
    throw new Error(`Step 2 Failed: Backend rejected inquiry submission. Details: ${JSON.stringify(inquiryRes.data)}`);
  }

  const generatedReference = inquiryRes.data.data?.inquiry_number || inquiryRes.data.data?.reference;
  console.log(`   ✅ Successfully created in backend! Reference: ${generatedReference}\n`);

  // -------------------------------------------------------------------------
  // STEP 3: AUTH TEST - Login as Admin and get JWT Tokens
  // -------------------------------------------------------------------------
  console.log('🔐 [Step 3] Testing Auth API: POST /api/v1/auth/login/');
  const loginRes = await apiRequest('auth/login/', 'POST', {
    email: 'admin@dreamscapetreks.com',
    password: 'YourSecurePassword123!',
  });

  console.log(`   Status: ${loginRes.status}`);
  console.log(`   Login Success: ${loginRes.data.success}`);

  if (!loginRes.ok || !loginRes.data.success || !loginRes.data.data?.access) {
    throw new Error('Step 3 Failed: Admin login failed.');
  }

  const accessToken = loginRes.data.data.access;
  const loggedInUser = loginRes.data.data.user;
  console.log(`   ✅ Authenticated! User: ${loggedInUser.email} (Role: ${loggedInUser.role})`);
  console.log(`   Access Token received: ${accessToken.slice(0, 24)}...\n`);

  // -------------------------------------------------------------------------
  // STEP 4: PROTECTED PROFILE TEST - GET /api/v1/users/me/ with Bearer Token
  // -------------------------------------------------------------------------
  console.log('👤 [Step 4] Testing Protected Profile API: GET /api/v1/users/me/ with JWT Bearer');
  const profileRes = await apiRequest('users/me/', 'GET', null, accessToken);
  console.log(`   Status: ${profileRes.status}`);
  console.log(`   Verified User Profile:`, JSON.stringify(profileRes.data.data));

  if (!profileRes.ok || !profileRes.data.success) {
    throw new Error('Step 4 Failed: Could not fetch protected profile with JWT token.');
  }
  console.log(`   ✅ Protected token validation confirmed by Django.\n`);

  // -------------------------------------------------------------------------
  // STEP 5: MUTATION / UPDATE TEST - Update Inquiry Status in Backend
  // -------------------------------------------------------------------------
  console.log(`🔄 [Step 5] Testing Mutation API: PATCH /api/v1/inquiries/${generatedReference}/`);
  console.log(`   Updating status to 'IN_CONTACT' as authenticated staff...`);

  const patchRes = await apiRequest(`inquiries/${generatedReference}/`, 'PATCH', {
    status: 'IN_CONTACT',
  }, accessToken);

  console.log(`   Status: ${patchRes.status}`);
  console.log(`   Updated Backend Record:`, JSON.stringify(patchRes.data.data));

  if (!patchRes.ok || !patchRes.data.success || patchRes.data.data?.status !== 'IN_CONTACT') {
    throw new Error(`Step 5 Failed: Could not update inquiry status. Details: ${JSON.stringify(patchRes.data)}`);
  }
  console.log(`   ✅ Record successfully modified in backend database!\n`);


  console.log('================================================================');
  console.log('🎉 ALL DEEP INTEGRATION TESTS PASSED WITH FLYING COLORS!');
  console.log(`   1. Frontend sent inquiry payload ➔ Backend saved it (Ref: ${generatedReference})`);
  console.log(`   2. Frontend authenticated as admin ➔ Received live JWT access token`);
  console.log(`   3. Frontend updated backend record ➔ Status updated to CONTACTED`);
  console.log('================================================================');

  return { generatedReference, testEmail };
}

runDeepLiveIntegrationTest().catch(err => {
  console.error('\n❌ TEST FAILED:', err.message);
  process.exit(1);
});
