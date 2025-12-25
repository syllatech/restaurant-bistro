// script.js - Fonctions principales du site restaurant

// ============================================
// CONFIGURATION GLOBALE
// ============================================
const CONFIG = {
    autoRotateCarousel: true,
    carouselInterval: 5000,
    animationThreshold: 0.1,
    enableParallax: true,
    enableSmoothScroll: true,
    notificationDuration: 3000,
    reservationDaysLimit: 30,
    defaultReservationTime: '20:00'
};

// ============================================
// ÉTAT GLOBAL
// ============================================
let state = {
    currentCarouselSlide: 0,
    carouselInterval: null,
    isScrolled: false,
    darkMode: false,
    notifications: []
};

// ============================================
// INITIALISATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Site restaurant initialisé');
    
    // Initialiser tous les modules
    initNavigation();
    initCarousel();
    initAnimations();
    initForms();
    initLightbox();
    initScrollTop();
    initParallax();
    initDateLimits();
    initWeatherWidget();
    initMenuInteractions();
    initAddToCartButtons();
    
    // Mettre à jour l'année dans le footer
    updateCurrentYear();
    
    // Initialiser le mode sombre
    initDarkMode();
    
    // Vérifier le scroll initial
    checkScroll();
});

// ============================================
// NAVIGATION
// ============================================
function initNavigation() {
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');
    
    // Menu mobile
    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', function() {
            navLinks.classList.toggle('show');
            this.setAttribute('aria-expanded', navLinks.classList.contains('show'));
        });
        
        // Fermer le menu en cliquant sur un lien
        document.querySelectorAll('.nav-links a').forEach(link => {
            link.addEventListener('click', () => {
                navLinks.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
            });
        });
        
        // Fermer le menu en cliquant à l'extérieur
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !menuToggle.contains(event.target)) {
                navLinks.classList.remove('show');
                menuToggle.setAttribute('aria-expanded', 'false');
            }
        });
    }
    
    // Navbar scroll effect
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        state.isScrolled = window.scrollY > 100;
    });
    
    // Smooth scroll pour les ancres
    if (CONFIG.enableSmoothScroll) {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function(e) {
                const href = this.getAttribute('href');
                if (href === '#') return;
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Fermer le menu mobile si ouvert
                    if (navLinks && navLinks.classList.contains('show')) {
                        navLinks.classList.remove('show');
                        if (menuToggle) {
                            menuToggle.setAttribute('aria-expanded', 'false');
                        }
                    }
                }
            });
        });
    }
}

// ============================================
// DIAPORAMA
// ============================================
function initCarousel() {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    const prevBtn = carousel.querySelector('.carousel-prev');
    const nextBtn = carousel.querySelector('.carousel-next');
    
    if (slides.length === 0) return;
    
    // Initialiser le premier slide
    showSlide(0);
    
    // Navigation avec les dots
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => showSlide(index));
    });
    
    // Boutons précédent/suivant
    if (prevBtn) {
        prevBtn.addEventListener('click', () => showSlide((state.currentCarouselSlide - 1 + slides.length) % slides.length));
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => showSlide((state.currentCarouselSlide + 1) % slides.length));
    }
    
    // Auto-rotation
    if (CONFIG.autoRotateCarousel) {
        startCarouselAutoRotation();
        
        // Pause au survol
        carousel.addEventListener('mouseenter', stopCarouselAutoRotation);
        carousel.addEventListener('mouseleave', startCarouselAutoRotation);
        carousel.addEventListener('touchstart', stopCarouselAutoRotation);
        carousel.addEventListener('touchend', startCarouselAutoRotation);
    }
    
    // Swipe sur mobile
    let touchStartX = 0;
    let touchEndX = 0;
    
    carousel.addEventListener('touchstart', e => {
        touchStartX = e.changedTouches[0].screenX;
    });
    
    carousel.addEventListener('touchend', e => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
    });
    
    function handleSwipe() {
        const swipeThreshold = 50;
        
        if (touchEndX < touchStartX - swipeThreshold) {
            // Swipe gauche = suivant
            showSlide((state.currentCarouselSlide + 1) % slides.length);
        } else if (touchEndX > touchStartX + swipeThreshold) {
            // Swipe droit = précédent
            showSlide((state.currentCarouselSlide - 1 + slides.length) % slides.length);
        }
    }
}

function showSlide(index) {
    const carousel = document.querySelector('.carousel');
    if (!carousel) return;
    
    const slides = carousel.querySelectorAll('.carousel-slide');
    const dots = carousel.querySelectorAll('.carousel-dot');
    
    if (index < 0 || index >= slides.length) return;
    
    // Masquer toutes les slides
    slides.forEach(slide => {
        slide.classList.remove('active');
        slide.setAttribute('aria-hidden', 'true');
    });
    
    // Réinitialiser les dots
    dots.forEach(dot => dot.classList.remove('active'));
    
    // Afficher la slide courante
    slides[index].classList.add('active');
    slides[index].setAttribute('aria-hidden', 'false');
    
    if (dots[index]) {
        dots[index].classList.add('active');
    }
    
    state.currentCarouselSlide = index;
}

