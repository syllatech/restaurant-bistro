// Gestion du menu et filtrage
class MenuSystem {
    constructor() {
        this.menuItems = [];
        this.currentFilter = 'all';
        this.init();
    }
    
    init() {
        this.loadMenuItems();
        this.setupEventListeners();
        this.setupCart();
    }
    
    loadMenuItems() {
        // Données du menu
        this.menuItems = [
            {
                id: 1,
                name: "Terrine de Foie Gras Maison",
                description: "Toast, confiture d'oignons",
                price: 18,
                category: "entrees",
                tags: ["végétarien"],
                image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 2,
                name: "Salade de Homard",
                description: "Avocat, mangue, vinaigrette citron vert",
                price: 24,
                category: "entrees",
                tags: [],
                image: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 3,
                name: "Filet de Bœuf Rossini",
                description: "Foie gras, sauce au porto, pommes dauphine",
                price: 38,
                category: "plats",
                tags: [],
                image: "https://images.unsplash.com/photo-1600891964092-4316c288032e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 4,
                name: "Bar de Ligne Rôti",
                description: "Risotto aux petits pois, émulsion au citron",
                price: 32,
                category: "plats",
                tags: ["végétarien"],
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 5,
                name: "Soufflé au Chocolat Grand Marnier",
                description: "Glace vanille de Madagascar",
                price: 14,
                category: "desserts",
                tags: [],
                image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 6,
                name: "Tarte Fine aux Pommes",
                description: "Sorbet calvados, caramel au beurre salé",
                price: 12,
                category: "desserts",
                tags: ["végétarien"],
                image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 7,
                name: "Château Margaux 2015",
                description: "Bordeaux, Grand Cru Classé",
                price: 180,
                category: "boissons",
                tags: [],
                image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            },
            {
                id: 8,
                name: "Montrachet 2017",
                description: "Bourgogne, Grand Cru",
                price: 160,
                category: "boissons",
                tags: [],
                image: "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80"
            }
        ];
        
        this.renderMenu();
    }
    
    renderMenu() {
        const container = document.getElementById('menu-items-container');
        if (!container) return;
        
        // Filtrer les éléments
        const filteredItems = this.currentFilter === 'all' 
            ? this.menuItems 
            : this.menuItems.filter(item => item.category === this.currentFilter);
        
        if (filteredItems.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-utensils fa-3x text-muted mb-3"></i>
                    <h4>Aucun plat trouvé</h4>
                    <p class="text-muted">Essayez de changer le filtre</p>
                </div>
            `;
            return;
        }
        
        // Grouper par catégorie
        const grouped = {};
        filteredItems.forEach(item => {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        });
        
        let html = '';
        
        // Afficher par catégorie
        for (const [category, items] of Object.entries(grouped)) {
            const categoryName = this.getCategoryName(category);
            html += `
                <div class="col-12 mb-5">
                    <h3 class="font-playfair mb-4 border-bottom pb-2">${categoryName}</h3>
                    <div class="row g-4">
                        ${items.map(item => this.renderMenuItem(item)).join('')}
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
        this.setupAddToCartButtons();
    }
    
    renderMenuItem(item) {
        return `
            <div class="col-md-6 col-lg-4">
                <div class="card border-0 shadow-sm h-100 dish-card">
                    <div class="position-relative overflow-hidden" style="height: 200px;">
                        <img src="${item.image}" 
                             class="img-fluid w-100 h-100" 
                             alt="${item.name}"
                             style="object-fit: cover;">
                        <div class="position-absolute top-0 end-0 m-3">
                            ${item.tags.map(tag => `
                                <span class="badge ${this.getTagClass(tag)} me-1">${tag}</span>
                            `).join('')}
                        </div>
                        <div class="position-absolute bottom-0 end-0 m-3">
                            <span class="badge bg-dark fs-6">${item.price}€</span>
                        </div>
                    </div>
                    <div class="card-body d-flex flex-column">
                        <h5 class="card-title font-playfair">${item.name}</h5>
                        <p class="card-text text-muted flex-grow-1">${item.description}</p>
                        <div class="mt-auto">
                            <button class="btn-gold btn w-100 add-to-cart" 
                                    data-id="${item.id}"
                                    data-name="${item.name}"
                                    data-price="${item.price}">
                                <i class="fas fa-cart-plus me-2"></i>Ajouter au panier
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    getCategoryName(category) {
        const names = {
            'entrees': 'Entrées',
            'plats': 'Plats Principaux',
            'desserts': 'Desserts',
            'boissons': 'Boissons'
        };
        return names[category] || category;
    }
    
    getTagClass(tag) {
        const classes = {
            'végétarien': 'bg-success',
            'épicé': 'bg-danger',
            'nouveau': 'bg-primary',
            'populaire': 'bg-warning',
            'spécialité': 'bg-gold'
        };
        return classes[tag] || 'bg-secondary';
    }
    
    setupEventListeners() {
        // Filtres
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
                
                // Mettre à jour les boutons actifs
                document.querySelectorAll('.filter-btn').forEach(b => {
                    b.classList.remove('active');
                });
                e.currentTarget.classList.add('active');
            });
        });
        
        // Recherche
        const searchInput = document.getElementById('menu-search');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchMenu(e.target.value);
            });
        }
        
        // Tri
        const sortSelect = document.getElementById('menu-sort');
        if (sortSelect) {
            sortSelect.addEventListener('change', (e) => {
                this.sortMenu(e.target.value);
            });
        }
    }
    
    setFilter(filter) {
        this.currentFilter = filter;
        this.renderMenu();
        
        // Animation
        const container = document.getElementById('menu-items-container');
        container.style.opacity = '0.5';
        setTimeout(() => {
            container.style.opacity = '1';
        }, 300);
    }
    
    searchMenu(query) {
        if (!query.trim()) {
            this.renderMenu();
            return;
        }
        
        const searchLower = query.toLowerCase();
        const filtered = this.menuItems.filter(item => 
            item.name.toLowerCase().includes(searchLower) ||
            item.description.toLowerCase().includes(searchLower) ||
            item.tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
        
        // Afficher les résultats
        const container = document.getElementById('menu-items-container');
        if (filtered.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-search fa-3x text-muted mb-3"></i>
                    <h4>Aucun résultat pour "${query}"</h4>
                    <p class="text-muted">Essayez d'autres termes</p>
                </div>
            `;
        } else {
            container.innerHTML = `
                <div class="col-12">
                    <h4 class="mb-4">Résultats pour "${query}" (${filtered.length})</h4>
                    <div class="row g-4">
                        ${filtered.map(item => this.renderMenuItem(item)).join('')}
                    </div>
                </div>
            `;
            this.setupAddToCartButtons();
        }
    }
    
