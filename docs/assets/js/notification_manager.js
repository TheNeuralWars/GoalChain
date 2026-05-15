/**
 * notification_manager.js - Sistema de feedback visual y sonoro
 */

class GoalChainNotifier {
    constructor() {
        this.container = document.createElement('div');
        this.container.id = 'notifier-container';
        this.container.style.cssText = `
            position: fixed; top: 20px; right: 20px; 
            z-index: 10000; display: flex; flex-direction: column; gap: 10px;
        `;
        document.body.appendChild(this.container);

        // Pre-cargar sonidos (usando links de sonidos cortos y limpios)
        this.sfx = {
            success: new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3'), // Ding
            goal: new Audio('https://assets.mixkit.co/active_storage/sfx/265/265-preview.mp3'), // Whistle/Cheer
            click: new Audio('https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3') // Click
        };
        
        // Ajustar volúmenes
        Object.values(this.sfx).forEach(s => s.volume = 0.3);
    }

    show(title, message, type = 'success') {
        const toast = document.createElement('div');
        const colors = {
            success: '#14f195',
            info: '#9945ff',
            warning: '#ff9a33',
            error: '#ff4d6a'
        };
        
        const color = colors[type] || colors.success;
        
        toast.style.cssText = `
            background: rgba(13, 13, 20, 0.9);
            border-left: 4px solid ${color};
            color: white;
            padding: 15px 25px;
            border-radius: 12px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            backdrop-filter: blur(10px);
            min-width: 250px;
            transform: translateX(120%);
            transition: all 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            font-family: 'Outfit', sans-serif;
        `;

        toast.innerHTML = `
            <div style="font-weight: 900; color: ${color}; font-size: 0.75rem; text-transform: uppercase; letter-spacing: 1px;">${title}</div>
            <div style="font-size: 0.85rem; margin-top: 4px;">${message}</div>
        `;

        this.container.appendChild(toast);
        
        // Animación de entrada
        setTimeout(() => toast.style.transform = 'translateX(0)', 10);
        
        // Sonido
        if (type === 'success') this.play('success');

        // Autodestrucción
        setTimeout(() => {
            toast.style.transform = 'translateX(120%)';
            setTimeout(() => toast.remove(), 500);
        }, 4000);
    }

    play(soundName) {
        if (this.sfx[soundName]) {
            this.sfx[soundName].currentTime = 0;
            this.sfx[soundName].play().catch(() => {
                // El navegador bloquea audio si no hay interacción previa, ignoramos.
            });
        }
    }
}

// Inicializar globalmente
window.notifier = new GoalChainNotifier();
