// Système d'administration complet
class AdminSystem {
    constructor() {
        this.currentAdmin = null;
        this.init();
    }
    
    init() {
        this.checkAuth();
        this.loadAdminData();
        this.setupEventListeners();
        this.initDashboard();
    }
    
    checkAuth() {
        const session = JSON.parse(localStorage.getItem('adminSession') || 'null');
        if (!session || !session.loggedIn) {
            window.location.href = 'admin-login.html';
            return false;
        }
        
        this.currentAdmin = session;
        return true;
    }
    
    loadAdminData() {
        // Charger les données pour le dashboard
        this.loadStats();
        this.loadReservations();
        this.loadMessages();
        this.loadOrders();
        this.loadMenuItems();
    }
    
    setupEventListeners() {
        // Événements généraux
        document.addEventListener('click', this.handleGlobalClicks.bind(this));
        
        // Rafraîchissement des données
        if (document.getElementById('refresh-activity')) {
            document.getElementById('refresh-activity').addEventListener('click', () => {
                this.loadStats();
                this.showToast('Données rafraîchies', 'success');
            });
        }
        
        // Filtres de réservation
        this.setupReservationFilters();
        
        // Gestion des messages
        this.setupMessages();
        
        // Paramètres
        this.setupSettings();
    }
    
    handleGlobalClicks(e) {
        // Gestion des boutons d'action
        if (e.target.closest('.btn-action')) {
            const button = e.target.closest('.btn-action');
            const action = button.dataset.action;
            const target = button.dataset.target;
            this.handleAction(action, target, button);
        }
        
        // Gestion des confirmations de suppression
        if (e.target.closest('.btn-delete')) {
            if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) {
                e.preventDefault();
            }
        }
    }
    
    handleAction(action, target, button) {
        switch(action) {
            case 'confirm-reservation':
                this.confirmReservation(target);
                break;
            case 'cancel-reservation':
                this.cancelReservation(target);
                break;
            case 'edit-item':
                this.editMenuItem(target);
                break;
            case 'delete-item':
                this.deleteMenuItem(target);
                break;
            case 'mark-read':
                this.markMessageRead(target);
                break;
            case 'reply':
                this.replyToMessage(target);
                break;
        }
    }
    
    // === STATISTIQUES ===
    loadStats() {
        const today = new Date().toISOString().split('T')[0];
        
        // Réservations du jour
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const todayReservations = reservations.filter(r => 
            r.date === today && r.status === 'confirmed'
        ).length;
        
        // Commandes en attente
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const pendingOrders = orders.filter(o => o.status === 'pending').length;
        
        // Messages non lus
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const unreadMessages = messages.filter(m => !m.read).length;
        
        // Revenu du jour (simulé)
        const todayRevenue = todayReservations * 45; // 45€ par réservation moyenne
        
        // Mettre à jour l'interface
        if (document.getElementById('today-reservations')) {
            document.getElementById('today-reservations').textContent = todayReservations;
            document.getElementById('pending-orders').textContent = pendingOrders;
            document.getElementById('today-revenue').textContent = `${todayRevenue}€`;
            document.getElementById('unread-messages').textContent = unreadMessages;
        }
        
        // Mettre à jour les badges de notification
        this.updateNotificationBadges();
    }
    
    updateNotificationBadges() {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        
        const unreadMessages = messages.filter(m => !m.read).length;
        const pendingReservations = reservations.filter(r => r.status === 'pending').length;
        
        // Badge messages
        const messageBadge = document.getElementById('message-badge');
        if (messageBadge) {
            if (unreadMessages > 0) {
                messageBadge.textContent = unreadMessages;
                messageBadge.classList.remove('d-none');
            } else {
                messageBadge.classList.add('d-none');
            }
        }
        
        // Badge réservations
        const reservationBadge = document.getElementById('reservation-badge');
        if (reservationBadge) {
            if (pendingReservations > 0) {
                reservationBadge.textContent = pendingReservations;
                reservationBadge.classList.remove('d-none');
            } else {
                reservationBadge.classList.add('d-none');
            }
        }
        
        // Badge notifications générales
        const notificationBadge = document.getElementById('notification-count');
        if (notificationBadge) {
            const totalNotifications = unreadMessages + pendingReservations;
            if (totalNotifications > 0) {
                notificationBadge.textContent = totalNotifications;
                notificationBadge.style.display = 'flex';
            } else {
                notificationBadge.style.display = 'none';
            }
        }
    }
    
    // === RÉSERVATIONS ===
    loadReservations() {
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const container = document.getElementById('reservations-table');
        
        if (!container) return;
        
        if (reservations.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="8" class="text-center py-4 text-muted">
                        <i class="fas fa-calendar-times fa-2x mb-3"></i>
                        <p class="mb-0">Aucune réservation trouvée</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        reservations.forEach(reservation => {
            const date = new Date(reservation.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                weekday: 'short',
                day: 'numeric',
                month: 'short'
            });
            
            let statusBadge = '';
            switch(reservation.status) {
                case 'confirmed':
                    statusBadge = '<span class="badge bg-success">Confirmé</span>';
                    break;
                case 'pending':
                    statusBadge = '<span class="badge bg-warning">En attente</span>';
                    break;
                case 'cancelled':
                    statusBadge = '<span class="badge bg-secondary">Annulé</span>';
                    break;
                default:
                    statusBadge = '<span class="badge bg-info">Terminé</span>';
            }
            
            html += `
                <tr>
                    <td>#${reservation.id}</td>
                    <td>${reservation.firstName} ${reservation.lastName}</td>
                    <td>${formattedDate}</td>
                    <td>${reservation.time}</td>
                    <td>${reservation.guests}</td>
                    <td>${statusBadge}</td>
                    <td>${reservation.phone || 'N/A'}</td>
                    <td>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary btn-action" 
                                    data-action="confirm-reservation" 
                                    data-target="${reservation.id}"
                                    ${reservation.status === 'confirmed' ? 'disabled' : ''}>
                                <i class="fas fa-check"></i>
                            </button>
                            <button class="btn btn-outline-warning btn-action" 
                                    data-action="cancel-reservation" 
                                    data-target="${reservation.id}"
                                    ${reservation.status === 'cancelled' ? 'disabled' : ''}>
                                <i class="fas fa-times"></i>
                            </button>
                            <button class="btn btn-outline-info" data-bs-toggle="modal" 
                                    data-bs-target="#viewReservationModal" 
                                    onclick="adminSystem.viewReservation(${reservation.id})">
                                <i class="fas fa-eye"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    }
    
    setupReservationFilters() {
        const dateFilter = document.getElementById('filter-date');
        const statusFilter = document.getElementById('filter-status');
        const searchFilter = document.getElementById('filter-search');
        const resetBtn = document.getElementById('reset-filters');
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => this.filterReservations());
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => this.filterReservations());
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', () => this.filterReservations());
        }
        
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetFilters());
        }
    }
    
    filterReservations() {
        const dateFilter = document.getElementById('filter-date')?.value;
        const statusFilter = document.getElementById('filter-status')?.value;
        const searchFilter = document.getElementById('filter-search')?.value.toLowerCase();
        
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const rows = document.querySelectorAll('#reservations-table tr');
        
        rows.forEach(row => {
            if (row.cells.length < 8) return;
            
            const name = row.cells[1].textContent.toLowerCase();
            const date = row.cells[2].textContent;
            const status = row.cells[5].textContent.toLowerCase();
            
            let show = true;
            
            if (dateFilter && !date.includes(this.formatFilterDate(dateFilter))) {
                show = false;
            }
            
            if (statusFilter) {
                const statusText = status.includes('confirmé') ? 'confirmed' :
                                 status.includes('attente') ? 'pending' :
                                 status.includes('annulé') ? 'cancelled' : '';
                if (statusFilter !== statusText) {
                    show = false;
                }
            }
            
            if (searchFilter && !name.includes(searchFilter)) {
                show = false;
            }
            
            row.style.display = show ? '' : 'none';
        });
    }
    
    formatFilterDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('fr-FR', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    }
    
    resetFilters() {
        document.getElementById('filter-date').value = '';
        document.getElementById('filter-status').value = '';
        document.getElementById('filter-search').value = '';
        this.filterReservations();
    }
    
    confirmReservation(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const reservation = reservations.find(r => r.id == reservationId);
        
        if (reservation) {
            reservation.status = 'confirmed';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            
            this.loadReservations();
            this.loadStats();
            this.showToast('Réservation confirmée', 'success');
            
            // Ajouter une notification
            this.addNotification(
                'reservation_confirmed',
                `Réservation #${reservationId} confirmée`,
                'info'
            );
        }
    }
    
    cancelReservation(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const reservation = reservations.find(r => r.id == reservationId);
        
        if (reservation) {
            reservation.status = 'cancelled';
            localStorage.setItem('reservations', JSON.stringify(reservations));
            
            this.loadReservations();
            this.loadStats();
            this.showToast('Réservation annulée', 'warning');
            
            // Ajouter une notification
            this.addNotification(
                'reservation_cancelled',
                `Réservation #${reservationId} annulée`,
                'warning'
            );
        }
    }
    
    viewReservation(reservationId) {
        const reservations = JSON.parse(localStorage.getItem('reservations') || '[]');
        const reservation = reservations.find(r => r.id == reservationId);
        
        if (reservation && document.getElementById('reservation-details')) {
            const date = new Date(reservation.date);
            const formattedDate = date.toLocaleDateString('fr-FR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
                year: 'numeric'
            });
            
            document.getElementById('reservation-details').innerHTML = `
                <div class="row">
                    <div class="col-md-6">
                        <p><strong>Nom:</strong> ${reservation.firstName} ${reservation.lastName}</p>
                        <p><strong>Email:</strong> ${reservation.email}</p>
                        <p><strong>Téléphone:</strong> ${reservation.phone}</p>
                    </div>
                    <div class="col-md-6">
                        <p><strong>Date:</strong> ${formattedDate}</p>
                        <p><strong>Heure:</strong> ${reservation.time}</p>
                        <p><strong>Personnes:</strong> ${reservation.guests}</p>
                        <p><strong>Statut:</strong> 
                            <span class="badge ${this.getStatusBadgeClass(reservation.status)}">
                                ${this.getStatusText(reservation.status)}
                            </span>
                        </p>
                    </div>
                </div>
                ${reservation.requests ? `
                    <div class="mt-3">
                        <strong>Demandes spéciales:</strong>
                        <p class="mb-0">${reservation.requests}</p>
                    </div>
                ` : ''}
            `;
        }
    }
    
    getStatusBadgeClass(status) {
        switch(status) {
            case 'confirmed': return 'bg-success';
            case 'pending': return 'bg-warning';
            case 'cancelled': return 'bg-secondary';
            default: return 'bg-info';
        }
    }
    
    getStatusText(status) {
        switch(status) {
            case 'confirmed': return 'Confirmé';
            case 'pending': return 'En attente';
            case 'cancelled': return 'Annulé';
            default: return 'Terminé';
        }
    }
    
    // === MESSAGES ===
    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const container = document.getElementById('messages-list');
        const detailsContainer = document.getElementById('message-details');
        const noMessageContainer = document.getElementById('no-message-selected');
        
        if (!container) return;
        
        if (messages.length === 0) {
            container.innerHTML = `
                <div class="text-center p-4 text-muted">
                    <i class="fas fa-envelope-open fa-2x mb-3"></i>
                    <p class="mb-0">Aucun message</p>
                </div>
            `;
            return;
        }
        
        let html = '';
        messages.forEach((message, index) => {
            const timeAgo = this.getTimeAgo(new Date(message.timestamp));
            const isRead = message.read || false;
            
            html += `
                <a href="#" class="list-group-item list-group-item-action ${!isRead ? 'bg-light' : ''}" 
                    onclick="adminSystem.viewMessage(${index})">
                    <div class="d-flex w-100 justify-content-between">
                        <h6 class="mb-1 ${!isRead ? 'fw-bold' : ''}">${message.subject || 'Sans sujet'}</h6>
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                    <p class="mb-1">${message.firstName} ${message.lastName}</p>
                    <small class="text-muted">${message.email}</small>
                    ${!isRead ? '<span class="badge bg-primary float-end">Nouveau</span>' : ''}
                </a>
            `;
        });
        
        container.innerHTML = html;
        
        // Afficher le premier message non lu
        const firstUnread = messages.findIndex(m => !m.read);
        if (firstUnread !== -1) {
            this.viewMessage(firstUnread);
        } else if (messages.length > 0) {
            this.viewMessage(0);
        } else {
            if (detailsContainer) detailsContainer.style.display = 'none';
            if (noMessageContainer) noMessageContainer.style.display = 'block';
        }
    }
    
    setupMessages() {
        const markReadBtn = document.getElementById('mark-read-btn');
        if (markReadBtn) {
            markReadBtn.addEventListener('click', () => {
                const currentMessage = document.querySelector('#messages-list .active');
                if (currentMessage) {
                    const index = Array.from(document.querySelectorAll('#messages-list .list-group-item'))
                        .indexOf(currentMessage);
                    this.markMessageRead(index);
                }
            });
        }
    }
    
    viewMessage(index) {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const message = messages[index];
        
        if (!message) return;
        
        const detailsContainer = document.getElementById('message-details');
        const noMessageContainer = document.getElementById('no-message-selected');
        const subject = document.getElementById('message-subject');
        const from = document.getElementById('message-from');
        const date = document.getElementById('message-date');
        const content = document.getElementById('message-content');
        
        if (!detailsContainer || !subject || !from || !date || !content) return;
        
        // Mettre à jour les détails
        subject.textContent = message.subject || 'Sans sujet';
        from.textContent = `${message.firstName} ${message.lastName} <${message.email}>`;
        date.textContent = new Date(message.timestamp).toLocaleDateString('fr-FR');
        content.textContent = message.message;
        
        // Afficher les détails, masquer "aucun message"
        detailsContainer.style.display = 'block';
        if (noMessageContainer) noMessageContainer.style.display = 'none';
        
        // Mettre à jour l'état actif dans la liste
        document.querySelectorAll('#messages-list .list-group-item').forEach((item, i) => {
            item.classList.toggle('active', i === index);
        });
        
        // Marquer comme lu
        if (!message.read) {
            this.markMessageRead(index);
        }
    }
    
    markMessageRead(index) {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        if (messages[index]) {
            messages[index].read = true;
            localStorage.setItem('contactMessages', JSON.stringify(messages));
            
            // Recharger la liste
            this.loadMessages();
            this.loadStats();
            
            this.showToast('Message marqué comme lu', 'success');
        }
    }
    
    replyToMessage(index) {
        const messages = JSON.parse(localStorage.getItem('contactMessages') || '[]');
        const message = messages[index];
        
        if (message) {
            const replyText = document.querySelector('#message-details textarea').value;
            if (replyText.trim()) {
                // Enregistrer la réponse (simulée)
                const replies = JSON.parse(localStorage.getItem('messageReplies') || '[]');
                replies.push({
                    to: message.email,
                    from: this.currentAdmin.username,
                    subject: `Re: ${message.subject}`,
                    message: replyText,
                    timestamp: new Date().toISOString()
                });
                localStorage.setItem('messageReplies', JSON.stringify(replies));
                
                // Effacer le champ de réponse
                document.querySelector('#message-details textarea').value = '';
                
                this.showToast('Réponse envoyée', 'success');
                
                // Ajouter une notification
                this.addNotification(
                    'message_replied',
                    `Réponse envoyée à ${message.email}`,
                    'info'
                );
            } else {
                this.showToast('Veuillez écrire une réponse', 'warning');
            }
        }
    }
    
    // === MENU ===
    loadMenuItems() {
        // Pour l'instant, chargement simulé
        // Dans une vraie application, cela viendrait d'une base de données
        const menuItems = [
            {
                id: 1,
                name: "Bœuf Bourguignon",
                description: "Bœuf mijoté au vin rouge de Bourgogne",
                price: 24,
                category: "plats",
                image: "https://images.unsplash.com/photo-1600891964092-4316c288032e",
                tags: ["populaire"]
            },
            {
                id: 2,
                name: "Magret de Canard",
                description: "Magret de canard grillé, sauce aux fruits rouges",
                price: 28,
                category: "plats",
                image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b",
                tags: ["spécialité"]
            },
            {
                id: 3,
                name: "Tarte Tatin",
                description: "Tarte aux pommes caramélisées",
                price: 12,
                category: "desserts",
                image: "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e",
                tags: ["végétarien"]
            }
        ];
        
        const container = document.getElementById('menu-items-container');
        if (!container) return;
        
        let html = '';
        menuItems.forEach(item => {
            html += `
                <div class="col-md-4 mb-4">
                    <div class="admin-card">
                        <div class="position-relative">
                            <img src="${item.image}" 
                                 class="card-img-top" 
                                 alt="${item.name}"
                                 style="height: 200px; object-fit: cover;">
                            <div class="position-absolute top-0 end-0 m-2">
                                ${item.tags.map(tag => `
                                    <span class="badge bg-gold me-1">${tag}</span>
                                `).join('')}
                            </div>
                        </div>
                        <div class="card-body">
                            <div class="d-flex justify-content-between align-items-start mb-2">
                                <h5 class="card-title mb-0">${item.name}</h5>
                                <span class="h5 text-gold mb-0">${item.price}€</span>
                            </div>
                            <p class="card-text text-muted small">${item.description}</p>
                            <div class="d-flex justify-content-between align-items-center">
                                <span class="badge bg-secondary">${item.category}</span>
                                <div class="btn-group btn-group-sm">
                                    <button class="btn btn-outline-primary btn-action" 
                                            data-action="edit-item" 
                                            data-target="${item.id}">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-outline-danger btn-action" 
                                            data-action="delete-item" 
                                            data-target="${item.id}">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    }
    
    editMenuItem(itemId) {
        // Logique d'édition d'un élément du menu
        this.showToast('Édition du plat #' + itemId, 'info');
        // Ouvrir un modal d'édition
    }
    
    deleteMenuItem(itemId) {
        if (confirm('Êtes-vous sûr de vouloir supprimer ce plat ?')) {
            // Logique de suppression
            this.showToast('Plat #' + itemId + ' supprimé', 'success');
            this.loadMenuItems();
            
            // Ajouter une notification
            this.addNotification(
                'menu_item_deleted',
                `Plat #${itemId} supprimé du menu`,
                'warning'
            );
        }
    }
    
    // === COMMANDES ===
    loadOrders() {
        // Chargement simulé des commandes
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        const container = document.getElementById('orders-table');
        
        if (!container) return;
        
        if (orders.length === 0) {
            container.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center py-4 text-muted">
                        <i class="fas fa-shopping-cart fa-2x mb-3"></i>
                        <p class="mb-0">Aucune commande</p>
                    </td>
                </tr>
            `;
            return;
        }
        
        let html = '';
        orders.forEach(order => {
            let statusBadge = '';
            switch(order.status) {
                case 'pending': statusBadge = '<span class="badge bg-warning">En attente</span>'; break;
                case 'preparing': statusBadge = '<span class="badge bg-info">En préparation</span>'; break;
                case 'ready': statusBadge = '<span class="badge bg-success">Prête</span>'; break;
                case 'delivered': statusBadge = '<span class="badge bg-secondary">Livrée</span>'; break;
                default: statusBadge = '<span class="badge bg-secondary">Terminée</span>';
            }
            
            html += `
                <tr>
                    <td>#${order.id}</td>
                    <td>${order.customerName}</td>
                    <td>${order.total}€</td>
                    <td>${statusBadge}</td>
                    <td>${new Date(order.date).toLocaleDateString('fr-FR')}</td>
                    <td>
                        <button class="btn btn-sm btn-outline-primary">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                </tr>
            `;
        });
        
        container.innerHTML = html;
    }
    
    // === DASHBOARD ===
    initDashboard() {
        // Initialiser les graphiques si Chart.js est disponible
        if (typeof Chart !== 'undefined') {
            this.initCharts();
        }
    }
    
    initCharts() {
        // Graphique des réservations
        const reservationsCtx = document.getElementById('reservationsChart');
        if (reservationsCtx) {
            new Chart(reservationsCtx, {
                type: 'line',
                data: {
                    labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
                    datasets: [{
                        label: 'Réservations',
                        data: [12, 19, 15, 25, 22, 30, 28],
                        borderColor: '#D4AF37',
                        backgroundColor: 'rgba(212, 175, 55, 0.1)',
                        tension: 0.4,
                        fill: true
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });
        }
        
        // Graphique des statuts
        const statusCtx = document.getElementById('statusChart');
        if (statusCtx) {
            new Chart(statusCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Confirmées', 'En attente', 'Annulées'],
                    datasets: [{
                        data: [65, 15, 20],
                        backgroundColor: [
                            '#28a745',
                            '#ffc107',
                            '#6c757d'
                        ]
                    }]
                }
            });
        }
    }
    
    // === PARAMÈTRES ===
    setupSettings() {
        // Général
        const generalForm = document.getElementById('general-settings-form');
        if (generalForm) {
            generalForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveGeneralSettings();
            });
        }
        
        // Informations restaurant
        const restaurantForm = document.getElementById('restaurant-info-form');
        if (restaurantForm) {
            restaurantForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveRestaurantInfo();
            });
        }
        
        // Horaires
        this.loadHours();
        const hoursForm = document.getElementById('hours-form');
        if (hoursForm) {
            hoursForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveHours();
            });
        }
        
        // Sauvegarde
        const backupBtn = document.getElementById('backup-data');
        if (backupBtn) {
            backupBtn.addEventListener('click', () => this.backupData());
        }
        
        const restoreBtn = document.getElementById('restore-data');
        if (restoreBtn) {
            restoreBtn.addEventListener('click', () => this.restoreData());
        }
    }
    
    loadHours() {
        const hours = JSON.parse(localStorage.getItem('restaurantHours') || JSON.stringify({
            monday: { open: '12:00', close: '23:00', closed: false },
            tuesday: { open: '12:00', close: '23:00', closed: false },
            wednesday: { open: '12:00', close: '23:00', closed: false },
            thursday: { open: '12:00', close: '23:00', closed: false },
            friday: { open: '12:00', close: '00:00', closed: false },
            saturday: { open: '12:00', close: '00:00', closed: false },
            sunday: { open: '12:00', close: '16:00', closed: false }
        }));
        
        const container = document.getElementById('hours-container');
        if (!container) return;
        
        const days = {
            monday: 'Lundi',
            tuesday: 'Mardi',
            wednesday: 'Mercredi',
            thursday: 'Jeudi',
            friday: 'Vendredi',
            saturday: 'Samedi',
            sunday: 'Dimanche'
        };
        
        let html = '';
        for (const [key, dayName] of Object.entries(days)) {
            const day = hours[key];
            html += `
                <div class="row mb-3 align-items-center">
                    <div class="col-md-3">
                        <label class="form-label fw-bold">${dayName}</label>
                    </div>
                    <div class="col-md-3">
                        <input type="time" class="form-control" 
                               value="${day.open}" 
                               data-day="${key}" 
                               data-type="open">
                    </div>
                    <div class="col-md-3">
                        <input type="time" class="form-control" 
                               value="${day.close}" 
                               data-day="${key}" 
                               data-type="close">
                    </div>
                    <div class="col-md-3">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" 
                                   ${day.closed ? 'checked' : ''}
                                   data-day="${key}">
                            <label class="form-check-label">Fermé</label>
                        </div>
                    </div>
                </div>
            `;
        }
        
        container.innerHTML = html;
    }
    
    saveGeneralSettings() {
        const settings = {
            name: document.getElementById('restaurant-name').value,
            currency: document.getElementById('currency').value,
            timezone: document.getElementById('timezone').value,
            maintenance: document.getElementById('maintenance-mode').checked
        };
        
        localStorage.setItem('generalSettings', JSON.stringify(settings));
        this.showToast('Paramètres généraux enregistrés', 'success');
    }
    
    saveRestaurantInfo() {
        const info = {
            address: document.getElementById('restaurant-address').value,
            phone: document.getElementById('restaurant-phone').value,
            email: document.getElementById('restaurant-email').value,
            description: document.getElementById('restaurant-description').value
        };
        
        localStorage.setItem('restaurantInfo', JSON.stringify(info));
        this.showToast('Informations enregistrées', 'success');
    }
    
    saveHours() {
        const hours = {};
        const inputs = document.querySelectorAll('#hours-container [data-day]');
        
        inputs.forEach(input => {
            const day = input.dataset.day;
            const type = input.dataset.type;
            
            if (!hours[day]) {
                hours[day] = {};
            }
            
            if (type) {
                hours[day][type] = input.value;
            } else {
                hours[day].closed = input.checked;
            }
        });
        
        localStorage.setItem('restaurantHours', JSON.stringify(hours));
        this.showToast('Horaires enregistrés', 'success');
    }
    
    backupData() {
        const data = {
            reservations: JSON.parse(localStorage.getItem('reservations') || '[]'),
            messages: JSON.parse(localStorage.getItem('contactMessages') || '[]'),
            orders: JSON.parse(localStorage.getItem('orders') || '[]'),
            settings: JSON.parse(localStorage.getItem('generalSettings') || '{}'),
            hours: JSON.parse(localStorage.getItem('restaurantHours') || '{}'),
            info: JSON.parse(localStorage.getItem('restaurantInfo') || '{}'),
            backupDate: new Date().toISOString()
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `backup-bistro-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        this.showToast('Sauvegarde téléchargée', 'success');
    }
    
    restoreData() {
        const fileInput = document.getElementById('backup-file');
        if (!fileInput.files.length) {
            this.showToast('Veuillez sélectionner un fichier', 'warning');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                // Vérifier la structure
                if (!data.reservations || !data.messages) {
                    throw new Error('Format de fichier invalide');
                }
                
                // Restaurer les données
                localStorage.setItem('reservations', JSON.stringify(data.reservations || []));
                localStorage.setItem('contactMessages', JSON.stringify(data.messages || []));
                localStorage.setItem('orders', JSON.stringify(data.orders || []));
                localStorage.setItem('generalSettings', JSON.stringify(data.settings || {}));
                localStorage.setItem('restaurantHours', JSON.stringify(data.hours || {}));
                localStorage.setItem('restaurantInfo', JSON.stringify(data.info || {}));
                
                // Recharger les données
                this.loadAdminData();
                
                this.showToast('Données restaurées avec succès', 'success');
                
                // Ajouter une notification
                this.addNotification(
                    'data_restored',
                    'Sauvegarde restaurée',
                    'info'
                );
                
            } catch (error) {
                this.showToast('Erreur: Fichier invalide', 'danger');
                console.error(error);
            }
        };
        
        reader.readAsText(file);
    }
    
    // === UTILITAIRES ===
    getTimeAgo(date) {
        const seconds = Math.floor((new Date() - date) / 1000);
        
        let interval = Math.floor(seconds / 31536000);
        if (interval >= 1) return `il y a ${interval} an${interval > 1 ? 's' : ''}`;
        
        interval = Math.floor(seconds / 2592000);
        if (interval >= 1) return `il y a ${interval} mois`;
        
        interval = Math.floor(seconds / 86400);
        if (interval >= 1) return `il y a ${interval} jour${interval > 1 ? 's' : ''}`;
        
        interval = Math.floor(seconds / 3600);
        if (interval >= 1) return `il y a ${interval} heure${interval > 1 ? 's' : ''}`;
        
        interval = Math.floor(seconds / 60);
        if (interval >= 1) return `il y a ${interval} minute${interval > 1 ? 's' : ''}`;
        
        return 'à l\'instant';
    }
    
    showToast(message, type = 'info') {
        // Créer un toast Bootstrap
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
        
        // Ajouter au conteneur ou en créer un
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            document.body.appendChild(container);
        }
        
        container.appendChild(toast);
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Supprimer après la disparition
        toast.addEventListener('hidden.bs.toast', function () {
            this.remove();
        });
    }
    
    addNotification(type, message, level = 'info') {
        const notifications = JSON.parse(localStorage.getItem('adminNotifications') || '[]');
        notifications.push({
            type,
            message,
            level,
            timestamp: new Date().toISOString(),
            read: false
        });
        localStorage.setItem('adminNotifications', JSON.stringify(notifications));
        
        // Mettre à jour l'affichage
        this.updateNotificationBadges();
    }
}

// Initialiser le système admin
let adminSystem;

document.addEventListener('DOMContentLoaded', function() {
    adminSystem = new AdminSystem();
});

// Exposer pour utilisation globale
window.adminSystem = adminSystem;