    sortMenu(criteria) {
        switch(criteria) {
            case 'price-asc':
                this.menuItems.sort((a, b) => a.price - b.price);
                break;
            case 'price-desc':
                this.menuItems.sort((a, b) => b.price - a.price);
                break;
            case 'name-asc':
                this.menuItems.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                this.menuItems.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'category':
                this.menuItems.sort((a, b) => a.category.localeCompare(b.category));
                break;
        }
        
        this.renderMenu();
    }
    
    setupCart() {
        // Vérifier si le panier existe
        if (typeof cart === 'undefined' && typeof ShoppingCart !== 'undefined') {
            window.cart = new ShoppingCart();
        }
    }
    
    setupAddToCartButtons() {
        document.querySelectorAll('.add-to-cart').forEach(button => {
            button.addEventListener('click', (e) => {
                const item = {
                    id: e.currentTarget.dataset.id,
                    name: e.currentTarget.dataset.name,
                    price: parseFloat(e.currentTarget.dataset.price)
                };
                
                // Ajouter au panier
                if (cart && typeof cart.addItem === 'function') {
                    cart.addItem(item);
                } else if (typeof addToCart === 'function') {
                    addToCart(item);
                } else {
                    // Fallback simple
                    alert(`${item.name} ajouté au panier pour ${item.price}€`);
                    
                    // Sauvegarder dans localStorage
                    let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
                    const existingItem = cartItems.find(i => i.id === item.id);
                    
                    if (existingItem) {
                        existingItem.quantity += 1;
                    } else {
                        cartItems.push({
                            ...item,
                            quantity: 1
                        });
                    }
                    
                    localStorage.setItem('cartItems', JSON.stringify(cartItems));
                    
                    // Mettre à jour le badge
                    this.updateCartBadge();
                }
                
                // Animation de confirmation
                const btn = e.currentTarget;
                const originalText = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check me-2"></i>Ajouté !';
                btn.classList.add('btn-success');
                btn.classList.remove('btn-gold');
                
                setTimeout(() => {
                    btn.innerHTML = originalText;
                    btn.classList.remove('btn-success');
                    btn.classList.add('btn-gold');
                }, 1500);
            });
        });
    }
    
    updateCartBadge() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        const totalItems = cartItems.reduce((total, item) => total + item.quantity, 0);
        
