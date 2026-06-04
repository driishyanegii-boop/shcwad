// Cart Management
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
}

// Update cart count in header
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => el.textContent = cartCount);
}

// Add to cart
function addToCart(product) {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification('Item added to cart!');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    if (window.location.pathname.includes('cart.html')) {
        loadCart();
    }
}

// Update quantity
function updateQuantity(productId, newQuantity) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        if (newQuantity <= 0) {
            removeFromCart(productId);
        } else {
            item.quantity = newQuantity;
            saveCart();
            if (window.location.pathname.includes('cart.html')) {
                loadCart();
            }
        }
    }
}

// Show notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: #2563eb;
        color: white;
        padding: 1rem 2rem;
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notification.remove(), 300);
    }, 2000);
}

// Generate star rating HTML
function generateStars(rating) {
    let starsHTML = '<div class="stars">';
    for (let i = 1; i <= 5; i++) {
        if (i <= Math.floor(rating)) {
            starsHTML += '<span class="star">★</span>';
        } else {
            starsHTML += '<span class="star empty">★</span>';
        }
    }
    starsHTML += '</div>';
    return starsHTML;
}

// Create product card HTML
function createProductCard(product) {
    return `
        <div class="product-card" onclick="window.location.href='product.html?id=${product.id}'">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    ${generateStars(product.rating)}
                    <span class="reviews-count">(${product.reviews})</span>
                </div>
                <div class="product-footer">
                    <span class="product-price">$${product.price.toFixed(2)}</span>
                    <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        Add to Cart
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load featured products on home page
function loadFeaturedProducts() {
    const container = document.getElementById('featuredProducts');
    if (container) {
        const featured = products.slice(0, 4);
        container.innerHTML = featured.map(product => createProductCard(product)).join('');
    }
}

// Load all products on men's page
function loadAllProducts() {
    const container = document.getElementById('allProducts');
    const sortSelect = document.getElementById('sortSelect');
    
    if (container) {
        let sortedProducts = [...products];
        
        if (sortSelect) {
            sortSelect.addEventListener('change', () => {
                const sortValue = sortSelect.value;
                
                switch(sortValue) {
                    case 'price-low':
                        sortedProducts.sort((a, b) => a.price - b.price);
                        break;
                    case 'price-high':
                        sortedProducts.sort((a, b) => b.price - a.price);
                        break;
                    case 'rating':
                        sortedProducts.sort((a, b) => b.rating - a.rating);
                        break;
                    default:
                        sortedProducts = [...products];
                }
                
                container.innerHTML = sortedProducts.map(product => createProductCard(product)).join('');
            });
        }
        
        container.innerHTML = sortedProducts.map(product => createProductCard(product)).join('');
    }
}

// Load product detail page
function loadProductDetail() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    const product = products.find(p => p.id === productId);
    const container = document.getElementById('productDetail');
    const breadcrumb = document.getElementById('breadcrumbProduct');
    
    if (!product || !container) return;
    
    if (breadcrumb) {
        breadcrumb.textContent = product.name;
    }
    
    let selectedSize = '';
    let selectedColor = '';
    let quantity = 1;
    
    container.innerHTML = `
        <div class="product-detail-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-detail-info">
            <h1>${product.name}</h1>
            <div class="detail-rating">
                ${generateStars(product.rating)}
                <span>${product.rating} (${product.reviews} reviews)</span>
            </div>
            <div class="detail-price">$${product.price.toFixed(2)}</div>
            <p class="product-description">${product.description}</p>
            
            ${product.sizes.length > 0 ? `
                <div class="size-selector">
                    <label>Select Size</label>
                    <div class="size-options" id="sizeOptions">
                        ${product.sizes.map(size => `
                            <button class="size-option" data-size="${size}">${size}</button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            ${product.colors.length > 0 ? `
                <div class="color-selector">
                    <label>Select Color</label>
                    <div class="color-options" id="colorOptions">
                        ${product.colors.map(color => `
                            <button class="color-option" data-color="${color}">${color}</button>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <div class="quantity-selector">
                <label>Quantity</label>
                <div class="quantity-controls">
                    <button class="quantity-btn" id="decreaseQty">-</button>
                    <span class="quantity-value" id="quantityValue">1</span>
                    <button class="quantity-btn" id="increaseQty">+</button>
                </div>
            </div>
            
            <button class="btn btn-primary btn-block" id="addToCartDetail">Add to Cart</button>
            
            <div class="product-features">
                <div class="feature-item">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                    <span>Free shipping on orders over $100</span>
                </div>
                <div class="feature-item">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                    </svg>
                    <span>30-day easy returns</span>
                </div>
                <div class="feature-item">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                    </svg>
                    <span>1-year warranty</span>
                </div>
            </div>
        </div>
    `;
    
    // Size selection
    const sizeOptions = container.querySelectorAll('.size-option');
    sizeOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            sizeOptions.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedSize = btn.dataset.size;
        });
    });
    
    // Color selection
    const colorOptions = container.querySelectorAll('.color-option');
    colorOptions.forEach(btn => {
        btn.addEventListener('click', () => {
            colorOptions.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedColor = btn.dataset.color;
        });
    });
    
    // Quantity controls
    const decreaseBtn = container.querySelector('#decreaseQty');
    const increaseBtn = container.querySelector('#increaseQty');
    const quantityValue = container.querySelector('#quantityValue');
    
    decreaseBtn.addEventListener('click', () => {
        if (quantity > 1) {
            quantity--;
            quantityValue.textContent = quantity;
        }
    });
    
    increaseBtn.addEventListener('click', () => {
        quantity++;
        quantityValue.textContent = quantity;
    });
    
    // Add to cart
    container.querySelector('#addToCartDetail').addEventListener('click', () => {
        for (let i = 0; i < quantity; i++) {
            addToCart(product);
        }
        window.location.href = 'cart.html';
    });
    
    // Load related products
    loadRelatedProducts(product);
}

// Load related products
function loadRelatedProducts(currentProduct) {
    const relatedContainer = document.getElementById('relatedProducts');
    const relatedSection = document.getElementById('relatedSection');
    
    if (relatedContainer && relatedSection) {
        const related = products
            .filter(p => p.category === currentProduct.category && p.id !== currentProduct.id)
            .slice(0, 4);
        
        if (related.length > 0) {
            relatedSection.style.display = 'block';
            relatedContainer.innerHTML = related.map(product => createProductCard(product)).join('');
        }
    }
}

// Load cart page
function loadCart() {
    const emptyCart = document.getElementById('emptyCart');
    const cartContent = document.getElementById('cartContent');
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        emptyCart.style.display = 'block';
        cartContent.style.display = 'none';
        return;
    }
    
    emptyCart.style.display = 'none';
    cartContent.style.display = 'grid';
    
    // Render cart items
    cartItemsContainer.innerHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}">
            </div>
            <div class="cart-item-details">
                <h3><a href="product.html?id=${item.id}">${item.name}</a></h3>
                ${item.size ? `<div class="cart-item-size">Size: ${item.size}</div>` : ''}
                <div class="cart-item-price">$${item.price.toFixed(2)}</div>
                <div class="cart-item-actions">
                    <div class="item-quantity">
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity - 1})">-</button>
                        <span class="qty-value">${item.quantity}</span>
                        <button class="qty-btn" onclick="updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
                    </div>
                    <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Calculate totals
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 100 ? 0 : 10;
    const tax = subtotal * 0.1;
    const total = subtotal + shipping + tax;
    
    document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
    document.getElementById('shipping').textContent = shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`;
    document.getElementById('tax').textContent = `$${tax.toFixed(2)}`;
    document.getElementById('total').textContent = `$${total.toFixed(2)}`;
    
    // Free shipping notice
    const freeShippingNotice = document.getElementById('freeShippingNotice');
    if (subtotal < 100) {
        freeShippingNotice.style.display = 'block';
        freeShippingNotice.textContent = `Add $${(100 - subtotal).toFixed(2)} more to get free shipping!`;
    } else {
        freeShippingNotice.style.display = 'none';
    }
}

// Mobile menu toggle
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuBtn && navLinks) {
        mobileMenuBtn.addEventListener('click', () => {
            navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
            navLinks.style.flexDirection = 'column';
            navLinks.style.position = 'absolute';
            navLinks.style.top = '100%';
            navLinks.style.left = '0';
            navLinks.style.right = '0';
            navLinks.style.background = 'white';
            navLinks.style.padding = '1rem';
            navLinks.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        });
    }
}

// Add CSS for animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    initMobileMenu();
    
    // Load content based on current page
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/')) {
        loadFeaturedProducts();
    } else if (window.location.pathname.includes('men.html')) {
        loadAllProducts();
    } else if (window.location.pathname.includes('product.html')) {
        loadProductDetail();
    } else if (window.location.pathname.includes('cart.html')) {
        loadCart();
    }
});
