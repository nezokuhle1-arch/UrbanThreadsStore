import { db, auth } from './firebase-config.js';
import { collection, getDocs, doc, getDoc, updateDoc } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';
import { onAuthStateChanged } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js';

const grid = document.getElementById('product-grid');
const filterPills = document.querySelectorAll('.filter-pill');

let allProducts = [];
let currentUser = null;

const params = new URLSearchParams(window.location.search);
let activeCategory = params.get('category') || 'all';
const searchQuery = (params.get('search') || '').trim().toLowerCase();

onAuthStateChanged(auth, (user) => {
  currentUser = user;
});

function currency(n) {
  return `$${Number(n).toFixed(2)}`;
}

function showToast(message, linkText, linkHref) {
  document.querySelector('.toast')?.remove();
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span>${message}</span>${linkText ? `<a href="${linkHref}">${linkText}</a>` : ''}`;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

function renderProducts(list) {
  if (!grid) return;

  if (list.length === 0) {
    grid.innerHTML = `
      <div class="state-message">
        <strong>No products found</strong>
        Try a different category or search term.
      </div>`;
    return;
  }

  grid.innerHTML = list.map((p) => `
    <div class="product-card" data-id="${p.id}">
      <div class="product-image">
        ${p.imageURL ? `<img src="${p.imageURL}" alt="${p.name}" loading="lazy">` : ''}
      </div>
      <div class="product-info">
        <span class="product-category">${p.category || ''}</span>
        <div class="product-name">${p.name}</div>
        <div class="product-footer">
          <span class="product-price">${currency(p.price)}</span>
          <button class="add-to-cart" data-id="${p.id}" type="button">+ Add</button>
        </div>
      </div>
    </div>
  `).join('');
}

function applyFilters() {
  const filtered = allProducts.filter((p) => {
    const matchesCategory = activeCategory === 'all' || p.category === activeCategory;
    const matchesQuery = !searchQuery ||
      p.name?.toLowerCase().includes(searchQuery) ||
      p.description?.toLowerCase().includes(searchQuery);
    return matchesCategory && matchesQuery;
  });
  renderProducts(filtered);
}

async function loadProducts() {
  if (!grid) return;
  grid.innerHTML = `<div class="state-message"><strong>Loading products…</strong></div>`;

  try {
    const snapshot = await getDocs(collection(db, 'products'));
    allProducts = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (allProducts.length === 0) {
      grid.innerHTML = `
        <div class="state-message">
          <strong>No products yet</strong>
          Check back soon — new drops are on the way.
        </div>`;
      return;
    }

    applyFilters();
  } catch (err) {
    console.error('Failed to load products:', err);
    grid.innerHTML = `
      <div class="state-message error">
        <strong>Couldn't load products</strong>
        Something went wrong connecting to the store. Refresh to try again.
      </div>`;
  }
}

async function addToCart(productId) {
  if (!currentUser) {
    showToast('Sign in to add items to your cart.', 'Sign in', 'login.html');
    return;
  }

  const product = allProducts.find((p) => p.id === productId);
  if (!product) return;

  const userRef = doc(db, 'users', currentUser.uid);
  const snap = await getDoc(userRef);
  const cart = snap.exists() ? (snap.data().cart || []) : [];

  const existing = cart.find((item) => item.productId === productId);
  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      productId,
      name: product.name,
      price: product.price,
      imageURL: product.imageURL || '',
      quantity: 1
    });
  }

  await updateDoc(userRef, { cart });

  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCountEl = document.getElementById('nav-cart-count');
  if (cartCountEl) {
    cartCountEl.textContent = String(totalCount);
    cartCountEl.style.display = 'inline-flex';
  }

  showToast(`${product.name} added to cart.`);
}

filterPills.forEach((pill) => {
  if (pill.dataset.category === activeCategory) {
    filterPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
  }
  pill.addEventListener('click', () => {
    filterPills.forEach((p) => p.classList.remove('active'));
    pill.classList.add('active');
    activeCategory = pill.dataset.category;
    applyFilters();
  });
});

grid?.addEventListener('click', (e) => {
  if (e.target.matches('.add-to-cart')) {
    addToCart(e.target.dataset.id);
  }
});

loadProducts();