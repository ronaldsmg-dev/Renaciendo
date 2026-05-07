// ================= CONFIGURACIÓN DE PRODUCTOS =================
const PRODUCTS = [
  { id: '1', name: 'Arepa con chorizo', price: 4500, icon: '🫓' },
  { id: '2', name: 'Arepa c/c y queso', price: 5500, icon: '🫓' },
  { id: '3', name: 'Arepa con queso', price: 4500, icon: '🧀' },
  { id: '4', name: 'Arepa burguer', price: 7500, icon: '🍔' },
  { id: '5', name: 'Perro', price: 9000, icon: '🌭' },
  { id: '6', name: 'Choriperro', price: 9000, icon: '🔥' }
];

// ================= ESTADO DEL CARRITO =================
let cart = JSON.parse(localStorage.getItem('renaciendo_cart')) || [];

// ================= RENDERIZADO DEL CATÁLOGO =================
function renderCatalog() {
  const container = document.getElementById('catalog');
  container.innerHTML = PRODUCTS.map(p => `
    <div class="product-card" onclick="addToCart('${p.id}')">
      <div class="product-icon">${p.icon}</div>
      <div class="product-name">${p.name}</div>
      <div class="product-price">$${p.price.toLocaleString('es-CO')}</div>
      <button class="add-btn" onclick="event.stopPropagation(); addToCart('${p.id}')">+ Agregar</button>
    </div>
  `).join('');
}

// ================= OPERACIONES DEL CARRITO =================
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
            <div style="font-size: 0.85rem; color: #757575;">$${item.price.toLocaleString('es-CO')} c/u</div>
          </div>
        </div>
        <div class="item-qty-controls">
          <button class="qty-btn" onclick="updateQty('${item.id}', -1)">−</button>
          <span class="item-qty">${item.qty}</span>
          <button class="qty-btn" onclick="updateQty('${item.id}', 1)">+</button>
        </div>
        <div class="item-total">$${(item.price * item.qty).toLocaleString('es-CO')}</div>
      </div>
    `).join('');
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('totalPrice').textContent = '$' + total.toLocaleString('es-CO');
  document.getElementById('checkoutBtn').disabled = cart.length === 0;
}

function toggleCart() {
  document.getElementById('cartPanel').classList.toggle('open');
}

// ================= COBRO E IMPRESIÓN =================
function checkout() {
  if (cart.length === 0) return;

  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // 🔥 Registra la venta en el reporte diario
  recordSale(total);

  // Genera el ticket HTML
  const fecha = new Date().toLocaleString('es-ES');
  const receiptDiv = document.getElementById('receipt');

  receiptDiv.innerHTML = `
    <div style="text-align:center;margin-bottom:5px;">
      <strong style="font-size:13px;">RENACIENDO DE LAS CENIZAS</strong><br>
      <span style="font-size:10px;">Fast Food & Grill</span><br>
      --------------------------------
    </div>
    ${cart.map(i => `
      <div style="margin:1px 0;font-size:10px;">
        ${i.qty}x ${i.name}
        <span style="float:right;">$${(i.price * i.qty).toLocaleString('es-CO')}</span>
      </div>
    `).join('')}
    --------------------------------
    <div style="display:flex;justify-content:space-between;font-weight:bold;font-size:12px;margin:3px 0;">
      <span>TOTAL</span>
      <span>$${total.toLocaleString('es-CO')}</span>
    </div>
    <br>
    <div style="text-align:center;font-size:9px;">
      ${fecha}<br>
      Cajero: Turno Actual<br>
      ¡Gracias por su compra! 🔥<br>
      --------------------------------
    </div>
  `;

  // ✅ Imprime con pequeño delay para asegurar renderizado del DOM
  setTimeout(() => {
    window.print();

    // Limpia el carrito después de imprimir
    setTimeout(() => {
      cart = [];
      saveCart();
      updateUI();
      toggleCart();
    }, 500);
  }, 100);
}

// ================= CONTROL DE VENTAS DIARIAS =================
function getTodayKey() {
  return new Date().toISOString().split('T')[0]; // Formato YYYY-MM-DD
}

function getDailySales() {
  const data = JSON.parse(localStorage.getItem('renaciendo_daily_sales')) || {};
  const today = getTodayKey();
  if (!data[today]) {
    data[today] = { total: 0, count: 0, transactions: [] };
  }
  return data;
}

function saveDailySales(data) {
  localStorage.setItem('renaciendo_daily_sales', JSON.stringify(data));
}

function recordSale(total) {
  const data = getDailySales();
  const today = getTodayKey();
  data[today].total += total;
  data[today].count += 1;
  data[today].transactions.push({
    time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
    total: total
  });
  saveDailySales(data);
}

function openSalesReport() {
  const data = getDailySales();
  const today = getTodayKey();
  const todayData = data[today];

  document.getElementById('dailyTotal').textContent = '$' + todayData.total.toLocaleString('es-CO');
  document.getElementById('dailyCount').textContent = todayData.count;
  document.getElementById('dailyAvg').textContent = todayData.count > 0
    ? '$' + Math.round(todayData.total / todayData.count).toLocaleString('es-CO')
    : '$0';

  const list = document.getElementById('salesList');
  if (todayData.transactions.length === 0) {
    list.innerHTML = '<p class="empty-sales">No hay ventas registradas hoy</p>';
  } else {
    list.innerHTML = todayData.transactions
      .slice()
      .reverse()
      .map(t => `
        <div class="sale-item">
          <span class="sale-time">${t.time}</span>
          <span class="sale-total">$${t.total.toLocaleString('es-CO')}</span>
        </div>
      `).join('');
  }

  document.getElementById('salesPanel').classList.add('open');
}

function closeSalesReport() {
  document.getElementById('salesPanel').classList.remove('open');
}

function clearDailySales() {
  if (!confirm('¿Reiniciar el registro de ventas de hoy? Esta acción no se puede deshacer.')) return;
  const data = getDailySales();
  const today = getTodayKey();
  data[today] = { total: 0, count: 0, transactions: [] };
  saveDailySales(data);
  openSalesReport();
}

// ================= INICIALIZACIÓN =================
renderCatalog();
updateUI();

window.addEventListener('load', () => {
  setTimeout(() => {
    document.getElementById('splash').classList.add('hidden');
  }, 1800);
});