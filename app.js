const PRODUCTS = [
  { id: '1', name: 'Hamburguesa Clásica', price: 20000, icon: '🍔' },
  { id: '2', name: 'Hamburguesa Doble', price: 40000, icon: '🍔' },
  { id: '3', name: 'Papas Fritas', price: 4000, icon: '🍟' },
  { id: '4', name: 'Gaseosa 500ml', price: 6000, icon: '🥤' },
  { id: '5', name: 'Alitas x6', price: 25000, icon: '' },
  { id: '6', name: 'Refresco Natural', price: 2000, icon: '🍹' }
];

let cart = JSON.parse(localStorage.getItem('renaciendo_cart')) || [];

function renderCatalog() {
  const container = document.getElementById('catalog');
  container.innerHTML = PRODUCTS.map(p => `
    <div class="product-card" onclick="addToCart('${p.id}')">
      <div class="product-icon">${p.icon}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${p.price.toFixed(2)}</div>
      <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">+ Agregar</button>
    </div>
  `).join('');
}

function addToCart(id) {
  const product = PRODUCTS.find(p => p.id === id);
  const existing = cart.find(i => i.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateUI();
}

function updateQty(id, delta) {
  const item = cart.find(i => i.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) {
    cart = cart.filter(i => i.id !== id);
  }
  saveCart();
  updateUI();
}

function saveCart() {
  localStorage.setItem('renaciendo_cart', JSON.stringify(cart));
}

function updateUI() {
  const count = cart.reduce((sum, item) => sum + item.qty, 0);
  document.getElementById('cartCount').textContent = count;
  
  const cartItems = document.getElementById('cartItems');
  const watermark = document.getElementById('emptyWatermark');
  
  if (cart.length === 0) {
    cartItems.innerHTML = '';
    watermark.style.display = 'block';
  } else {
    watermark.style.display = 'none';
    cartItems.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="item-info">
          <span class="item-icon">${item.icon}</span>
          <div>
            <div class="item-name">${item.name}</div>
            <div style="font-size: 0.85rem; color: #757575;">$${item.price.toFixed(2)} c/u</div>
          </div>
        </div>
        <div class="item-qty-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span class="item-qty">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
        </div>
        <div class="item-total">$${(item.price * item.qty).toFixed(2)}</div>
      </div>
    `).join('');
  }
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('totalPrice').textContent = total.toFixed(2);
  document.getElementById('checkoutBtn').disabled = cart.length === 0;
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
}

function checkout() {
  if (cart.length === 0) return;
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  alert(`✅ Pedido Registrado\n\nTotal: $${total.toFixed(2)}\nProductos: ${cart.length}\n\n¡Gracias por su compra!`);
  
  cart = [];
  saveCart();
  updateUI();
  toggleCart();
}

// Inicializar
renderCatalog();
updateUI();

// Ocultar splash screen
window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
  }, 1800);
});