document.addEventListener('DOMContentLoaded', () => {
  // ==========================================
  // 🔌 DOM REFERENCES (Modify if your HTML IDs differ)
  // ==========================================
  const registerForm = document.getElementById('register-form');
  const regEmail = document.getElementById('reg-email');
  const regPassword = document.getElementById('reg-password');
  const regConfirmPassword = document.getElementById('reg-confirm-password');
  const regMessage = document.getElementById('reg-message');
  const regSubmitBtn = document.getElementById('reg-submit');

  const loginForm = document.getElementById('login-form');
  const loginEmail = document.getElementById('login-email');
  const loginPassword = document.getElementById('login-password');
  const loginMessage = document.getElementById('login-message');
  const loginSubmitBtn = document.getElementById('login-submit');
  const rememberMeCheckbox = document.getElementById('remember-me');

  // ==========================================
  // 🛠️ UTILITY FUNCTIONS
  // ==========================================
  // ⚠️ MOCK HASH: For demo only. Replace with backend validation.
function mockHash(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return `mock_${hash}`; // Removed Math.random()
}
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showMessage(element, message, type = 'info') {
    element.textContent = message;
    element.style.color = type === 'error' ? '#d32f2f' : type === 'success' ? '#2e7d32' : '#1976d2';
    element.style.marginTop = '8px';
    element.style.fontSize = '14px';
  }

  function setLoading(button, isLoading) {
    button.disabled = isLoading;
    button.textContent = isLoading ? 'Processing...' : (button.id.includes('reg') ? 'Register' : 'Login');
  }

  // ==========================================
  // 📝 REGISTRATION LOGIC
  // ==========================================
  registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    setLoading(regSubmitBtn, true);
    regMessage.textContent = '';

    const email = regEmail.value.trim();
    const password = regPassword.value;
    const confirmPassword = regConfirmPassword.value;

    if (!isValidEmail(email)) {
      showMessage(regMessage, 'Please enter a valid email address.', 'error');
      setLoading(regSubmitBtn, false);
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
      showMessage(regMessage, 'Password must be 8+ chars, include 1 uppercase & 1 number.', 'error');
      setLoading(regSubmitBtn, false);
      return;
    }
    if (password !== confirmPassword) {
      showMessage(regMessage, 'Passwords do not match.', 'error');
      setLoading(regSubmitBtn, false);
      return;
    }

    // 🔍 Check existing users (DEMO: localStorage)
    const users = JSON.parse(localStorage.getItem('app_users') || '{}');
    if (users[email]) {
      showMessage(regMessage, 'An account with this email already exists.', 'error');
      setLoading(regSubmitBtn, false);
      return;
    }

    // 🌐 Simulate network request
    await new Promise(res => setTimeout(res, 800));

    // 💾 Save user (⚠️ NEVER store passwords in localStorage in production)
    users[email] = { passwordHash: mockHash(password), createdAt: new Date().toISOString() };
    localStorage.setItem('app_users', JSON.stringify(users));

    showMessage(regMessage, 'Registration successful! You can now log in.', 'success');
    registerForm.reset();
    setLoading(regSubmitBtn, false);
  });

  // ==========================================
  // 🔐 LOGIN LOGIC
  // ==========================================
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  setLoading(loginSubmitBtn, true);
  loginMessage.textContent = '';

  const email = loginEmail.value.trim();
  const password = loginPassword.value;

  if (!isValidEmail(email)) {
    showMessage(loginMessage, 'Please enter a valid email address.', 'error');
    setLoading(loginSubmitBtn, false);
    return;
  }

  await new Promise(res => setTimeout(res, 600));

  // 🔧 FIX 1: Define users here (was missing in login scope)
  const users = JSON.parse(localStorage.getItem('app_users') || '{}');

  const isAdminAccount = ADMIN_CREDENTIALS[email] !== undefined && ADMIN_CREDENTIALS[email] === password;
  
  if (!isAdminAccount) {
    if (!users[email]) {
      showMessage(loginMessage, 'Account not found. Please register first.', 'error');
      setLoading(loginSubmitBtn, false);
      return;
    }

    if (users[email].passwordHash !== mockHash(password)) {
      showMessage(loginMessage, 'Invalid email or password.', 'error');
      setLoading(loginSubmitBtn, false);
      return;
    }
  }

  const storage = rememberMeCheckbox?.checked ? localStorage : sessionStorage;
  storage.setItem('app_session', JSON.stringify({
    email: email,
    role: isAdminAccount ? 'admin' : 'user',
    loggedInAt: new Date().toISOString()
  }));

  // ✅ Now these run ONLY after successful login:
  showMessage(loginMessage, 'Login successful! Redirecting...', 'success');
  loginForm.reset();

  setTimeout(() => {
    window.location.href = './dashboard.html';
  }, 1500);

  setLoading(loginSubmitBtn, false);
  
}); // 🔧 FIX 2: Move closing brace HERE, at the end of the handler  // ==========================================
  // 🔄 AUTO-LOGIN CHECK (checks both sessionStorage and localStorage)
  // ==========================================
  function getStoredSession() {
    // Check sessionStorage first, then localStorage
    let session = JSON.parse(sessionStorage.getItem('app_session') || 'null');
    if (!session) {
      session = JSON.parse(localStorage.getItem('app_session') || 'null');
    }
    return session;
  }

  const session = getStoredSession();
  if (session) {
    console.log('User already authenticated:', session.email);
    // window.location.href = './dashboard.html'; // Uncomment to auto-redirect
  }

  // ==========================================
  // 🚪 LOGOUT FUNCTION
  // ==========================================
  window.logout = function() {
    // Clear from both storages
    sessionStorage.removeItem('app_session');
    localStorage.removeItem('app_session');
    window.location.href = './login.html';
  };

  // ==========================================
  // 👤 GET CURRENT USER
  // ==========================================
  window.getCurrentUser = function() {
    // Check both sessionStorage and localStorage
    let session = JSON.parse(sessionStorage.getItem('app_session') || 'null');
    if (!session) {
      session = JSON.parse(localStorage.getItem('app_session') || 'null');
    }
    return session ? session.email : null;
  };

  // ==========================================
  // 👑 ADMIN CONFIGURATION
  // ==========================================
  const ADMIN_CREDENTIALS = {
    'admin@gamegel.com': 'Admin123',
    'admin2@gamegel.com': 'Admin456'
  };

  window.isAdmin = function() {
    const email = window.getCurrentUser();
    return email && ADMIN_CREDENTIALS[email] !== undefined;
  };

  window.getUserRole = function() {
    // Check session for role first
    let session = JSON.parse(sessionStorage.getItem('app_session') || 'null');
    if (!session) {
      session = JSON.parse(localStorage.getItem('app_session') || 'null');
    }
    if (session && session.role) return session.role;
    
    // Fallback to checking admin credentials
    if (window.isAdmin()) return 'admin';
    const email = window.getCurrentUser();
    return email ? 'user' : 'guest';
  };
});
