// ============================================================
// GoalChain GoalPoints Backend — Google Apps Script
// Instrucciones de deploy:
// 1. Ve a script.google.com → Nuevo Proyecto
// 2. Pega este código completo
// 3. Crea una hoja llamada "GoalPoints" con estas columnas:
//    A: wallet | B: points | C: tasks | D: last_updated
// 4. Deploy → Nueva Implementación → Aplicación Web
//    - Ejecutar como: Yo
//    - Acceso: Cualquier persona (anónimo)
// 5. Copia la URL del deployment y pégala en goalpoints_api.js
// ============================================================

const SHEET_NAME = 'GoalPoints';

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(5000);
  
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    if (action === 'save') {
      return savePoints(data);
    } else if (action === 'get') {
      return getPoints(data.wallet);
    }
    
    return jsonResponse({ error: 'Unknown action' }, 400);
  } catch (err) {
    return jsonResponse({ error: err.message }, 500);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  const action = e.parameter.action || 'leaderboard';
  
  if (action === 'leaderboard') {
    return getLeaderboard();
  } else if (action === 'get' && e.parameter.wallet) {
    return getPoints(e.parameter.wallet);
  }
  
  return jsonResponse({ error: 'Invalid request' }, 400);
}

function savePoints(data) {
  const { wallet, points, tasks } = data;
  
  if (!wallet || points === undefined) {
    return jsonResponse({ error: 'wallet and points required' }, 400);
  }
  
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  
  // Buscar si ya existe esta wallet
  let rowIndex = -1;
  for (let i = 1; i < rows.length; i++) { // Skip header
    if (rows[i][0] === wallet) {
      rowIndex = i + 1; // 1-indexed for Sheets
      break;
    }
  }
  
  const timestamp = new Date().toISOString();
  const tasksStr = JSON.stringify(tasks || []);
  
  if (rowIndex === -1) {
    // Nueva wallet — agregar fila
    sheet.appendRow([wallet, points, tasksStr, timestamp]);
  } else {
    // Wallet existente — actualizar si los puntos son mayores o iguales
    const currentPoints = parseInt(rows[rowIndex - 1][1]) || 0;
    if (points >= currentPoints) {
      sheet.getRange(rowIndex, 2).setValue(points);
      sheet.getRange(rowIndex, 3).setValue(tasksStr);
      sheet.getRange(rowIndex, 4).setValue(timestamp);
    }
  }
  
  return jsonResponse({ success: true, wallet, points });
}

function getPoints(wallet) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === wallet) {
      return jsonResponse({
        wallet: rows[i][0],
        points: parseInt(rows[i][1]) || 0,
        tasks: JSON.parse(rows[i][2] || '[]'),
        last_updated: rows[i][3]
      });
    }
  }
  
  return jsonResponse({ wallet, points: 0, tasks: [] });
}

function getLeaderboard() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues();
  
  // Saltar header, mapear y ordenar por puntos desc
  const players = rows.slice(1)
    .filter(r => r[0] && parseInt(r[1]) > 0)
    .map(r => ({
      wallet: r[0],
      // Mostrar wallet abreviada para privacidad
      display: r[0].slice(0, 6) + '...' + r[0].slice(-4),
      points: parseInt(r[1]) || 0,
      tasks_count: (JSON.parse(r[2] || '[]')).length
    }))
    .sort((a, b) => b.points - a.points)
    .slice(0, 50); // Top 50
  
  return jsonResponse({ leaderboard: players, total: players.length });
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
