/**
 * GoalChain Dialect Prototype (Smart Notifications)
 * Logic for Web3 notifications and engagement.
 */

class DialectApp {
    constructor() {
        this.bell = document.getElementById('notifBell');
        this.badge = document.getElementById('notifBadge');
        this.inbox = document.getElementById('notifInbox');
        this.closeBtn = document.getElementById('closeNotif');
        this.optInBtn = document.getElementById('optInBtn');
        this.notifList = document.getElementById('notifList');
        this.optInContainer = document.getElementById('optInContainer');

        this.isSubscribed = localStorage.getItem('gc_notif_subscribed') === 'true';
        this.messages = JSON.parse(localStorage.getItem('gc_notif_messages') || '[]');
        
        this.init();
    }

    init() {
        this.setupListeners();
        this.updateBadge();
        this.renderMessages();
    }

    setupListeners() {
        if (this.bell) this.bell.onclick = () => this.toggleInbox();
        if (this.closeBtn) this.closeBtn.onclick = () => this.toggleInbox();
        if (this.optInBtn) this.optInBtn.onclick = () => this.subscribe();
    }

    toggleInbox() {
        const isOpen = this.inbox.style.transform === 'translateX(0px)';
        this.inbox.style.transform = isOpen ? 'translateX(400px)' : 'translateX(0px)';
        if (!isOpen) {
            this.markAsRead();
        }
    }

    subscribe() {
        this.optInBtn.innerText = "FIRMANDO MENSAJE...";
        // Simulación de firma de wallet para crear cuenta en Dialect
        setTimeout(() => {
            this.isSubscribed = true;
            localStorage.setItem('gc_notif_subscribed', 'true');
            this.optInContainer.style.display = 'none';
            this.notify("🚀 ¡Bienvenido a GoalChain Alerts!", "Ya estás suscrito. Recibirás actualizaciones críticas aquí.");
        }, 1500);
    }

    notify(title, body) {
        const newMsg = {
            id: Date.now(),
            title,
            body,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true
        };
        
        this.messages.unshift(newMsg);
        localStorage.setItem('gc_notif_messages', JSON.stringify(this.messages));
        
        this.updateBadge();
        this.renderMessages();
        this.showToast(title);
    }

    updateBadge() {
        const unreadCount = this.messages.filter(m => m.unread).length;
        if (unreadCount > 0) {
            this.badge.innerText = unreadCount;
            this.badge.style.display = 'block';
            this.bell.style.transform = 'scale(1.2)';
            setTimeout(() => this.bell.style.transform = 'scale(1)', 300);
        } else {
            this.badge.style.display = 'none';
        }
    }

    markAsRead() {
        this.messages.forEach(m => m.unread = false);
        localStorage.setItem('gc_notif_messages', JSON.stringify(this.messages));
        this.updateBadge();
    }

    renderMessages() {
        if (!this.isSubscribed) return;
        
        const content = this.messages.map(m => `
            <div class="notif-item" style="padding:12px; border-bottom:1px solid rgba(255,255,255,0.05); background:${m.unread ? 'rgba(20,241,149,0.05)' : 'transparent'};">
                <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                    <strong style="font-size:0.75rem; color:var(--primary);">${m.title}</strong>
                    <span style="font-size:0.6rem; color:var(--text-dim);">${m.time}</span>
                </div>
                <p style="font-size:0.7rem; margin:0; color:white; line-height:1.2;">${m.body}</p>
            </div>
        `).join('');
        
        this.notifList.innerHTML = content || '<p style="text-align:center; font-size:0.7rem; color:var(--text-dim); padding:20px;">No hay mensajes.</p>';
    }

    showToast(title) {
        // Un pequeño aviso visual rápido cuando llega una notificación
        console.log("GoalChain Notification:", title);
    }
}

// Inicializar y exponer globalmente para que el juego pueda usarlo
document.addEventListener('DOMContentLoaded', () => {
    window.gcDialect = new DialectApp();
});
