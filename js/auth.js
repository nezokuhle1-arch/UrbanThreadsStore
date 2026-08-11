import { auth, db, googleProvider } from './firebase-config.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';
import { doc, getDoc, setDoc } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const googleBtn = document.getElementById('google-signin-btn');

function showError(id, message) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = message;
  el.classList.add('visible');
}

function clearErrors(formEl) {
  formEl.querySelectorAll('.form-error').forEach((el) => {
    el.textContent = '';
    el.classList.remove('visible');
  });
}

function setLoading(button, isLoading, loadingText, defaultText) {
  button.disabled = isLoading;
  button.textContent = isLoading ? loadingText : defaultText;
}

function friendlyAuthError(err) {
  switch (err.code) {
    case 'auth/invalid-email':
      return 'That email address looks invalid.';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Incorrect email or password.';
    case 'auth/email-already-in-use':
      return 'An account with that email already exists.';
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.';
    case 'auth/too-many-requests':
      return 'Too many attempts. Try again in a moment.';
    case 'auth/popup-closed-by-user':
      return null; // user cancelled, not a real error
    default:
      return 'Something went wrong. Please try again.';
  }
}

async function ensureUserDoc(user) {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    await setDoc(ref, {
      email: user.email,
      displayName: user.displayName || '',
      cart: [],
      wishlist: []
    });
  }
}

// ---- LOGIN ----
loginForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(loginForm);

  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;

  let hasError = false;
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showError('login-email-error', 'Enter a valid email address.');
    hasError = true;
  }
  if (!password) {
    showError('login-password-error', 'Enter your password.');
    hasError = true;
  }
  if (hasError) return;

  const submitBtn = document.getElementById('login-submit');
  setLoading(submitBtn, true, 'Signing in…', 'Sign in');

  try {
    await signInWithEmailAndPassword(auth, email, password);
    window.location.href = 'index.html';
  } catch (err) {
    showError('login-form-error', friendlyAuthError(err) || 'Something went wrong.');
    setLoading(submitBtn, false, 'Signing in…', 'Sign in');
  }
});

// ---- SIGNUP ----
signupForm?.addEventListener('submit', async (e) => {
  e.preventDefault();
  clearErrors(signupForm);

  const name = document.getElementById('signup-name').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirm = document.getElementById('signup-confirm').value;

  let hasError = false;
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    showError('signup-email-error', 'Enter a valid email address.');
    hasError = true;
  }
  if (password.length < 6) {
    showError('signup-password-error', 'Password must be at least 6 characters.');
    hasError = true;
  }
  if (confirm !== password) {
    showError('signup-confirm-error', "Passwords don't match.");
    hasError = true;
  }
  if (hasError) return;

  const submitBtn = document.getElementById('signup-submit');
  setLoading(submitBtn, true, 'Creating account…', 'Create account');

  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    if (name) await updateProfile(user, { displayName: name });
    await ensureUserDoc({ ...user, displayName: name });
    window.location.href = 'index.html';
  } catch (err) {
    showError('signup-form-error', friendlyAuthError(err) || 'Something went wrong.');
    setLoading(submitBtn, false, 'Creating account…', 'Create account');
  }
});

// ---- GOOGLE SIGN-IN ----
googleBtn?.addEventListener('click', async () => {
  try {
    const { user } = await signInWithPopup(auth, googleProvider);
    await ensureUserDoc(user);
    window.location.href = 'index.html';
  } catch (err) {
    const message = friendlyAuthError(err);
    if (message) alert(message);
  }
});