function startCarouselAutoRotation() {
    if (state.carouselInterval) clearInterval(state.carouselInterval);
    
    state.carouselInterval = setInterval(() => {
        const carousel = document.querySelector('.carousel');
        if (!carousel) return;
        
        const slides = carousel.querySelectorAll('.carousel-slide');
        showSlide((state.currentCarouselSlide + 1) % slides.length);
    }, CONFIG.carouselInterval);
}

function stopCarouselAutoRotation() {
    if (state.carouselInterval) {
        clearInterval(state.carouselInterval);
        state.carouselInterval = null;
    }
}

// ============================================
// ANIMATIONS AU SCROLL
// ============================================
function initAnimations() {
    const observerOptions = {
        threshold: CONFIG.animationThreshold,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    // Observer tous les éléments avec la classe 'animate-on-scroll'
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

// ============================================
// FORMULAIRES
// ============================================
function initForms() {
    // Formulaire de réservation
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        reservationForm.addEventListener('submit', handleReservationSubmit);
        
        // Validation en temps réel
        const inputs = reservationForm.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(this);
            });
            
            input.addEventListener('input', function() {
                clearFieldError(this);
            });
        });
    }
    
    // Formulaire de contact
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmit);
    }
    
    // Formulaire d'avis
    const reviewForm = document.querySelector('.add-review');
    if (reviewForm) {
        const submitBtn = reviewForm.querySelector('#submit-review');
        if (submitBtn) {
            submitBtn.addEventListener('click', handleReviewSubmit);
        }
        
        // Système d'étoiles interactif
        const stars = reviewForm.querySelectorAll('.star');
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = parseInt(this.getAttribute('data-value'));
                setRating(value);
            });
            
            star.addEventListener('mouseover', function() {
                const value = parseInt(this.getAttribute('data-value'));
                highlightStars(value);
            });
            
            star.addEventListener('mouseout', function() {
                const currentRating = parseInt(document.getElementById('user-rating').value);
                highlightStars(currentRating);
            });
        });
    }
}

function handleReservationSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validation
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // Simuler l'envoi
    submitBtn.innerHTML = '<div class="loading"></div> Envoi en cours...';
    submitBtn.disabled = true;
    
    // Récupérer les données du formulaire
    const formData = new FormData(form);
    const data = Object.fromEntries(formData);
    
    // Simuler un délai d'envoi
    setTimeout(() => {
        // Suivre la réservation dans les analytics
        if (window.trackReservation) {
            window.trackReservation(data);
        }
        
        // Afficher la confirmation
        showNotification('Réservation confirmée ! Vous recevrez un email de confirmation.', 'success');
        
        // Réinitialiser le formulaire
        form.reset();
        
        // Restaurer le bouton
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
        
        // Mettre à jour les disponibilités
        updateAvailability();
        
    }, 1500);
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // Validation
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        showNotification('Veuillez remplir tous les champs obligatoires', 'error');
        return;
    }
    
    // Simuler l'envoi
    submitBtn.innerHTML = '<div class="loading"></div> Envoi en cours...';
    submitBtn.disabled = true;
    
    setTimeout(() => {
        showNotification('Message envoyé avec succès ! Nous vous répondrons dans les 24h.', 'success');
        form.reset();
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }, 1500);
}

// ============================================
// SYSTÈME DE RÉSERVATION COMPLET
// ============================================

async function handleReservationSubmit(e) {
    e.preventDefault();
    console.log('📋 Début du traitement de réservation');
    
    const form = e.target;
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    // 1. VALIDATION DU FORMULAIRE
    console.log('✅ Étape 1: Validation');
    let isValid = true;
    const requiredFields = form.querySelectorAll('[required]');
    
    requiredFields.forEach(field => {
        if (!validateField(field)) {
            isValid = false;
        }
    });
    
    if (!isValid) {
        console.log('❌ Validation échouée');
        showNotification('Veuillez corriger les erreurs dans le formulaire', 'error');
        return;
    }
    
    // 2. PRÉPARATION DES DONNÉES
    console.log('✅ Étape 2: Préparation données');
    const formData = new FormData(form);
    const reservationData = {
        name: formData.get('reservation-name') || '',
        email: formData.get('reservation-email') || '',
        phone: formData.get('reservation-phone') || '',
        date: formData.get('reservation-date') || '',
        time: formData.get('reservation-time') || '20:00',
        people: formData.get('reservation-people') || '2 personnes',
        notes: formData.get('reservation-notes') || ''
    };
    
    // 3. SIMULATION DE CHARGEMENT
    console.log('✅ Étape 3: Simulation chargement');
    submitBtn.innerHTML = '<div class="loading"></div> Traitement en cours...';
    submitBtn.disabled = true;
    
    try {
        // 4. SAUVEGARDE LOCALE
        console.log('✅ Étape 4: Sauvegarde locale');
        const reservationId = saveReservationToLocalStorage(reservationData);
        
        // 5. GÉNÉRATION DU RÉCAPITULATIF
        console.log('✅ Étape 5: Génération récapitulatif');
        generateReservationSummary(reservationId, reservationData);
        
        // 6. SIMULATION ENVOI EMAIL
        console.log('✅ Étape 6: Simulation email');
        await simulateEmailSending(reservationId, reservationData);
        
        // 7. TÉLÉCHARGEMENT CSV (pour le restaurateur)
        console.log('✅ Étape 7: Téléchargement CSV');
        downloadReservationCSV(reservationId, reservationData);
        
        // 8. AFFICHAGE CONFIRMATION
        console.log('✅ Étape 8: Affichage confirmation');
        showReservationConfirmationModal(reservationId, reservationData);
        
        // 9. RÉINITIALISATION DU FORMULAIRE
        console.log('✅ Étape 9: Réinitialisation formulaire');
        form.reset();
        
        // 10. MISE À JOUR DES STATISTIQUES
        console.log('✅ Étape 10: Mise à jour stats');
        if (window.trackReservation) {
            window.trackReservation(reservationData);
        }
        
        console.log('🎉 Réservation terminée avec succès!');
        
    } catch (error) {
        console.error('❌ Erreur lors de la réservation:', error);
        showNotification('Une erreur est survenue. Veuillez réessayer.', 'error');
    } finally {
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
    }
}