        document.querySelectorAll('.cart-badge').forEach(badge => {
            badge.textContent = totalItems;
            badge.style.display = totalItems > 0 ? 'flex' : 'none';
        });
    }
    
    // Méthodes pour le panier détaillé
    showCartDetails() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        
        if (cartItems.length === 0) {
            return `
                <div class="text-center py-4">
                    <i class="fas fa-shopping-cart fa-3x text-muted mb-3"></i>
                    <h5>Votre panier est vide</h5>
                    <p class="text-muted">Ajoutez des plats pour commencer</p>
                </div>
            `;
        }
        
        let html = `
            <div class="table-responsive">
                <table class="table">
                    <thead>
                        <tr>
                            <th>Plat</th>
                            <th>Prix unitaire</th>
                            <th>Quantité</th>
                            <th>Total</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
        `;
        
        let total = 0;
        
        cartItems.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            
            html += `
                <tr>
                    <td>
                        <strong>${item.name}</strong>
                    </td>
                    <td>${item.price}€</td>
                    <td>
                        <div class="input-group input-group-sm" style="width: 120px;">
                            <button class="btn btn-outline-secondary" onclick="menuSystem.updateQuantity(${index}, -1)">
                                -
                            </button>
                            <input type="number" class="form-control text-center" 
                                   value="${item.quantity}" min="1" 
                                   onchange="menuSystem.updateQuantity(${index}, this.value)">
                            <button class="btn btn-outline-secondary" onclick="menuSystem.updateQuantity(${index}, 1)">
                                +
                            </button>
                        </div>
                    </td>
                    <td>${itemTotal.toFixed(2)}€</td>
                    <td>
                        <button class="btn btn-outline-danger btn-sm" onclick="menuSystem.removeFromCart(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        html += `
                    </tbody>
                </table>
            </div>
            <div class="border-top pt-3">
                <div class="d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">Total:</h5>
                    <h4 class="mb-0 text-gold">${total.toFixed(2)}€</h4>
                </div>
                <div class="mt-3">
                    <button class="btn-gold btn w-100 mb-2" onclick="menuSystem.checkout()">
                        <i class="fas fa-credit-card me-2"></i>Passer commande
                    </button>
                    <button class="btn btn-outline-secondary w-100" onclick="menuSystem.clearCart()">
                        Vider le panier
                    </button>
                </div>
            </div>
        `;
        
        return html;
    }
    
    updateQuantity(index, change) {
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        
        if (typeof change === 'number') {
            // Bouton +/-
            cartItems[index].quantity += change;
        } else {
            // Input direct
            cartItems[index].quantity = parseInt(change);
        }
        
        // Supprimer si quantité <= 0
        if (cartItems[index].quantity <= 0) {
            cartItems.splice(index, 1);
        }
        
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        this.updateCartDisplay();
    }
    
    removeFromCart(index) {
        let cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        cartItems.splice(index, 1);
        localStorage.setItem('cartItems', JSON.stringify(cartItems));
        this.updateCartDisplay();
    }
    
    clearCart() {
        if (confirm('Êtes-vous sûr de vouloir vider votre panier ?')) {
            localStorage.removeItem('cartItems');
            this.updateCartDisplay();
        }
    }
    
    checkout() {
        const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
        
        if (cartItems.length === 0) {
            alert('Votre panier est vide');
            return;
        }
        
        const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const orderDetails = cartItems.map(item => 
            `${item.name} x${item.quantity}: ${(item.price * item.quantity).toFixed(2)}€`
        ).join('\n');
        
        const order = {
            id: Date.now(),
            items: cartItems,
            total: total,
            date: new Date().toISOString(),
            status: 'pending'
        };
        
        // Sauvegarder la commande
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(order);
        localStorage.setItem('orders', JSON.stringify(orders));
        
        // Afficher confirmation
        alert(`Commande confirmée !\n\n${orderDetails}\n\nTotal: ${total.toFixed(2)}€\n\nVotre commande sera prête dans 30 minutes.`);
        
        // Vider le panier
        localStorage.removeItem('cartItems');
        this.updateCartDisplay();
        
        // Fermer l'offcanvas si ouvert
        const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('cartOffcanvas'));
        if (offcanvas) {
            offcanvas.hide();
        }
    }
    
    updateCartDisplay() {
        // Mettre à jour le badge
        this.updateCartBadge();
        
        // Mettre à jour l'affichage détaillé si visible
        const cartDetails = document.getElementById('cart-details');
        if (cartDetails) {
            cartDetails.innerHTML = this.showCartDetails();
        }
        
        // Mettre à jour le total dans l'offcanvas
        const cartTotal = document.getElementById('cart-total');
        if (cartTotal) {
            const cartItems = JSON.parse(localStorage.getItem('cartItems') || '[]');
            const total = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
            cartTotal.textContent = `${total.toFixed(2)}€`;
        }
    }
}

// Initialiser le système de menu
let menuSystem;

document.addEventListener('DOMContentLoaded', function() {
    menuSystem = new MenuSystem();
    
    // Vérifier si on est sur la page menu
    if (document.getElementById('menu-items-container')) {
        menuSystem.loadMenuItems();
    }
    
    // Initialiser le panier
    menuSystem.setupCart();
    menuSystem.updateCartBadge();
});

// Exposer pour utilisation globale
window.menuSystem = menuSystem;