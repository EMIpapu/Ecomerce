// Datos de productos basados en las imágenes disponibles
const products = [
    {
        id: 1,
        name: "Difusor de Aceites Esenciales",
        category: "hogar",
        price: 89.99,
        image: "imgs/difusor-de-aceites.webp",
        description: "Difusor ultrasónico con luces LED, perfecto para aromaterapia y relajación en el hogar.",
        rating: 4.5,
        stock: 15
    },
    {
        id: 2,
        name: "Hidrolavadora RYOBI",
        category: "herramientas",
        price: 299.99,
        image: "imgs/hidrolavadora-ryobi.webp",
        description: "Potente hidrolavadora eléctrica de alta presión, ideal para limpieza de exteriores.",
        rating: 4.7,
        stock: 8
    },
    {
        id: 3,
        name: "iPad con chip A16",
        category: "electronica",
        price: 899.99,
        image: "imgs/ipad-a16.webp",
        description: "Tablet de última generación con chip A16 Bionic, pantalla Liquid Retina de 10.9 pulgadas.",
        rating: 4.8,
        stock: 12
    },
    {
        id: 4,
        name: "Juego de Dados Premium",
        category: "hogar",
        price: 24.99,
        image: "imgs/juego-de-dados.webp",
        description: "Set completo de dados de alta calidad para juegos de mesa y entretenimiento familiar.",
        rating: 4.3,
        stock: 25
    },
    {
        id: 5,
        name: "OPPO Find N5 5G",
        category: "electronica",
        price: 1299.99,
        image: "imgs/oppo-find-n5.webp",
        description: "Smartphone plegable de última generación con tecnología 5G y cámara profesional.",
        rating: 4.6,
        stock: 6
    },
    {
        id: 6,
        name: "Perfume Adolfo Domínguez Ámbar Negro",
        category: "belleza",
        price: 79.99,
        image: "imgs/perfume-adolfo-dominguez-ambar-negro.webp",
        description: "Fragancia masculina elegante y sofisticada con notas amaderadas y especiadas.",
        rating: 4.4,
        stock: 20
    }
];

// Estado de la aplicación
let cart = JSON.parse(localStorage.getItem('megamarket-cart')) || [];
let filteredProducts = [...products];
let currentView = 'grid';

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    displayProducts(products);
    updateCartUI();
    setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
    // Búsqueda en tiempo real
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('input', handleSearch);
    
    // Click fuera del modal para cerrar
    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) {
            toggleCart();
        }
    });
}

// Mostrar productos
function displayProducts(productsToShow) {
    const productsGrid = document.getElementById('productsGrid');
    
    if (productsToShow.length === 0) {
        productsGrid.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem;">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--text-light); margin-bottom: 1rem;"></i>
                <h3>No se encontraron productos</h3>
                <p>Intenta con otros términos de búsqueda</p>
            </div>
        `;
        return;
    }
    
    productsGrid.innerHTML = productsToShow.map(product => `
        <div class="product-card" data-category="${product.category}">
            <img src="${product.image}" alt="${product.name}" class="product-image" loading="lazy">
            <div class="product-info">
                <div class="product-category">${getCategoryName(product.category)}</div>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="rating-text">(${product.rating})</span>
                </div>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${product.stock < 5 ? 'low-stock' : ''}">
                    ${product.stock < 5 ? '¡Últimas unidades!' : `${product.stock} disponibles`}
                </div>
                <div class="product-actions">
                    <button class="add-to-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i> Agregar al carrito
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Generar estrellas de rating
function generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    let starsHTML = '';
    
    for (let i = 0; i < fullStars; i++) {
        starsHTML += '<i class="fas fa-star"></i>';
    }
    
    if (hasHalfStar) {
        starsHTML += '<i class="fas fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
        starsHTML += '<i class="far fa-star"></i>';
    }
    
    return `<div class="product-stars">${starsHTML}</div>`;
}

// Obtener nombre de categoría en español
function getCategoryName(category) {
    const categoryNames = {
        'electronica': 'Electrónicos',
        'hogar': 'Hogar & Jardín',
        'belleza': 'Belleza & Cuidado',
        'herramientas': 'Herramientas'
    };
    return categoryNames[category] || category;
}

// Filtrar productos por categoría
function filterProducts(category) {
    if (category === 'all') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => product.category === category);
    }
    displayProducts(filteredProducts);
    
    // Actualizar estado activo del menú
    document.querySelectorAll('.nav-menu a').forEach(link => {
        link.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Búsqueda de productos
function handleSearch(event) {
    const query = event.target.value.toLowerCase().trim();
    
    if (query === '') {
        filteredProducts = [...products];
    } else {
        filteredProducts = products.filter(product => 
            product.name.toLowerCase().includes(query) ||
            product.description.toLowerCase().includes(query) ||
            getCategoryName(product.category).toLowerCase().includes(query)
        );
    }
    
    displayProducts(filteredProducts);
}

// Ordenar productos
function sortProducts() {
    const sortValue = document.getElementById('sortSelect').value;
    
    switch (sortValue) {
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
        case 'name':
            filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
            break;
        case 'rating':
            filteredProducts.sort((a, b) => b.rating - a.rating);
            break;
        default:
            filteredProducts = [...products];
    }
    
    displayProducts(filteredProducts);
}

// Cambiar vista (grid/lista)
function changeView(view) {
    currentView = view;
    const productsGrid = document.getElementById('productsGrid');
    
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    event.target.classList.add('active');
    
    if (view === 'list') {
        productsGrid.classList.add('list-view');
    } else {
        productsGrid.classList.remove('list-view');
    }
}

// Agregar al carrito
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    if (!product) return;
    
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity += 1;
            showNotification(`Se agregó otra unidad de ${product.name} al carrito`, 'success');
        } else {
            showNotification('No hay más stock disponible', 'warning');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1,
            stock: product.stock
        });
        showNotification(`${product.name} agregado al carrito`, 'success');
    }
    
    updateCartUI();
    saveCart();
    
    // Animación del botón
    const button = event.target;
    const originalContent = button.innerHTML;
    button.innerHTML = '<i class="fas fa-check"></i> ¡Agregado!';
    button.style.background = '#27ae60';
    button.style.transform = 'scale(0.95)';
    
    setTimeout(() => {
        button.innerHTML = originalContent;
        button.style.background = '';
        button.style.transform = '';
    }, 2000);
}