// ============================================
// FONCTIONS UTILITAIRES POUR LES RÉSERVATIONS
// ============================================

function saveReservationToLocalStorage(reservationData) {
    // Générer un ID unique
    const reservationId = 'RES-' + Date.now().toString().slice(-8);
    
    const reservation = {
        id: reservationId,
        ...reservationData,
        status: 'pending',
        createdAt: new Date().toISOString(),
        confirmed: false
    };
    
    // Charger les réservations existantes
    let allReservations = [];
    try {
        const saved = localStorage.getItem('bistro_reservations');
        allReservations = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erreur lecture localStorage:', error);
    }
    
    // Ajouter la nouvelle réservation
    allReservations.push(reservation);
    
    // Sauvegarder (limité à 50 réservations)
    if (allReservations.length > 50) {
        allReservations = allReservations.slice(-50);
    }
    
    localStorage.setItem('bistro_reservations', JSON.stringify(allReservations));
    
    console.log('💾 Réservation sauvegardée:', reservationId);
    return reservationId;
}

function generateReservationSummary(reservationId, data) {
    // Créer un récapitulatif HTML pour l'impression
    const summaryHTML = `
        <div id="reservation-summary-${reservationId}" class="reservation-summary hidden">
            <div class="summary-header">
                <h2><i class="fas fa-check-circle"></i> Confirmation de Réservation</h2>
                <p class="reservation-id">ID: ${reservationId}</p>
            </div>
            
            <div class="summary-details">
                <div class="detail-row">
                    <span class="detail-label">Nom :</span>
                    <span class="detail-value">${data.name}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Date :</span>
                    <span class="detail-value">${formatDateForDisplay(data.date)} à ${data.time}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Personnes :</span>
                    <span class="detail-value">${data.people}</span>
                </div>
                <div class="detail-row">
                    <span class="detail-label">Contact :</span>
                    <span class="detail-value">${data.email} | ${data.phone || 'Non fourni'}</span>
                </div>
                ${data.notes ? `
                <div class="detail-row">
                    <span class="detail-label">Notes :</span>
                    <span class="detail-value">${data.notes}</span>
                </div>
                ` : ''}
            </div>
            
            <div class="summary-footer">
                <p><i class="fas fa-info-circle"></i> Présentez cet écran ou votre ID à l'accueil</p>
                <p><i class="fas fa-clock"></i> Merci d'arriver 5 minutes avant l'heure réservée</p>
            </div>
        </div>
    `;
    
    // Ajouter au DOM (caché)
    const container = document.createElement('div');
    container.innerHTML = summaryHTML;
    document.body.appendChild(container);
    
    return reservationId;
}

async function simulateEmailSending(reservationId, data) {
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log('📧 Email simulé envoyé à:', data.email);
            
            // Générer le contenu de l'email (pour démonstration)
            const emailContent = {
                to: data.email,
                subject: `Confirmation de réservation - ${reservationId}`,
                body: `
Bonjour ${data.name},

Votre réservation au Bistro Français est confirmée !

📋 **Détails de votre réservation :**
- ID de réservation : ${reservationId}
- Date : ${formatDateForDisplay(data.date)}
- Heure : ${data.time}
- Nombre de personnes : ${data.people}
- Contact : ${data.phone || 'Non fourni'}

${data.notes ? `Notes spéciales : ${data.notes}\n` : ''}

📍 **Adresse :**
Bistro Français
123 Rue de la Gastronomie
75008 Paris

📞 **Contact :** +33 1 23 45 67 89

ℹ️ **Informations importantes :**
• Merci d'arriver 5 minutes avant l'heure réservée
• En cas d'annulation, merci de nous prévenir au moins 2h à l'avance
• Présentez cet email ou votre ID de réservation à l'accueil

Nous avons hâte de vous accueillir !

Cordialement,
L'équipe du Bistro Français
                `
            };
            
            // Sauvegarder l'email simulé (pour démonstration)
            localStorage.setItem(`email_${reservationId}`, JSON.stringify(emailContent));
            
            resolve(true);
        }, 1500);
    });
}

