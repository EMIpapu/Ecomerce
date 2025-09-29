// Datos del carrito y checkout
let cart = JSON.parse(localStorage.getItem('megamarket-cart')) || [];
let subtotal = 0;
let shipping = 15.00;
let tax = 0;
let discount = 0;
let total = 0;

// Códigos promocionales válidos
const promoCodes = {
    'DESCUENTO10': { type: 'percentage', value: 10, description: '10% de descuento' },
    'ENVIOGRATIS': { type: 'shipping', value: 0, description: 'Envío gratuito' },
    'BIENVENIDO': { type: 'fixed', value: 20, description: '$20 de descuento' }
};

// Inicialización
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si hay items en el carrito
    if (cart.length === 0) {
        alert('Tu carrito está vacío. Serás redirigido a la tienda.');
        window.location.href = 'index.html';
        return;
    }
    
    loadCheckoutItems();
    calculateTotals();
    setupEventListeners();
    setupFormValidation();
});

// Event listeners
function setupEventListeners() {
    // Cambio de método de pago
    document.querySelectorAll('input[name="paymentMethod"]').forEach(radio => {
        radio.addEventListener('change', togglePaymentDetails);
    });
    
    // Formateo de campos
    setupFieldFormatting();
}

// Cargar items del checkout
function loadCheckoutItems() {
    const checkoutItems = document.getElementById('checkoutItems');
    
    checkoutItems.innerHTML = cart.map(item => `
        <div class="checkout-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="checkout-item-info">
                <div class="checkout-item-name">${item.name}</div>
                <div class="checkout-item-details">Cantidad: ${item.quantity}</div>
            </div>
            <div class="checkout-item-price">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
        </div>
    `).join('');
}

// Calcular totales
function calculateTotals() {
    subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // Calcular impuestos (8.5%)
    tax = subtotal * 0.085;
    
    // Aplicar descuentos si los hay
    let finalSubtotal = subtotal - discount;
    let finalShipping = shipping;
    
    // Si hay descuento de envío gratis
    if (discount > 0 && shipping === 0) {
        finalShipping = 0;
    }
    
    total = finalSubtotal + finalShipping + tax;
    
    // Actualizar UI
    document.getElementById('subtotalAmount').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shippingAmount').textContent = `$${finalShipping.toFixed(2)}`;
    document.getElementById('taxAmount').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('totalAmount').textContent = `$${total.toFixed(2)}`;
    
    // Mostrar descuento si existe
    const discountElement = document.querySelector('.discount');
    if (discount > 0 && discountElement) {
        discountElement.style.display = 'flex';
        discountElement.querySelector('span:last-child').textContent = `-$${discount.toFixed(2)}`;
    }
}

// Aplicar código promocional
function applyPromoCode() {
    const promoInput = document.getElementById('promoInput');
    const code = promoInput.value.trim().toUpperCase();
    
    if (!code) {
        showNotification('Por favor ingresa un código promocional', 'warning');
        return;
    }
    
    if (promoCodes[code]) {
        const promo = promoCodes[code];
        let discountAmount = 0;
        
        switch (promo.type) {
            case 'percentage':
                discountAmount = subtotal * (promo.value / 100);
                break;
            case 'fixed':
                discountAmount = promo.value;
                break;
            case 'shipping':
                shipping = promo.value;
                break;
        }
        
        if (promo.type !== 'shipping') {
            discount = discountAmount;
            
            // Agregar línea de descuento si no existe
            const orderTotals = document.querySelector('.order-totals');
            let discountLine = orderTotals.querySelector('.discount');
            
            if (!discountLine) {
                discountLine = document.createElement('div');
                discountLine.className = 'discount';
                discountLine.innerHTML = `
                    <span>Descuento (${code}):</span>
                    <span>-$${discountAmount.toFixed(2)}</span>
                `;
                orderTotals.insertBefore(discountLine, orderTotals.querySelector('.total'));
            } else {
                discountLine.innerHTML = `
                    <span>Descuento (${code}):</span>
                    <span>-$${discountAmount.toFixed(2)}</span>
                `;
            }
        }
        
        calculateTotals();
        promoInput.value = '';
        promoInput.disabled = true;
        promoInput.placeholder = 'Código aplicado';
        
        showNotification(`Código aplicado: ${promo.description}`, 'success');
    } else {
        showNotification('Código promocional inválido', 'error');
    }
}

// Toggle detalles de pago
function togglePaymentDetails() {
    const cardDetails = document.getElementById('cardDetails');
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;
    
    if (paymentMethod === 'credit') {
        cardDetails.classList.remove('hidden');
        // Hacer campos requeridos
        cardDetails.querySelectorAll('input').forEach(input => {
            input.required = true;
        });
    } else {
        cardDetails.classList.add('hidden');
        // Remover requerimientos
        cardDetails.querySelectorAll('input').forEach(input => {
            input.required = false;
        });
    }
}

// Configurar formateo de campos
function setupFieldFormatting() {
    // Formatear número de tarjeta
    const cardNumberInput = document.getElementById('cardNumber');
    if (cardNumberInput) {
        cardNumberInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '').replace(/[^0-9]/gi, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }
    
    // Formatear fecha de expiración
    const expiryInput = document.getElementById('expiryDate');
    if (expiryInput) {
        expiryInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
    
    // Solo números para CVV
    const cvvInput = document.getElementById('cvv');
    if (cvvInput) {
        cvvInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/\D/g, '');
        });
    }
    
    // Solo números para teléfono
    const phoneInput = document.getElementById('phone');
    if (phoneInput) {
        phoneInput.addEventListener('input', function(e) {
            e.target.value = e.target.value.replace(/[^0-9+\-\(\)\s]/g, '');
        });
    }
}

