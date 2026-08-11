import { db, auth } from './firebase-config.js';
import { doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const cartItemsEl = document.getElementById('cart-items');
const cartSummaryEl = document.getElementById('cart-summary');
const subtotalEl = document.getElementById('cart-subtotal');
const totalEl = document.getElementById('cart-total');
const checkoutBtn = document.getElementById('checkout-btn');

let currentUser = null;
let currentCart = [];

function currency(n) {
  return `$${Number(n).toFixed(2)}`;
}

function updateNavCount() {
  const totalCount = currentCart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.getElementById('nav-cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = String(totalCount);
    cartCountEl.style.display = totalCount > 0 ? 'inline-flex' : 'none';
  }
}

function renderCart() {
  if (!cartItemsEl) return;

  if (currentCart.length === 0) {
    cartItemsEl.innerHTML = `
      <div class="state-message">
        <strong>Your cart is empty</strong>
        Head to the shop to find something you like.
      </div>`;
    cartSummaryEl.style.display = 'none';
    return;
  }

  cartItemsEl.innerHTML = currentCart.map((item, index) => `
    <div class="cart-item">
      <div class="cart-item-image">
        ${item.imageURL ? `<img src="${item.imageURL}" alt="${item.name}">` : ''}
      </div>
      <div>
        <div class="product-name">${item.name}</div>
        <span class="product-price">${currency(item.price)}</span>
      </div>
      <div class="cart-qty">
        <button type="button" class="qty-decrease" data-index="${index}">-</button>
        <span>${item.quantity}</span>
        <button type="button" class="qty-increase" data-index="${index}">+</button>
      </div>
      <button type="button" class="cart-remove" data-index="${index}">Remove</button>
    </div>
  `).join('');

  const total = currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  subtotalEl.textContent = currency(total);
  totalEl.textContent = currency(total);
  cartSummaryEl.style.display = 'block';
}

async function saveCart() {
  if (!currentUser) return;
  await updateDoc(doc(db, 'users', currentUser.uid), { cart: currentCart });
  updateNavCount();
}

async function loadCart() {
  if (!currentUser) {
    cartItemsEl.innerHTML = `
      <div class="state-message">
        <strong>Sign in to view your cart</strong>
        <a href="login.html">Sign in</a>
      </div>`;
    cartSummaryEl.style.display = 'none';
    return;
  }

  cartItemsEl.innerHTML = `<div class="state-message"><strong>Loading your cart…</strong></div>`;

  try {
    const snap = await getDoc(doc(db, 'users', currentUser.uid));
    currentCart = snap.exists() ? (snap.data().cart || []) : [];
    renderCart();
  } catch (err) {
    console.error('Failed to load cart:', err);
    cartItemsEl.innerHTML = `
      <div class="state-message error">
        <strong>Couldn't load your cart</strong>
        Refresh to try again.
      </div>`;
  }
}

cartItemsEl?.addEventListener('click', async (e) => {
  const index = e.target.dataset.index;
  if (index === undefined) return;

  if (e.target.matches('.qty-increase')) {
    currentCart[index].quantity += 1;
  } else if (e.target.matches('.qty-decrease')) {
    if (currentCart[index].quantity <= 1) {
      currentCart.splice(index, 1);
    } else {
      currentCart[index].quantity -= 1;
    }
  } else if (e.target.matches('.cart-remove')) {
    currentCart.splice(index, 1);
  } else {
    return;
  }

  renderCart();
  await saveCart();
});

checkoutBtn?.addEventListener('click', async () => {
  if (!currentUser || currentCart.length === 0) return;
  currentCart = [];
  await saveCart();
  cartItemsEl.innerHTML = `
    <div class="state-message">
      <strong>Thanks for your order!</strong>
      Your cart has been cleared.
    </div>`;
  cartSummaryEl.style.display = 'none';
});

onAuthStateChanged(auth, (user) => {
  currentUser = user;
  loadCart();
});