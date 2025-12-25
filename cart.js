// Gestion du panier
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cartItems')) || [];
        this.init();
    }
    
    init() {
        this.renderCart();
        this.updateCartCount();
    }
    
    addItem(item) {
        // Vérifier si l'article existe déjà
        const existingItem = this.items.find(i => i.id === item.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                ...item,
                quantity: 1
            });
        }
        
        this.save();
        this.renderCart();
        this.updateCartCount();
        this.showNotification(`${item.name} ajouté au panier`);
    }
    
    removeItem(itemId) {
        this.items = this.items.filter(item => item.id !== itemId);
        this.save();
        this.renderCart();
        this.updateCartCount();
    }
    
    updateQuantity(itemId, quantity) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(itemId);
            } else {
                item.quantity = quantity;
                this.save();
                this.renderCart();
                this.updateCartCount();
            }
        }
    }
    
    clear() {
        this.items = [];
        this.save();
        this.renderCart();
        this.updateCartCount();
    }
    
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    save() {
        localStorage.setItem('cartItems', JSON.stringify(this.items));
    }
    
    renderCart() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const emptyMessage = document.getElementById('empty-cart-message');
        
        if (!cartContainer) return;
        
        if (this.items.length === 0) {
            cartContainer.innerHTML = `
                <p class="text-center text-muted py-5" id="empty-cart-message">
                    Votre panier est vide
                </p>
            `;
            if (cartTotal) cartTotal.textContent = '0€';
            return;
        }
        
        let cartHTML = '';
        
        this.items.forEach(item => {
            cartHTML += `
                <div class="cart-item mb-3 p-3 border rounded" data-id="${item.id}">
                    <div class="d-flex justify-content-between align-items-start mb-2">
                        <div>
                            <h6 class="mb-1 fw-bold">${item.name}</h6>
                            <p class="text-muted small mb-0">${item.price}€ × ${item.quantity}</p>
                        </div>
                        <span class="fw-bold">${(item.price * item.quantity).toFixed(2)}€</span>
                    </div>
                    <div class="d-flex align-items-center justify-content-between">
                        <div class="input-group input-group-sm" style="width: 120px;">
                            <button class="btn btn-outline-secondary minus-btn" type="button">-</button>
                            <input type="number" class="form-control text-center quantity-input" 
                                   value="${item.quantity}" min="1" max="10">
                            <button class="btn btn-outline-secondary plus-btn" type="button">+</button>
                        </div>
                        <button class="btn btn-outline-danger btn-sm remove-btn">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        cartContainer.innerHTML = cartHTML;
        if (cartTotal) cartTotal.textContent = this.getTotal().toFixed(2) + '€';
        
        // Ajouter les événements
        this.addCartEventListeners();
    }
    
    addCartEventListeners() {
        // Boutons moins
        document.querySelectorAll('.minus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity - 1);
                }
            });
        });
        
        // Boutons plus
        document.querySelectorAll('.plus-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                const item = this.items.find(i => i.id === itemId);
                if (item) {
                    this.updateQuantity(itemId, item.quantity + 1);
                }
            });
        });
        
        // Input quantité
        document.querySelectorAll('.quantity-input').forEach(input => {
            input.addEventListener('change', (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                const quantity = parseInt(e.target.value);
                if (!isNaN(quantity)) {
                    this.updateQuantity(itemId, quantity);
                }
            });
        });
        
        // Boutons supprimer
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.closest('.cart-item').dataset.id;
                this.removeItem(itemId);
            });
        });
    }
    
    updateCartCount() {
        const totalItems = this.items.reduce((total, item) => total + item.quantity, 0);
        
        // Mettre à jour tous les compteurs
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = totalItems;
            if (totalItems > 0) {
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }
    
    showNotification(message) {
        if (typeof app !== 'undefined' && app.showToast) {
            app.showToast(message, 'success');
        } else {
            alert(message);
        }
    }
}

// Initialiser le panier
let cart;

document.addEventListener('DOMContentLoaded', function() {
    cart = new ShoppingCart();
    
    // Événements pour les boutons "Ajouter au panier"
    document.addEventListener('click', function(e) {
        if (e.target.closest('.add-to-cart')) {
            const button = e.target.closest('.add-to-cart');
            const item = {
                id: button.dataset.id,
                name: button.dataset.name,
                price: parseFloat(button.dataset.price)
            };
            cart.addItem(item);
        }
    });
});

// Fonctions globales
function addToCart(item) {
    if (cart) {
        cart.addItem(item);
    }
}

function updateCartCount() {
    if (cart) {
        cart.updateCartCount();
    } else {
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = '0';
            badge.style.display = 'none';
        });
    }
}

function checkout() {
    if (!cart || cart.items.length === 0) {
        alert('Votre panier est vide');
        return;
    }
    
    const total = cart.getTotal();
    const orderDetails = cart.items.map(item => 
        `${item.name} x${item.quantity}: ${(item.price * item.quantity).toFixed(2)}€`
    ).join('\n');
    
    alert(`Commande confirmée !\n\n${orderDetails}\n\nTotal: ${total.toFixed(2)}€\n\nVotre commande sera prête dans 30 minutes.`);
    
    cart.clear();
    
    // Fermer l'offcanvas
    const offcanvas = document.getElementById('cartOffcanvas');
    if (offcanvas) {
        const bsOffcanvas = bootstrap.Offcanvas.getInstance(offcanvas);
        if (bsOffcanvas) {
            bsOffcanvas.hide();
        }
    }
}