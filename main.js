// Fonctions utilitaires principales
class RestaurantApp {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.checkAdminStatus();
        this.loadCart();
    }
    
    setupEventListeners() {
        // Smooth scroll pour les ancres
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href !== '#') {
                    e.preventDefault();
                    const target = document.querySelector(href);
                    if (target) {
                        target.scrollIntoView({
                            behavior: 'smooth',
                            block: 'start'
                        });
                    }
                }
            });
        });
        
        // Tooltips Bootstrap
        const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
        tooltipTriggerList.map(function (tooltipTriggerEl) {
            return new bootstrap.Tooltip(tooltipTriggerEl);
        });
        
        // Toast notifications
        this.setupToasts();
    }
    
    checkAdminStatus() {
        const adminNavItem = document.getElementById('admin-nav-item');
        if (adminNavItem && localStorage.getItem('adminLoggedIn') === 'true') {
            adminNavItem.classList.remove('d-none');
        }
    }
    
    setupToasts() {
        // Créer le conteneur de toasts s'il n'existe pas
        if (!document.getElementById('toast-container')) {
            const toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            toastContainer.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(toastContainer);
        }
    }
    
    showToast(message, type = 'success') {
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.id = toastId;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;
        
        document.getElementById('toast-container').appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Supprimer après la disparition
        toast.addEventListener('hidden.bs.toast', function () {
            this.remove();
        });
    }
    
    // Gestion des dates
    formatDate(date) {
        return new Date(date).toLocaleDateString('fr-FR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }
    
    formatPrice(price) {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(price);
    }
    
    // Validation email
    validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Validation téléphone français
    validatePhone(phone) {
        const re = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
        return re.test(phone.replace(/\s/g, ''));
    }
    
    // Gestion du localStorage
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Erreur sauvegarde localStorage:', e);
            return false;
        }
    }
    
    loadFromLocalStorage(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (e) {
            console.error('Erreur chargement localStorage:', e);
            return null;
        }
    }
    
    // Gestion du panier
    loadCart() {
        // Cette fonction est implémentée dans cart.js
        // Elle est appelée ici pour la cohérence
        if (typeof updateCartCount === 'function') {
            updateCartCount();
        }
    }
}

// Initialiser l'application
let app;
document.addEventListener('DOMContentLoaded', function() {
    app = new RestaurantApp();
});

// Fonctions globales accessibles depuis HTML
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme') || 'light';
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    
    body.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    app.showToast(`Thème ${newTheme === 'dark' ? 'sombre' : 'clair'} activé`);
}

function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Afficher le bouton scroll to top
window.addEventListener('scroll', function() {
    const scrollTopBtn = document.getElementById('scrollTopBtn');
    if (scrollTopBtn) {
        if (window.pageYOffset > 300) {
            scrollTopBtn.classList.remove('d-none');
        } else {
            scrollTopBtn.classList.add('d-none');
        }
    }
});

// Exporter pour utilisation dans d'autres fichiers
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { RestaurantApp };
}