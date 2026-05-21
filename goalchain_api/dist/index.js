"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@coral-xyz/anchor");
const sdk_1 = require("@goalchain/sdk");
const fs_1 = __importDefault(require("fs"));
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, '../../.env') });
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";
app.use((0, cors_1.default)());
app.use(express_1.default.json());
const connection = new web3_js_1.Connection(rpcUrl, 'confirmed');
// Provider placeholder (readonly)
const provider = new anchor_1.AnchorProvider(connection, {}, { commitment: 'confirmed' });
const program = new anchor_1.Program(sdk_1.idl, provider);
const cacheSession = {
    cachedContentId: null,
    expireTime: null
};
/**
 * Gets the active Gemini Context Cache ID or uploads a new one if expired/missing.
 * Caches the 528 players database and GoalChain tactical guidelines.
 */
async function getOrUpdateContextCache(apiKey) {
    const now = new Date();
    // Cache Hit
    if (cacheSession.cachedContentId && cacheSession.expireTime && cacheSession.expireTime > now) {
        console.log(`ℹ️ [AI Orchestrator] Context Cache HIT: Usando cache existente -> ${cacheSession.cachedContentId}`);
        return cacheSession.cachedContentId;
    }
    console.log("⚠️ [AI Orchestrator] Context Cache MISS: Generando nuevo cache de contexto en Google Gemini...");
    // Load player database
    let playersJson = "";
    try {
        const playersPath = path_1.default.resolve(__dirname, '../../docs/assets/data/players.json');
        if (fs_1.default.existsSync(playersPath)) {
            playersJson = fs_1.default.readFileSync(playersPath, 'utf-8');
            console.log(`📊 [AI Orchestrator] Base de datos de jugadores cargada correctamente (${Math.round(playersJson.length / 1024)} KB)`);
        }
        else {
            console.warn("⚠️ [AI Orchestrator] No se encontró players.json en docs/assets/data/players.json");
        }
    }
    catch (err) {
        console.error("❌ [AI Orchestrator] Error al leer players.json:", err);
    }
    // Compile massive reference context
    const masterContext = `Eres Eliza, la Coach Táctica de Inteligencia Artificial de GoalChain. Analizas la alineación y das consejos para maximizar yield de $GCH y estadísticas de juego.
  
=== GOALCHAIN DATABASE (528 JUGADORES REALES REBALANCEADOS Y LORE DE ÉLITE) ===
${playersJson}

=== DIRECTRICES TÁCTICAS Y REGLAS DE RENDIMIENTO DE GOALCHAIN ===
1. **Regla de Estamina y Cansancio (Fatiga):**
   - Estamina inicial: 100%. Disminuye al jugar.
   - Si la estamina cae por debajo de 80%, se aplica una penalización directa al Yield diario de $GCH igual a \`1 - (stamina / 100)\`. Por ejemplo, con 75% de estamina, el mánager tiene una penalización del 25% en ganancias diarias.
   - Solución: Comprar una poción de estamina en el vestuario por 10 $GCH.
2. **Sinergias de Plantilla (Starting XI Chemistry):**
   - **Sinergia de País:** 11 jugadores de la misma nacionalidad en el Starting XI otorgan +25% de bonus en todas las estadísticas de tu cromo Genesis.
   - **Sinergia de Club:** 11 jugadores del mismo club en el Starting XI otorgan +15% de bonus de Yield de sueldo diario de $GCH.
3. **Camisetas Equipadas (Jerseys):**
   - En la Copa del Mundo ('world_cup'), equipar la Camiseta de Selección ('jersey_arg') da +3% de Yield y +5 Max Stamina.
   - En la MLS ('mls'), equipar la Camiseta de Club ('jersey_club' o Inter Miami Pink) activa un multiplicador del +5% de Yield.
4. **Estadios (Stadium Theme / Home Advantage):**
   - Si el tema del estadio coincide con el visualbg preferido de tu jugador Genesis, se activa el "Home Advantage" (Ventaja de Local), potenciando estadísticas en simulación.
5. **Estrategia Económica (Contrato Profesional):**
   - Los mánagers ganan sueldos diarios en $GCH según desempeño, sinergias y estamina.
   - Los ingresos por ventas/minting de NFTs se depositan en Liquid Staking (JitoSOL/mSOL) en Solana para la recompra mecánica de $GCH y quema, lo que aumenta la APR de liquidez.

=== REGLAS CRÍTICAS DE SEGURIDAD Y COMPORTAMIENTO ===
1. Responde en español de forma extremadamente concisa (1-3 oraciones), motivadora y con emojis.
2. Si la consulta del usuario NO TIENE NADA QUE VER con fútbol, GoalChain, estamina, tácticas o $GCH, debes rechazar responder diciendo textualmente: "⚠️ Solo puedo resolver dudas tácticas sobre GoalChain y tu plantilla."
`;
    // Standard API Endpoint for Caching (v1beta is required)
    const url = `https://generativelanguage.googleapis.com/v1beta/cachedContents?key=${apiKey}`;
    const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            model: "models/gemini-2.5-flash", // Flash Model optimized for Context Caching
            displayName: "goalchain_players_tactics",
            ttl: "86400s", // 24 Hours duration
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: masterContext }
                    ]
                }
            ]
        })
    });
    if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Gemini Context Cache API returned status ${response.status}: ${errText}`);
    }
    const data = await response.json();
    if (data.name) {
        cacheSession.cachedContentId = data.name;
        // Set expiration time from API response or fallback to 24 hours
        cacheSession.expireTime = data.expireTime ? new Date(data.expireTime) : new Date(Date.now() + 24 * 60 * 60 * 1000);
        console.log(`✅ [AI Orchestrator] Nuevo Context Cache registrado: ${data.name} (Expira: ${cacheSession.expireTime.toISOString()})`);
        return data.name;
    }
    else {
        throw new Error("Invalid response format from Gemini Context Caching API.");
    }
}
// --- ROUTES ---
// Healthcheck
app.get('/health', (req, res) => {
    res.json({ status: 'OK', message: 'GoalChain API is running', programId: sdk_1.PROGRAM_ID.toBase58() });
});
// Whitelist: Save wallet and email
app.post('/api/whitelist', (req, res) => {
    const { wallet, email } = req.body;
    if (!wallet) {
        return res.status(400).json({ error: 'Wallet address is required' });
    }
    const dataPath = path_1.default.join(__dirname, '../data/whitelist.json');
    const dataDir = path_1.default.dirname(dataPath);
    try {
        // Asegurar que la carpeta data existe
        if (!fs_1.default.existsSync(dataDir)) {
            fs_1.default.mkdirSync(dataDir, { recursive: true });
        }
        let whitelist = [];
        if (fs_1.default.existsSync(dataPath)) {
            const fileContent = fs_1.default.readFileSync(dataPath, 'utf-8');
            whitelist = JSON.parse(fileContent);
        }
        // Evitar duplicados
        const exists = whitelist.find((entry) => entry.wallet === wallet);
        if (!exists) {
            whitelist.push({
                wallet,
                email: email || '',
                timestamp: new Date().toISOString()
            });
            fs_1.default.writeFileSync(dataPath, JSON.stringify(whitelist, null, 2));
            console.log(`✅ Whitelist: Nueva wallet registrada -> ${wallet}`);
            res.json({ success: true, message: 'Registrado con éxito' });
        }
        else {
            res.json({ success: true, message: 'Wallet ya estaba registrada' });
        }
    }
    catch (err) {
        console.error('Whitelist Error:', err);
        res.status(500).json({ error: 'Failed to save to whitelist' });
    }
});
// Chat Proxy Route for Eliza AI Coach & Advisor (securely hides developer's GEMINI_API_KEY with strict guardrails)
app.post('/api/coach/chat', async (req, res) => {
    const { userText, context } = req.body;
    if (!userText) {
        return res.status(400).json({ error: 'userText is required' });
    }
    // Guardrail 1: Limitar la longitud de la consulta del usuario (máximo 200 caracteres)
    if (userText.length > 200) {
        return res.json({
            reply: '⚠️ La consulta es demasiado larga. Para optimizar costos, por favor escribe una pregunta breve de menos de 200 caracteres.'
        });
    }
    // Guardrail 2: Filtro proactivo de palabras clave sospechosas (evita programar, tareas escolares, etc.)
    const forbiddenKeywords = [
        'python', 'javascript', 'html', 'css', 'java', 'c++', 'programar', 'código', 'code', 'script',
        'algoritmo', 'ecuación', 'matemática', 'álgebra', 'física', 'tarea', 'crear app', 'desarrollar',
        'hackear', 'grok', 'openai', 'gpt', 'essay', 'escribir un', 'resumir', 'historia de', 'traducir'
    ];
    const queryLower = userText.toLowerCase();
    const isSuspicious = forbiddenKeywords.some(keyword => queryLower.includes(keyword));
    if (isSuspicious) {
        return res.json({
            reply: '⚠️ Como Coach Táctica de GoalChain, solo puedo asistirte con consultas relacionadas con el juego, fútbol y la optimización de tu plantilla. No puedo resolver tareas académicas ni programar aplicaciones.'
        });
    }
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.warn("⚠️ GEMINI_API_KEY is not configured in .env server file.");
        return res.status(500).json({ error: 'Gemini API Key is not configured on the server.' });
    }
    // Fallback System Prompt in case Cache creation fails
    const ctx = context || {};
    const serverSystemPrompt = `Eres Eliza, la Coach Táctica de Inteligencia Artificial de GoalChain. Analizas la alineación y das consejos para maximizar yield de $GCH y estadísticas de juego.