function downloadReservationCSV(reservationId, data) {
    // Charger toutes les réservations
    let allReservations = [];
    try {
        const saved = localStorage.getItem('bistro_reservations');
        allReservations = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erreur lecture réservations:', error);
        return;
    }
    
    // Créer le contenu CSV
    const headers = ['ID', 'Nom', 'Email', 'Téléphone', 'Date', 'Heure', 'Personnes', 'Statut', 'Créé le', 'Notes'];
    const csvRows = [
        headers.join(','),
        ...allReservations.map(r => [
            r.id,
            `"${r.name}"`,
            r.email,
            r.phone || '',
            r.date,
            r.time,
            r.people,
            r.status,
            r.createdAt,
            `"${r.notes || ''}"`
        ].join(','))
    ];
    
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    // Créer un lien de téléchargement invisible
    const link = document.createElement('a');
    link.href = url;
    link.download = `reservations_${new Date().toISOString().split('T')[0]}.csv`;
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    console.log('📥 CSV téléchargé pour le restaurateur');
}

function showReservationConfirmationModal(reservationId, data) {
    // Créer la modal de confirmation
    const modalHTML = `
        <div class="modal active" id="reservation-confirmation-modal">
            <div class="modal-content">
                <div class="confirmation-icon">
                    <i class="fas fa-check-circle"></i>
                </div>
                
                <h2>Réservation Confirmée !</h2>
                
                <div class="confirmation-details">
                    <div class="detail-item">
                        <span class="detail-label">ID de réservation :</span>
                        <span class="detail-value highlight">${reservationId}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Nom :</span>
                        <span class="detail-value">${data.name}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Date & Heure :</span>
                        <span class="detail-value">${formatDateForDisplay(data.date)} à ${data.time}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">Personnes :</span>
                        <span class="detail-value">${data.people}</span>
                    </div>
                </div>
                
                <div class="confirmation-message">
                    <p><i class="fas fa-envelope"></i> Un email de confirmation a été envoyé à <strong>${data.email}</strong></p>
                    <p><i class="fas fa-phone"></i> Nous vous contacterons au ${data.phone || 'numéro fourni'} si nécessaire</p>
                </div>
                
                <div class="confirmation-actions">
                    <button class="btn btn-primary" onclick="printReservationSummary('${reservationId}')">
                        <i class="fas fa-print"></i> Imprimer la confirmation
                    </button>
                    <button class="btn btn-outline" onclick="closeReservationModal()">
                        <i class="fas fa-calendar-plus"></i> Faire une autre réservation
                    </button>
                    <button class="btn btn-text" onclick="viewReservationDetails('${reservationId}')">
                        <i class="fas fa-info-circle"></i> Voir les détails
                    </button>
                </div>
                
                <div class="confirmation-tips">
                    <p><i class="fas fa-lightbulb"></i> <strong>Conseil :</strong> Prenez une capture d'écran ou notez votre ID de réservation</p>
                </div>
            </div>
        </div>
    `;
    
    // Ajouter la modal au DOM
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Ajouter les styles si nécessaire
    addConfirmationStyles();
}

// ============================================
// FONCTIONS D'AFFICHAGE ET UTILITAIRES
// ============================================

