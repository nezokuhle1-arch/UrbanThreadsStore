import {db} from '../firebase-config.js';
import {collection, getDocs } from 'https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js';

const grid = document.getElementById('product-grid');
const filterPills = document.querySelectorAll('.filter-pill'); /* Filter pills */

let allProducts = [];

const params = new URLSearchParams(window.location.search);
let activeCategory = params.get('category') || 'all';
const searchQuery = (params.get('search') || '').trim().toLowerCase();

function currency(n) {
    return '$${Number(n).toFixed(2)}';
}

function renderProducts(list) {
    grid.innerHTML = `
    <div class="state-message">
        <strong>No products found</strong>
        Try adjusting your search or filter settings.
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
      console.log('Add to cart:', e.target.dataset.id, '— cart.js not wired yet');
    }
  });
  
  loadProducts();