Datos del manager:
- Jugador actual: ${ctx.pName || 'Lionel Satoshi'} (${ctx.pStats || 'ATK:95 DEF:48 SPD:92 HYP:99'})
- Stamina: ${ctx.stamina ?? 100}%
- Liga activa: ${ctx.activeLeague || 'world_cup'}
- Camiseta: ${ctx.jersey || 'Ninguna'}
- Sinergia País: ${ctx.sameCountry ?? 1}/11, Sinergia Club: ${ctx.sameClub ?? 1}/11
- Tema Estadio: ${ctx.stadium || 'desert'}
- Balance: ${ctx.balance ?? 1240} $GCH

REGLAS CRÍTICAS DE SEGURIDAD Y COMPORTAMIENTO:
1. Responde en español de forma extremadamente concisa (1-3 oraciones), motivadora y con emojis.
2. Si la consulta del usuario NO TIENE NADA QUE VER con fútbol, GoalChain, estamina, tácticas o $GCH, debes rechazar responder diciendo textualmente: "⚠️ Solo puedo resolver dudas tácticas sobre GoalChain y tu plantilla."
`;
    // Step 1: Try to retrieve or create Context Cache
    let cachedContentId = null;
    try {
        cachedContentId = await getOrUpdateContextCache(apiKey);
    }
    catch (err) {
        console.warn(`⚠️ [AI Orchestrator] No se pudo crear o recuperar el Context Cache (Fallback a modo Legacy):`, err.message);
    }
    // Step 2: Build the prompt query
    const queryText = `Datos actuales del manager:
- Jugador actual: ${ctx.pName || 'Lionel Satoshi'} (${ctx.pStats || 'ATK:95 DEF:48 SPD:92 HYP:99'})
- Stamina: ${ctx.stamina ?? 100}%
- Liga activa: ${ctx.activeLeague || 'world_cup'}
- Camiseta: ${ctx.jersey || 'Ninguna'}
- Sinergia País: ${ctx.sameCountry ?? 1}/11, Sinergia Club: ${ctx.sameClub ?? 1}/11
- Tema Estadio: ${ctx.stadium || 'desert'}
- Balance: ${ctx.balance ?? 1240} $GCH

Pregunta del manager: "${userText}"`;
    try {
        const requestBody = {
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: cachedContentId ? queryText : serverSystemPrompt + `\nPregunta del manager: "${userText}"` }
                    ]
                }
            ],
            generationConfig: {
                temperature: 0.6,
                maxOutputTokens: 800
            }
        };
        // If cache hit, link cachedContent handle
        if (cachedContentId) {
            requestBody.cachedContent = cachedContentId;
            console.log(`🚀 [AI Orchestrator] Enviando consulta con Cache Hit [${cachedContentId}]`);
        }
        else {
            console.log(`🚀 [AI Orchestrator] Enviando consulta en Modo Legacy (Sin Caché)`);
        }
        // Call the Flash Model generateContent API (v1beta required for context caching)
        const modelEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
        const fetchResponse = await fetch(modelEndpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody)
        });
        if (!fetchResponse.ok) {
            const errorData = await fetchResponse.text();
            throw new Error(`Gemini API returned status ${fetchResponse.status}: ${errorData}`);
        }
        const data = await fetchResponse.json();
        const candidate = data.candidates?.[0];
        const part = candidate?.content?.parts?.[0];
        if (part && part.text) {
            const reply = part.text.trim();
            res.json({ reply });
        }
        else {
            console.error("Gemini API structure error:", JSON.stringify(data, null, 2));
            res.status(500).json({ error: 'Invalid response structure from Gemini API: ' + JSON.stringify(data) });
        }
    }
    catch (error) {
        console.error("Error connecting to Gemini API:", error);
        res.status(500).json({ error: 'Failed to communicate with Gemini API: ' + error.message });
    }
});
app.listen(port, () => {
    console.log(`GoalChain API listening at http://localhost:${port}`);
});