function formatDateForDisplay(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function printReservationSummary(reservationId) {
    const summaryElement = document.getElementById(`reservation-summary-${reservationId}`);
    
    if (summaryElement) {
        // Afficher l'élément temporairement
        summaryElement.classList.remove('hidden');
        
        // Ouvrir la boîte de dialogue d'impression
        window.print();
        
        // Re-cacher l'élément
        setTimeout(() => {
            summaryElement.classList.add('hidden');
        }, 100);
    } else {
        // Fallback : imprimer la page actuelle
        window.print();
    }
}

function closeReservationModal() {
    const modal = document.getElementById('reservation-confirmation-modal');
    if (modal) {
        modal.remove();
    }
}

function viewReservationDetails(reservationId) {
    // Charger la réservation depuis le localStorage
    let allReservations = [];
    try {
        const saved = localStorage.getItem('bistro_reservations');
        allReservations = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erreur lecture réservations:', error);
        return;
    }
    
    const reservation = allReservations.find(r => r.id === reservationId);
    
    if (reservation) {
        // Afficher les détails dans une alerte (ou mieux, dans une modal)
        const details = `
DÉTAILS DE LA RÉSERVATION :
─────────────────────────
ID : ${reservation.id}
Nom : ${reservation.name}
Email : ${reservation.email}
Téléphone : ${reservation.phone || 'Non fourni'}
Date : ${reservation.date}
Heure : ${reservation.time}
Personnes : ${reservation.people}
Statut : ${reservation.status}
Créée le : ${new Date(reservation.createdAt).toLocaleString('fr-FR')}
${reservation.notes ? `Notes : ${reservation.notes}` : ''}
─────────────────────────
Pour modifier ou annuler, contactez le restaurant.
        `;
        
        alert(details);
    } else {
        showNotification('Réservation non trouvée', 'error');
    }
}

function addConfirmationStyles() {
    // Ajouter les styles CSS pour la confirmation si ils n'existent pas
    if (!document.getElementById('confirmation-styles')) {
        const styles = `
            <style id="confirmation-styles">
                .reservation-summary {
                    background: white;
                    padding: 20px;
                    border-radius: 10px;
                    max-width: 600px;
                    margin: 0 auto;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
                }
                
                .reservation-summary.hidden {
                    display: none;
                }
                
                .summary-header {
                    text-align: center;
                    border-bottom: 2px solid var(--primary-color);
                    padding-bottom: 15px;
                    margin-bottom: 20px;
                }
                
                .reservation-id {
                    background: var(--light-color);
                    padding: 5px 10px;
                    border-radius: 5px;
                    font-family: monospace;
                    display: inline-block;
                    margin-top: 10px;
                }
                
                .detail-row {
                    display: flex;
                    justify-content: space-between;
                    padding: 10px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .detail-label {
                    font-weight: bold;
                    color: var(--dark-color);
                }
                
                .summary-footer {
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                    font-size: 0.9rem;
                    color: var(--text-light);
                }
                
                /* Styles pour la modal de confirmation */
                .confirmation-icon {
                    text-align: center;
                    font-size: 4rem;
                    color: var(--success-color);
                    margin-bottom: 20px;
                }
                
                .confirmation-details {
                    background: var(--light-color);
                    padding: 20px;
                    border-radius: 10px;
                    margin: 20px 0;
                }
                
                .detail-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                }
                
                .detail-item:last-child {
                    margin-bottom: 0;
                }
                
                .detail-value.highlight {
                    background: var(--primary-color);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 4px;
                    font-weight: bold;
                }
                
                .confirmation-message {
                    background: #e8f5e9;
                    padding: 15px;
                    border-radius: 8px;
                    margin: 20px 0;
                    border-left: 4px solid var(--success-color);
                }
                
                .confirmation-actions {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                    margin: 20px 0;
                }
                
                .confirmation-tips {
                    background: #fff3cd;
                    padding: 10px 15px;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    border-left: 4px solid var(--warning-color);
                }
                
                @media print {
                    .navbar, .footer, .btn, .modal, .chatbot-container {
                        display: none !important;
                    }
                    
                    .reservation-summary {
                        box-shadow: none;
                        padding: 0;
                    }
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }
}

// ============================================
// PAGE ADMIN POUR VOIR LES RÉSERVATIONS
// ============================================

// Cette fonction peut être appelée depuis une page admin.html
function loadAdminReservations() {
    let allReservations = [];
    try {
        const saved = localStorage.getItem('bistro_reservations');
        allReservations = saved ? JSON.parse(saved) : [];
    } catch (error) {
        console.error('Erreur lecture réservations:', error);
        return [];
    }
    
    // Trier par date (les plus récentes d'abord)
    allReservations.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    return allReservations;
}

// ============================================
// INITIALISATION DU SYSTÈME DE RÉSERVATION
// ============================================

// S'assurer que le formulaire est bien attaché
document.addEventListener('DOMContentLoaded', function() {
    const reservationForm = document.getElementById('reservation-form');
    if (reservationForm) {
        console.log('✅ Formulaire de réservation trouvé, attachement des événements');
        reservationForm.addEventListener('submit', handleReservationSubmit);
        
        // Initialiser la date minimum (aujourd'hui)
        const dateInput = document.getElementById('reservation-date');
        if (dateInput) {
            const today = new Date();
            dateInput.min = today.toISOString().split('T')[0];
            
            // Définir la date par défaut (demain)
            const tomorrow = new Date(today);
            tomorrow.setDate(tomorrow.getDate() + 1);
            dateInput.value = tomorrow.toISOString().split('T')[0];
        }
    }
});

function setRating(value) {
    const stars = document.querySelectorAll('.rating.interactive .star');
    const ratingInput = document.getElementById('user-rating');
    
    ratingInput.value = value;
    
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.remove('far');
            star.classList.add('fas');
            star.classList.add('active');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
            star.classList.remove('active');
        }
    });
}

function highlightStars(value) {
    const stars = document.querySelectorAll('.rating.interactive .star');
    
    stars.forEach((star, index) => {
        if (index < value) {
            star.classList.remove('far');
            star.classList.add('fas');
        } else {
            star.classList.remove('fas');
            star.classList.add('far');
        }
    });
}

function addReviewToDisplay(review) {
    const reviewsGrid = document.querySelector('.reviews-grid');
    if (!reviewsGrid) return;
    
    const reviewCard = document.createElement('div');
    reviewCard.className = 'review-card animate-on-scroll';
    reviewCard.innerHTML = `
        <div class="rating" data-rating="${review.rating}">
            ${Array(5).fill().map((_, i) => 
                `<i class="${i < review.rating ? 'fas' : 'far'} fa-star star"></i>`
            ).join('')}
        </div>
        <p class="review-text">"${review.text}"</p>
        <div class="review-author">
            <strong>${review.name}</strong>
            <span>${review.date}</span>
        </div>
    `;
    
    // Ajouter au début de la grille
    reviewsGrid.insertBefore(reviewCard, reviewsGrid.firstChild);
    
    // Animer l'apparition
    setTimeout(() => {
        reviewCard.classList.add('animate');
    }, 10);
}

// ============================================
// VALIDATION DE FORMULAIRE
// ============================================
function validateField(field) {
    const value = field.value.trim();
    let isValid = true;
    let errorMessage = '';
    
    // Effacer les erreurs précédentes
    clearFieldError(field);
    
    // Validation selon le type de champ
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        errorMessage = 'Ce champ est obligatoire';
    } else if (field.type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            errorMessage = 'Email invalide';
        }
    } else if (field.type === 'tel' && value) {
        const phoneRegex = /^[0-9\s\+\-\(\)]{10,}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
            isValid = false;
            errorMessage = 'Numéro de téléphone invalide';
        }
    } else if (field.type === 'date' && value) {
        const selectedDate = new Date(value);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        if (selectedDate < today) {
            isValid = false;
            errorMessage = 'La date doit être future';
        }
    }
    
    // Afficher l'erreur si nécessaire
    if (!isValid) {
        showFieldError(field, errorMessage);
    } else {
        showFieldSuccess(field);
    }
    
    return isValid;
}

function showFieldError(field, message) {
    field.style.borderColor = 'var(--error-color)';
    
    // Créer ou mettre à jour le message d'erreur
    let errorElement = field.nextElementSibling;
    if (!errorElement || !errorElement.classList.contains('error-message')) {
        errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        field.parentNode.insertBefore(errorElement, field.nextSibling);
    }
    
    errorElement.textContent = message;
    errorElement.style.color = 'var(--error-color)';
    errorElement.style.fontSize = '0.85rem';
    errorElement.style.marginTop = '5px';
}

function showFieldSuccess(field) {
    field.style.borderColor = 'var(--success-color)';
}

function clearFieldError(field) {
    field.style.borderColor = '';
    
    const errorElement = field.nextElementSibling;
    if (errorElement && errorElement.classList.contains('error-message')) {
        errorElement.remove();
    }
}

// ============================================
// LIGHTBOX GALERIE
// ============================================
function initLightbox() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = lightbox?.querySelector('.lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    
    if (!galleryItems.length || !lightbox || !lightboxImg) return;
    
    galleryItems.forEach(item => {
        item.addEventListener('click', function() {
            // Pour l'instant, on utilise des images placeholder
            // En réalité, tu récupérerais l'URL de l'image cliquée
            const imgSrc = this.getAttribute('data-image') || '';
            lightboxImg.src = `images/gallery/${imgSrc}.jpg`;
            lightboxImg.alt = this.querySelector('.gallery-overlay p')?.textContent || 'Image du restaurant';
            
            lightbox.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    });
    
    // Fermer la lightbox
    if (lightboxClose) {
        lightboxClose.addEventListener('click', () => closeLightbox());
    }
    
    // Fermer en cliquant à côté
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }
    
    // Fermer avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && lightbox.classList.contains('active')) {
            closeLightbox();
        }
    });
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
        lightbox.classList.remove('active');
        document.body.style.overflow = 'auto';
    }
}

// ============================================
// BOUTON SCROLL TOP
// ============================================
function initScrollTop() {
    const scrollTopBtn = document.getElementById('scroll-top');
    if (!scrollTopBtn) return;
    
    scrollTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    window.addEventListener('scroll', checkScroll);
}

function checkScroll() {
    const scrollTopBtn = document.getElementById('scroll-top');
    if (!scrollTopBtn) return;
    
    if (window.scrollY > 300) {
        scrollTopBtn.classList.add('visible');
    } else {
        scrollTopBtn.classList.remove('visible');
    }
}

// ============================================
// EFFET PARALLAX
// ============================================
function initParallax() {
    if (!CONFIG.enableParallax) return;
    
    const parallaxElements = document.querySelectorAll('.parallax');
    
    if (!parallaxElements.length) return;
    
    window.addEventListener('scroll', () => {
        const scrollPosition = window.pageYOffset;
        
        parallaxElements.forEach(element => {
            const speed = element.getAttribute('data-speed') || 0.5;
            const yPos = -(scrollPosition * speed);
            element.style.transform = `translateY(${yPos}px)`;
        });
    });
}

// ============================================
// LIMITES DE DATE POUR RÉSERVATION
// ============================================
function initDateLimits() {
    const dateInput = document.getElementById('reservation-date');
    if (!dateInput) return;
    
    // Date minimum (aujourd'hui)
    const today = new Date();
    const todayFormatted = today.toISOString().split('T')[0];
    dateInput.min = todayFormatted;
    
    // Date maximum (30 jours)
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + CONFIG.reservationDaysLimit);
    const maxDateFormatted = maxDate.toISOString().split('T')[0];
    dateInput.max = maxDateFormatted;
    
    // Valeur par défaut (demain)
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);
    const tomorrowFormatted = tomorrow.toISOString().split('T')[0];
    dateInput.value = tomorrowFormatted;
}

// ============================================
// MÉTÉO
// ============================================
function initWeatherWidget() {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    // Simulation de données météo
    // En réalité, tu utiliserais une API comme OpenWeatherMap
    const mockWeatherData = {
        temperature: 18,
        description: 'partiellement nuageux',
        location: 'Paris',
        icon: 'cloud-sun',
        suggestion: 'Idéal pour une terrasse'
    };
    
    updateWeatherDisplay(mockWeatherData);
    
    // Mettre à jour toutes les heures (simulation)
    setInterval(() => {
        // Simuler un petit changement de température
        mockWeatherData.temperature += (Math.random() - 0.5);
        mockWeatherData.temperature = Math.round(mockWeatherData.temperature * 10) / 10;
        
        updateWeatherDisplay(mockWeatherData);
    }, 3600000); // 1 heure
}

function updateWeatherDisplay(data) {
    const weatherWidget = document.getElementById('weather-widget');
    if (!weatherWidget) return;
    
    weatherWidget.innerHTML = `
        <div class="weather-content">
            <div class="weather-icon">
                <i class="fas fa-${data.icon}"></i>
            </div>
            <div class="weather-info">
                <div class="weather-temp">${data.temperature}°C</div>
                <div class="weather-desc">${data.description}</div>
                <div class="weather-location">
                    <i class="fas fa-map-marker-alt"></i> ${data.location}
                </div>
            </div>
            <div class="weather-forecast">
                <small>${data.suggestion}</small>
            </div>
        </div>
    `;
    
    // Mettre à jour le thème selon la météo
    updateWeatherTheme(data.description);
}

function updateWeatherTheme(description) {
    const body = document.body;
    
    // Retirer les anciennes classes
    body.classList.remove('weather-sunny', 'weather-rainy', 'weather-cloudy');
    
    const desc = description.toLowerCase();
    
    if (desc.includes('ensoleillé') || desc.includes('soleil') || desc.includes('clair')) {
        body.classList.add('weather-sunny');
    } else if (desc.includes('pluie') || desc.includes('averse') || desc.includes('orage')) {
        body.classList.add('weather-rainy');
    } else if (desc.includes('nuage') || desc.includes('couvert') || desc.includes('brume')) {
        body.classList.add('weather-cloudy');
    }
}

// ============================================
// INTERACTIONS MENU
// ============================================
function initMenuInteractions() {
    // Menu déroulant des vins
    document.querySelectorAll('.wine-category-header').forEach(header => {
        header.addEventListener('click', function() {
            const content = this.nextElementSibling;
            const icon = this.querySelector('i.fa-chevron-down, i.fa-chevron-up');
            
            content.classList.toggle('active');
            
            if (icon.classList.contains('fa-chevron-down')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
    
    // FAQ
    document.querySelectorAll('.faq-question').forEach(question => {
        question.addEventListener('click', function() {
            const answer = this.nextElementSibling;
            const icon = this.querySelector('i.fa-chevron-down, i.fa-chevron-up');
            
            // Fermer toutes les autres réponses
            document.querySelectorAll('.faq-answer').forEach(otherAnswer => {
                if (otherAnswer !== answer && otherAnswer.classList.contains('active')) {
                    otherAnswer.classList.remove('active');
                    const otherIcon = otherAnswer.previousElementSibling.querySelector('i.fa-chevron-down, i.fa-chevron-up');
                    if (otherIcon) {
                        otherIcon.classList.remove('fa-chevron-up');
                        otherIcon.classList.add('fa-chevron-down');
                    }
                }
            });
            
            // Basculer la réponse actuelle
            answer.classList.toggle('active');
            
            // Changer l'icône
            if (icon.classList.contains('fa-chevron-down')) {
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            } else {
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            }
        });
    });
}

// ============================================
// BOUTONS AJOUTER AU PANIER
// ============================================
function initAddToCartButtons() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function() {
            const itemName = this.getAttribute('data-item') || 'Produit';
            const itemPrice = parseFloat(this.getAttribute('data-price')) || 0;
            
            // Vérifier si le panier est initialisé
            if (typeof window.addToCart === 'function') {
                window.addToCart({
                    name: itemName,
                    price: itemPrice,
                    quantity: 1
                });
                
                showNotification(`${itemName} ajouté au panier`, 'success');
                
                // Animation du bouton
                this.innerHTML = '<i class="fas fa-check"></i> Ajouté !';
                this.style.backgroundColor = 'var(--success-color)';
                
                setTimeout(() => {
                    this.innerHTML = '<i class="fas fa-plus"></i> Ajouter';
                    this.style.backgroundColor = '';
                }, 1500);
                
            } else {
                showNotification('Système de panier non disponible', 'error');
            }
        });
    });
}

// ============================================
// DISPONIBILITÉ
// ============================================
function updateAvailability() {
    const timeSlots = document.querySelectorAll('.time-slot[data-time]');
    
    timeSlots.forEach(slot => {
        // Simulation: réduire le nombre de places disponibles
        const countElement = slot.querySelector('.available-count');
        if (countElement) {
            let currentCount = parseInt(countElement.textContent);
            if (currentCount > 0) {
                // Réduire de 1 avec 50% de chance
                if (Math.random() > 0.5) {
                    currentCount--;
                    countElement.textContent = currentCount;
                    
                    // Mettre à jour les classes
                    slot.classList.remove('limited', 'full');
                    if (currentCount < 5) {
                        slot.classList.add('limited');
                    }
                    if (currentCount === 0) {
                        slot.classList.add('full');
                    }
                }
            }
        }
    });
}

// ============================================
// MODE SOMBRE
// ============================================
function initDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    if (!darkModeToggle) return;
    
    // Vérifier la préférence système
    const prefersDarkScheme = window.matchMedia('(prefers-color-scheme: dark)');
    
    // Vérifier le localStorage
    const savedTheme = localStorage.getItem('theme');
    
    // Appliquer le thème initial
    if (savedTheme === 'dark' || (!savedTheme && prefersDarkScheme.matches)) {
        enableDarkMode();
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    } else {
        disableDarkMode();
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    }
    
    // Gérer le toggle
    darkModeToggle.addEventListener('click', toggleDarkMode);
    
    // Écouter les changements de préférence système
    prefersDarkScheme.addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                enableDarkMode();
                darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            } else {
                disableDarkMode();
                darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            }
        }
    });
}

function toggleDarkMode() {
    const darkModeToggle = document.getElementById('dark-mode-toggle');
    
    if (document.body.classList.contains('dark-mode')) {
        disableDarkMode();
        darkModeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        enableDarkMode();
        darkModeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function enableDarkMode() {
    document.body.classList.add('dark-mode');
    localStorage.setItem('theme', 'dark');
    
    // Mettre à jour les meta tags pour les navigateurs
    document.documentElement.setAttribute('data-theme', 'dark');
    
    // Émettre un événement pour les autres scripts
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'dark' } }));
}

function disableDarkMode() {
    document.body.classList.remove('dark-mode');
    localStorage.setItem('theme', 'light');
    document.documentElement.setAttribute('data-theme', 'light');
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: { theme: 'light' } }));
}

// ============================================
// NOTIFICATIONS
// ============================================
function showNotification(message, type = 'info') {
    // Créer la notification
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Icône selon le type
    let icon = 'info-circle';
    let bgColor = 'var(--primary-color)';
    
    switch(type) {
        case 'success':
            icon = 'check-circle';
            bgColor = 'var(--success-color)';
            break;
        case 'error':
            icon = 'exclamation-circle';
            bgColor = 'var(--error-color)';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            bgColor = 'var(--warning-color)';
            break;
        case 'info':
        default:
            icon = 'info-circle';
            bgColor = 'var(--info-color)';
    }
    
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
    `;
    
    notification.style.backgroundColor = bgColor;
    
    // Ajouter au DOM
    document.body.appendChild(notification);
    
    // Animer l'entrée
    setTimeout(() => {
        notification.classList.add('show');
    }, 10);
    
    // Supprimer après délai
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, CONFIG.notificationDuration);
    
    // Stocker la notification
    state.notifications.push(notification);
}

// ============================================
// FONCTIONS UTILITAIRES
// ============================================
function updateCurrentYear() {
    const yearElements = document.querySelectorAll('#current-year');
    const currentYear = new Date().getFullYear();
    
    yearElements.forEach(element => {
        element.textContent = currentYear;
    });
}

function formatPrice(price) {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR',
        minimumFractionDigits: 2
    }).format(price);
}