// Toggle carrito
function toggleCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.toggle('active');
    
    if (cartModal.classList.contains('active')) {
        displayCartItems();
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = '';
    }
}

// Mostrar items del carrito
function displayCartItems() {
    const cartItems = document.getElementById('cartItems');
    
    if (cart.length === 0) {
        cartItems.innerHTML = '<p class="empty-cart">Tu carrito está vacío</p>';
        return;
    }
    
    cartItems.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="cart-item-info">
                <div class="cart-item-title">${item.name}</div>
                <div class="cart-item-price">$${item.price.toFixed(2)} c/u</div>
            </div>
            <div class="quantity-controls">
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                <span class="quantity">${item.quantity}</span>
                <button class="quantity-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <div class="item-total">$${(item.price * item.quantity).toFixed(2)}</div>
            <button class="remove-item" onclick="removeFromCart(${item.id})">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `).join('');
}

// Actualizar cantidad en carrito
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (!item) return;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (newQuantity > item.stock) {
        showNotification('No hay suficiente stock disponible', 'warning');
        return;
    }
    
    item.quantity = newQuantity;
    updateCartUI();
    displayCartItems();
    saveCart();
}

// Remover del carrito
function removeFromCart(productId) {
    const index = cart.findIndex(item => item.id === productId);
    if (index > -1) {
        const item = cart[index];
        cart.splice(index, 1);
        showNotification(`${item.name} removido del carrito`, 'info');
        updateCartUI();
        displayCartItems();
        saveCart();
    }
}

// Actualizar UI del carrito
function updateCartUI() {
    const cartCount = document.getElementById('cartCount');
    const cartTotal = document.getElementById('cartTotal');
    
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    cartCount.textContent = totalItems;
    cartTotal.textContent = totalPrice.toFixed(2);
    
    // Animación del contador
    if (totalItems > 0) {
        cartCount.style.transform = 'scale(1.2)';
        setTimeout(() => {
            cartCount.style.transform = 'scale(1)';
        }, 300);
    }
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('megamarket-cart', JSON.stringify(cart));
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
    // Estilos para la notificación
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: 'var(--border-radius)',
        boxShadow: 'var(--shadow-hover)',
        zIndex: '3000',
        transform: 'translateX(300px)',
        transition: 'transform 0.3s ease-in-out'
    });
    
    document.body.appendChild(notification);
    
    // Animar entrada
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Animar salida y remover
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function getNotificationIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-times-circle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getNotificationColor(type) {
    const colors = {
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db'
    };
    return colors[type] || colors.info;
}

// Efectos adicionales
document.addEventListener('DOMContentLoaded', function() {
    // Animación de scroll suave para enlaces
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Efecto parallax suave en el hero
    window.addEventListener('scroll', () => {
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrolled = window.pageYOffset;
            hero.style.transform = `translateY(${scrolled * 0.3}px)`;
        }
    });
    
    // Lazy loading mejorado para imágenes
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    
    document.querySelectorAll('.product-image').forEach(img => {
        imageObserver.observe(img);
    });
});

// Agregar estilos dinámicos adicionales
const additionalStyles = `
    .product-stars {
        margin: 0.5rem 0;
        color: var(--accent-color);
    }
    
    .product-stock {
        font-size: 0.9rem;
        margin-bottom: 1rem;
        font-weight: 500;
        color: var(--text-light);
    }
    
    .product-stock.low-stock {
        color: var(--primary-color);
        font-weight: bold;
    }
    
    .rating-text {
        margin-left: 0.5rem;
        color: var(--text-light);
        font-size: 0.9rem;
    }
    
    .remove-item {
        background: none;
        border: none;
        color: var(--primary-color);
        cursor: pointer;
        padding: 5px;
        border-radius: var(--border-radius);
        transition: all 0.3s;
    }
    
    .remove-item:hover {
        background: var(--primary-color);
        color: white;
    }
    
    .item-total {
        font-weight: bold;
        color: var(--primary-color);
        margin-right: 1rem;
    }
    
    .product-image.loaded {
        opacity: 1;
        transition: opacity 0.3s ease;
    }
`;

// Inyectar estilos adicionales
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Proceder al checkout
function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'warning');
        return;
    }
    // Asegurar que el carrito esté guardado
    saveCart();
    // Cerrar modal si está abierto y redirigir
    const cartModal = document.getElementById('cartModal');
    if (cartModal && cartModal.classList.contains('active')) {
        cartModal.classList.remove('active');
        document.body.style.overflow = '';
    }
    window.location.href = 'checkout.html';
}
