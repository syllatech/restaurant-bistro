// Chatbot discret - NE S'OUVRE PAS AUTOMATIQUEMENT
class RestaurantChatbot {
    constructor() {
        this.isVisible = false;
        this.hasWelcomed = false;
        this.messages = [];
        this.init();
    }
    
    init() {
        this.createToggleButton();
        this.setupEventListeners();
        // NE PAS appeler loadGreeting() ici
        // Le chatbot reste fermé jusqu'au clic
    }
    
    createToggleButton() {
        if (!document.getElementById('chatbot-toggle')) {
            const button = document.createElement('button');
            button.id = 'chatbot-toggle';
            button.className = 'chatbot-toggle-btn';
            button.title = 'Assistant virtuel';
            button.innerHTML = '<i class="fas fa-robot"></i>';
            document.body.appendChild(button);
            
            // Style du bouton (à garder dans le CSS)
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #D4AF37, #F4CA16);
                color: white;
                border: none;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 24px;
                cursor: pointer;
                z-index: 10000;
                box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4);
                transition: all 0.3s ease;
            `;
            
            // Effet hover
            button.addEventListener('mouseenter', () => {
                button.style.transform = 'scale(1.1)';
                button.style.boxShadow = '0 8px 25px rgba(212, 175, 55, 0.6)';
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.transform = 'scale(1)';
                button.style.boxShadow = '0 5px 20px rgba(212, 175, 55, 0.4)';
            });
        }
    }
    
    setupEventListeners() {
        document.getElementById('chatbot-toggle').addEventListener('click', () => {
            this.toggleChatbot();
        });
    }
    
    toggleChatbot() {
        if (!this.isVisible) {
            this.openChatbot();
        } else {
            this.closeChatbot();
        }
    }
    
    openChatbot() {
        // Créer le container du chat
        const container = document.createElement('div');
        container.id = 'chatbot-container';
        container.className = 'chatbot-container';
        container.style.cssText = `
            position: fixed;
            bottom: 90px;
            right: 20px;
            width: 350px;
            height: 500px;
            background: white;
            border-radius: 15px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
            z-index: 9999;
            display: flex;
            flex-direction: column;
            font-family: 'Open Sans', sans-serif;
            animation: slideIn 0.3s ease;
        `;
        
        // Ajouter l'animation
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideIn {
                from { transform: translateY(20px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            @keyframes slideOut {
                from { transform: translateY(0); opacity: 1; }
                to { transform: translateY(20px); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
        
        container.innerHTML = `
            <div class="chatbot-header" style="background: linear-gradient(135deg, #2c3e50, #1a252f); color: white; padding: 15px 20px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(255, 255, 255, 0.1);">
                <div style="display: flex; align-items: center;">
                    <div style="width: 40px; height: 40px; background: linear-gradient(45deg, #D4AF37, #F4CA16); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 20px; margin-right: 12px;">
                        <i class="fas fa-robot"></i>
                    </div>
                    <div>
                        <h6 style="margin: 0; font-size: 16px;">Assistant du Bistro</h6>
                        <small style="color: #adb5bd; font-size: 12px;">En ligne</small>
                    </div>
                </div>
                <button id="close-chatbot" style="background: none; border: none; color: white; font-size: 18px; cursor: pointer; padding: 5px;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="chatbot-messages" id="chatbot-messages" style="flex: 1; padding: 20px; overflow-y: auto; background: #f8f9fa;">
                <!-- Messages ici -->
            </div>
            
            <div style="padding: 15px; border-top: 1px solid #e9ecef; background: white;">
                <div style="display: flex; margin-bottom: 10px;">
                    <input type="text" id="chatbot-input" 
                           placeholder="Tapez votre message..." 
                           style="flex: 1; padding: 10px 15px; border: 1px solid #dee2e6; border-radius: 20px 0 0 20px; outline: none; font-size: 14px;">
                    <button id="send-message" style="background: linear-gradient(45deg, #D4AF37, #F4CA16); color: white; border: none; padding: 10px 20px; border-radius: 0 20px 20px 0; cursor: pointer; font-size: 16px;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
                <div id="quick-buttons" style="display: flex; flex-wrap: wrap; gap: 5px;">
                    <!-- Boutons rapides ici -->
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        this.isVisible = true;
        
        // Changer l'icône du bouton toggle
        document.getElementById('chatbot-toggle').innerHTML = '<i class="fas fa-times"></i>';
        
        // Événements
        document.getElementById('close-chatbot').addEventListener('click', () => this.closeChatbot());
        document.getElementById('send-message').addEventListener('click', () => this.sendMessage());
        document.getElementById('chatbot-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        // Message de bienvenue (UNIQUEMENT à la première ouverture)
        if (!this.hasWelcomed) {
            setTimeout(() => {
                this.addBotMessage("Bonjour ! 👋 Je suis l'assistant du Bistro Gourmand. Comment puis-je vous aider ?");
                
                setTimeout(() => {
                    this.showQuickButtons([
                        { text: "📅 Réserver", action: "reserve" },
                        { text: "🍽️ Menu", action: "menu" },
                        { text: "⏰ Horaires", action: "hours" },
                        { text: "📍 Adresse", action: "address" }
                    ]);
                }, 300);
            }, 200);
            
            this.hasWelcomed = true;
        }
        
        // Focus sur l'input
        setTimeout(() => {
            document.getElementById('chatbot-input').focus();
        }, 400);
    }
    
    closeChatbot() {
        const container = document.getElementById('chatbot-container');
        if (container) {
            // Animation de fermeture
            container.style.animation = 'slideOut 0.3s ease';
            
            setTimeout(() => {
                container.remove();
                this.isVisible = false;
                
                // Revenir à l'icône robot
                document.getElementById('chatbot-toggle').innerHTML = '<i class="fas fa-robot"></i>';
            }, 250);
        }
    }
    
    sendMessage() {
        const input = document.getElementById('chatbot-input');
        const message = input.value.trim();
        
        if (!message) return;
        
        this.addUserMessage(message);
        input.value = '';
        
        // Réponse simple
        setTimeout(() => {
            const lowerMsg = message.toLowerCase();
            
            if (lowerMsg.includes('bonjour') || lowerMsg.includes('salut') || lowerMsg.includes('hello')) {
                this.addBotMessage("Bonjour ! 😊 Je peux vous aider avec les réservations, le menu, les horaires ou l'adresse.");
            } else if (lowerMsg.includes('réserv') || lowerMsg.includes('réserver') || lowerMsg.includes('table')) {
                this.addBotMessage("Pour réserver une table, vous pouvez :\n\n1️⃣ Cliquer sur 'Réserver' dans le menu\n2️⃣ Utiliser notre formulaire en ligne\n3️⃣ Nous appeler au 01 23 45 67 89\n\nSouhaitez-vous que je vous redirige vers la page de réservation ?");
                this.showQuickButtons([
                    { text: "Oui, aller à la réservation", action: "go_reserve" },
                    { text: "Non, rester ici", action: "stay" }
                ]);
            } else if (lowerMsg.includes('menu') || lowerMsg.includes('carte') || lowerMsg.includes('plat')) {
                this.addBotMessage("Notre menu complet est disponible sur la page 'Menu'. Nous proposons :\n\n• Entrées (16-24€)\n• Plats principaux (26-38€)\n• Desserts (12-16€)\n• Vins sélectionnés\n\nVoulez-vous voir le menu ?");
                this.showQuickButtons([
                    { text: "Voir le menu", action: "go_menu" },
                    { text: "Recommandations", action: "recommend" }
                ]);
            } else if (lowerMsg.includes('horaire') || lowerMsg.includes('ouvert') || lowerMsg.includes('fermé')) {
                this.addBotMessage("🕐 **Nos horaires d'ouverture :**\n\n• Lundi-Jeudi: 12h-14h30 / 19h-23h\n• Vendredi: 12h-14h30 / 19h-minuit\n• Samedi: 12h-15h / 19h-minuit\n• Dimanche: 12h-16h\n\nNous recommandons de réserver à l'avance !");
            } else if (lowerMsg.includes('adresse') || lowerMsg.includes('où') || lowerMsg.includes('localisation')) {
                this.addBotMessage("📍 **Notre adresse :**\n\nLe Bistro Gourmand\n123 Avenue des Champs-Élysées\n75008 Paris, France\n\n🚗 Parking gratuit disponible\n🚇 Métro: Charles de Gaulle - Étoile");
            } else if (lowerMsg.includes('prix') || lowerMsg.includes('€') || lowerMsg.includes('coût')) {
                this.addBotMessage("💰 **Fourchette de prix :**\n\n• Entrées: 16€ - 24€\n• Plats principaux: 26€ - 38€\n• Desserts: 12€ - 16€\n• Menu Dégustation: 85€\n• Vins: 30€ - 400€ la bouteille");
            } else if (lowerMsg.includes('contact') || lowerMsg.includes('téléphone') || lowerMsg.includes('appeler')) {
                this.addBotMessage("📞 **Nous contacter :**\n\n• Réservations: 01 23 45 67 89\n• Administration: 01 23 45 67 90\n• Email: contact@bistrogourmand.fr\n• WhatsApp: +33 6 12 34 56 78");
            } else if (lowerMsg.includes('merci') || lowerMsg.includes('thanks')) {
                this.addBotMessage("Avec plaisir ! 😊 N'hésitez pas si vous avez d'autres questions.");
            } else {
                this.addBotMessage("Je peux vous aider avec :\n\n📅 Réservations de table\n🍽️ Notre menu et spécialités\n⏰ Horaires d'ouverture\n📍 Notre adresse et accès\n📞 Informations de contact\n💰 Tarifs et menus\n\nPosez-moi une question spécifique !");
            }
        }, 800);
    }
    
    addBotMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const message = document.createElement('div');
        message.className = 'message bot';
        message.style.cssText = 'margin-bottom: 15px; display: flex; justify-content: flex-start; animation: fadeIn 0.5s ease;';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.style.cssText = 'max-width: 80%; padding: 12px 16px; background: white; border: 1px solid #e9ecef; border-radius: 18px 18px 18px 4px; box-shadow: 0 2px 5px rgba(0,0,0,0.05); word-wrap: break-word;';
        content.innerHTML = text.replace(/\n/g, '<br>');
        
        message.appendChild(content);
        messagesContainer.appendChild(message);
        
        // Scroll vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    addUserMessage(text) {
        const messagesContainer = document.getElementById('chatbot-messages');
        if (!messagesContainer) return;
        
        const message = document.createElement('div');
        message.className = 'message user';
        message.style.cssText = 'margin-bottom: 15px; display: flex; justify-content: flex-end; animation: fadeIn 0.5s ease;';
        
        const content = document.createElement('div');
        content.className = 'message-content';
        content.style.cssText = 'max-width: 80%; padding: 12px 16px; background: linear-gradient(135deg, #D4AF37, #F4CA16); color: white; border-radius: 18px 18px 4px 18px; word-wrap: break-word;';
        content.textContent = text;
        
        message.appendChild(content);
        messagesContainer.appendChild(message);
        
        // Scroll vers le bas
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    showQuickButtons(buttons) {
        const container = document.getElementById('quick-buttons');
        if (!container) return;
        
        container.innerHTML = '';
        
        // Style pour les boutons
        const buttonStyle = `
            padding: 8px 12px;
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            transition: all 0.3s ease;
            white-space: nowrap;
            font-family: 'Open Sans', sans-serif;
        `;
        
        const hoverStyle = `
            background: #e9ecef;
            border-color: #D4AF37;
            color: #D4AF37;
        `;
        
        buttons.forEach(btn => {
            const button = document.createElement('button');
            button.textContent = btn.text;
            button.style.cssText = buttonStyle;
            
            // Effet hover
            button.addEventListener('mouseenter', () => {
                button.style.cssText = buttonStyle + hoverStyle;
            });
            
            button.addEventListener('mouseleave', () => {
                button.style.cssText = buttonStyle;
            });
            
            // Actions
            button.onclick = () => {
                if (btn.action === 'reserve' || btn.action === 'go_reserve') {
                    window.location.href = 'reservation.html';
                } else if (btn.action === 'menu' || btn.action === 'go_menu') {
                    window.location.href = 'menu.html';
                } else if (btn.action === 'hours') {
                    this.addBotMessage("🕐 **Nos horaires :**\n\nLun-Jeu: 12h-14h30 / 19h-23h\nVen: 12h-14h30 / 19h-minuit\nSam: 12h-15h / 19h-minuit\nDim: 12h-16h");
                } else if (btn.action === 'address') {
                    this.addBotMessage("📍 **Notre adresse :**\n\nLe Bistro Gourmand\n123 Avenue des Champs-Élysées\n75008 Paris\nMétro: Charles de Gaulle - Étoile");
                } else if (btn.action === 'recommend') {
                    this.addBotMessage("👨‍🍳 **Mes recommandations :**\n\n• Bœuf Bourguignon (24€) - Notre plat signature\n• Magret de Canard (28€) - Sauce aux fruits rouges\n• Tarte Tatin (12€) - Faite maison\n\nTous préparés avec des produits frais !");
                } else if (btn.action === 'stay') {
                    this.addBotMessage("D'accord, je reste à votre disposition ! 😊");
                }
            };
            
            container.appendChild(button);
        });
    }
}

// Initialiser le chatbot SEULEMENT quand on clique
document.addEventListener('DOMContentLoaded', function() {
    // Délai pour être sûr que tout est chargé
    setTimeout(() => {
        // Créer l'instance mais NE PAS ouvrir
        window.chatbot = new RestaurantChatbot();
        
        // OPTIONNEL : Notification subtile après 30 secondes
        setTimeout(() => {
            const toggleBtn = document.getElementById('chatbot-toggle');
            if (toggleBtn && !window.chatbot.isVisible) {
                // Ajouter une petite animation pour attirer l'attention
                toggleBtn.style.animation = 'pulse 2s infinite';
                
                // Créer l'animation pulse
                const pulseStyle = document.createElement('style');
                pulseStyle.textContent = `
                    @keyframes pulse {
                        0% { box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4); }
                        50% { box-shadow: 0 5px 25px rgba(212, 175, 55, 0.8); }
                        100% { box-shadow: 0 5px 20px rgba(212, 175, 55, 0.4); }
                    }
                `;
                document.head.appendChild(pulseStyle);
                
                // Arrêter l'animation au bout de 10 secondes
                setTimeout(() => {
                    toggleBtn.style.animation = '';
                }, 10000);
            }
        }, 30000); // Après 30 secondes
    }, 1500);
});