/**
 * goalpoints_api.js — GoalChain GoalPoints Cloud Sync
 * Sincroniza los puntos del usuario con el backend de Google Sheets.
 * Siempre funciona con localStorage como capa local (offline-first).
 */

// ⚠️ REEMPLAZA ESTA URL CON LA DE TU GOOGLE APPS SCRIPT DEPLOYMENT
const GOALPOINTS_API_URL = 'https://script.google.com/macros/s/AKfycbxCupZUfWC0RXjpNQQbrtnU3WBetkzh22k9EM0rbaYuGkRuHgJzCSdJB9Bn-nGzTdHD/exec';

const GoalPointsAPI = {
    
    /**
     * Sincroniza los puntos locales del usuario al servidor.
     * Se llama automáticamente después de cada tarea completada.
     */
    sync: async function() {
        const wallet = localStorage.getItem('goalchain_wallet');
        if (!wallet) return; // Sin wallet, no hay nada que sincronizar
        
        const points = parseInt(localStorage.getItem('goalpoints') || '0');
        const tasks  = JSON.parse(localStorage.getItem('completed_tasks') || '[]');
        
        try {
            const res = await fetch(GOALPOINTS_API_URL, {
                method: 'POST',
                mode: 'no-cors', // Necesario para Google Apps Script
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'save', wallet, points, tasks })
            });
            console.log('✅ GoalPoints sincronizados con el servidor:', points);
        } catch (err) {
            // Offline o error → los datos quedan seguros en localStorage
            console.warn('⚠️ Sync fallido (modo offline). Datos guardados localmente.', err);
        }
    },

    /**
     * Carga los puntos de un wallet desde el servidor.
     * Si el servidor tiene más puntos que localStorage, los restaura.
     * Útil cuando el usuario cambia de dispositivo.
     */
    load: async function(wallet) {
        if (!wallet) return null;
        
        try {
            const url = `${GOALPOINTS_API_URL}?action=get&wallet=${encodeURIComponent(wallet)}`;
            const res = await fetch(url);
            if (!res.ok) return null;
            
            const data = await res.json();
            const localPts  = parseInt(localStorage.getItem('goalpoints') || '0');
            const serverPts = parseInt(data.points || '0');
            
            // Si el servidor tiene más puntos, los restauramos (protección anti-pérdida)
            if (serverPts > localPts) {
                localStorage.setItem('goalpoints', serverPts);
                localStorage.setItem('completed_tasks', JSON.stringify(data.tasks || []));
                console.log(`🔄 Puntos restaurados desde servidor: ${serverPts}`);
                if (window.updateGoalPoints) window.updateGoalPoints();
            }
            
            return data;
        } catch (err) {
            console.warn('⚠️ No se pudo cargar desde servidor. Usando datos locales.', err);
            return null;
        }
    },

    /**
     * Obtiene el leaderboard global desde el servidor.
     * Retorna los Top 50 jugadores ordenados por puntos.
     */
    getLeaderboard: async function() {
        try {
            const url = `${GOALPOINTS_API_URL}?action=leaderboard`;
            const res = await fetch(url);
            if (!res.ok) return null;
            const data = await res.json();
            return data.leaderboard || [];
        } catch (err) {
            console.warn('⚠️ No se pudo cargar el leaderboard.', err);
            return null;
        }
    }
};

// Exportar globalmente
window.GoalPointsAPI = GoalPointsAPI;