// Configurar validación del formulario
function setupFormValidation() {
    const form = document.getElementById('checkoutForm');
    const inputs = form.querySelectorAll('input[required], select[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', validateField);
        input.addEventListener('input', clearFieldError);
    });
}

// Validar campo individual
function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    
    // Remover mensajes de error previos
    clearFieldError(event);
    
    if (!value && field.required) {
        showFieldError(field, 'Este campo es requerido');
        return false;
    }
    
    // Validaciones específicas
    switch (field.type) {
        case 'email':
            if (value && !isValidEmail(value)) {
                showFieldError(field, 'Por favor ingresa un email válido');
                return false;
            }
            break;
        case 'tel':
            if (value && !isValidPhone(value)) {
                showFieldError(field, 'Por favor ingresa un teléfono válido');
                return false;
            }
            break;
    }
    
    // Validaciones específicas por ID
    if (field.id === 'cardNumber' && value) {
        if (!isValidCardNumber(value)) {
            showFieldError(field, 'Número de tarjeta inválido');
            return false;
        }
    }
    
    if (field.id === 'expiryDate' && value) {
        if (!isValidExpiryDate(value)) {
            showFieldError(field, 'Fecha de expiración inválida');
            return false;
        }
    }
    
    if (field.id === 'cvv' && value) {
        if (!isValidCVV(value)) {
            showFieldError(field, 'CVV inválido');
            return false;
        }
    }
    
    return true;
}

// Limpiar error de campo
function clearFieldError(event) {
    const field = event.target;
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
    field.classList.remove('error');
}

// Mostrar error de campo
function showFieldError(field, message) {
    field.classList.add('error');
    
    let errorElement = field.parentNode.querySelector('.field-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.style.color = '#e74c3c';
        errorElement.style.fontSize = '0.8rem';
        errorElement.style.marginTop = '0.25rem';
        field.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
}

// Validaciones
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function isValidPhone(phone) {
    const phoneRegex = /^[\+]?[0-9\-\(\)\s]{8,}$/;
    return phoneRegex.test(phone);
}

function isValidCardNumber(number) {
    const cleanNumber = number.replace(/\s/g, '');
    return cleanNumber.length >= 13 && cleanNumber.length <= 19;
}

function isValidExpiryDate(date) {
    const [month, year] = date.split('/');
    const currentYear = new Date().getFullYear() % 100;
    const currentMonth = new Date().getMonth() + 1;
    
    if (!month || !year) return false;
    
    const expMonth = parseInt(month);
    const expYear = parseInt(year);
    
    if (expMonth < 1 || expMonth > 12) return false;
    if (expYear < currentYear) return false;
    if (expYear === currentYear && expMonth < currentMonth) return false;
    
    return true;
}

function isValidCVV(cvv) {
    return cvv.length >= 3 && cvv.length <= 4;
}

// Procesar pago
function processPayment(event) {
    event.preventDefault();
    
    // Validar formulario
    const form = event.target;
    const requiredFields = form.querySelectorAll('input[required], select[required]');
    let isValid = true;
    
    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Por favor corrige los errores en el formulario', 'error');
        return;
    }
    
    // Verificar términos y condiciones
    if (!document.getElementById('terms').checked) {
        showNotification('Debes aceptar los términos y condiciones', 'warning');
        return;
    }
    
    // Mostrar loading
    const loadingOverlay = document.getElementById('loadingOverlay');
    loadingOverlay.classList.add('active');
    
    // Simular procesamiento de pago
    setTimeout(() => {
        processPaymentSuccess();
    }, 3000);
}

// Pago exitoso
function processPaymentSuccess() {
    // Generar número de orden
    const orderNumber = 'MP' + Date.now().toString().slice(-8);
    
    // Guardar datos de la orden
    const orderData = {
        orderNumber: orderNumber,
        items: cart,
        customer: {
            firstName: document.getElementById('firstName').value,
            lastName: document.getElementById('lastName').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value
        },
        shipping: {
            address: document.getElementById('address').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            zipCode: document.getElementById('zipCode').value,
            country: document.getElementById('country').value
        },
        payment: {
            method: document.querySelector('input[name="paymentMethod"]:checked').value,
            amount: total
        },
        date: new Date().toISOString()
    };
    
    localStorage.setItem('megamarket-last-order', JSON.stringify(orderData));
    
    // Limpiar carrito
    localStorage.removeItem('megamarket-cart');
    
    // Ocultar loading
    document.getElementById('loadingOverlay').classList.remove('active');
    
    // Mostrar página de confirmación
    window.location.href = `confirmation.html?order=${orderNumber}`;
}

// Volver al carrito
function goBack() {
    window.location.href = 'index.html';
}

// Mostrar notificaciones
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas ${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;
    
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
    
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    setTimeout(() => {
        notification.style.transform = 'translateX(300px)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
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

// CSS adicional para errores
const errorStyles = `
    .form-group input.error,
    .form-group select.error {
        border-color: #e74c3c !important;
        background-color: rgba(231, 76, 60, 0.1);
    }
    
    .field-error {
        color: #e74c3c;
        font-size: 0.8rem;
        margin-top: 0.25rem;
        display: block;
    }
`;

const styleSheet = document.createElement('style');
styleSheet.textContent = errorStyles;
document.head.appendChild(styleSheet);