function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// ============================================
// EXPORT DE FONCTIONS POUR LES AUTRES FICHIERS
// ============================================
window.utils = {
    formatPrice,
    showNotification,
    debounce
};

// ============================================
// ANALYTICS SIMPLES
// ============================================
// Suivre les clics sur les boutons d'action
document.querySelectorAll('.btn-primary, .btn-reserve, .add-to-cart').forEach(button => {
    button.addEventListener('click', function() {
        const action = this.textContent.trim() || this.getAttribute('data-item') || 'unknown';
        console.log(`📊 Action: ${action}`);
        
        // Envoyer à Google Analytics (exemple)
        // if (window.gtag) {
        //     gtag('event', 'click', {
        //         'event_category': 'engagement',
        //         'event_label': action
        //     });
        // }
    });
});

// Suivre le temps passé sur la page
let timeOnPage = 0;
const timeInterval = setInterval(() => {
    timeOnPage++;
    if (timeOnPage % 30 === 0) {
        console.log(`⏱️ Temps sur la page: ${timeOnPage} secondes`);
    }
}, 1000);

// Arrêter le tracking quand la page n'est plus visible
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        console.log(`📊 Session terminée. Temps total: ${timeOnPage}s`);
    }
});

console.log('✅ script.js chargé avec succès');