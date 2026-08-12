import { db } from './firebase-config.js';
import { collection, getDocs, query, limit } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

const grid = document.getElementById('featured-grid');

function currency(n) {
  return `$${Number(n).toFixed(2)}`;
}

async function loadFeatured() {
  if (!grid) return;
  grid.innerHTML = `<div class="state-message"><strong>Loading…</strong></div>`;

  try {
    const q = query(collection(db, 'products'), limit(4));
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));

    if (products.length === 0) {
      grid.innerHTML = '';
      return;
    }

    grid.innerHTML = products.map((p) => `
      <div class="product-card" data-id="${p.id}">
        <div class="product-image">
          ${p.imageURL ? `<img src="${p.imageURL}" alt="${p.name}" loading="lazy">` : ''}
        </div>
        <div class="product-info">
          <span class="product-category">${p.category || ''}</span>
          <div class="product-name">${p.name}</div>
          <div class="product-footer">
            <span class="product-price">${currency(p.price)}</span>
            <a href="shop.html" class="add-to-cart">View</a>
          </div>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error('Failed to load featured products:', err);
    grid.innerHTML = '';
  }
}

loadFeatured();