import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { Connection } from '@solana/web3.js';
import { AnchorProvider, Program } from '@coral-xyz/anchor';
import { idl, PROGRAM_ID, GoalchainProgram } from '@goalchain/sdk';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const app = express();
const port = process.env.PORT || 3001;
const rpcUrl = process.env.RPC_URL || "https://api.devnet.solana.com";

app.use(cors());
app.use(express.json());

const connection = new Connection(rpcUrl, 'confirmed');
// Provider placeholder (readonly)
const provider = new AnchorProvider(connection, {} as any, { commitment: 'confirmed' });
const program = new Program(idl as any, provider) as any;

import fs from 'fs';

// --- ROUTES ---

// Healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'GoalChain API is running', programId: PROGRAM_ID.toBase58() });
});

// Whitelist: Save wallet and email
app.post('/api/whitelist', (req, res) => {
  const { wallet, email } = req.body;
  if (!wallet) {
    return res.status(400).json({ error: 'Wallet address is required' });
  }

  const dataPath = path.join(__dirname, '../data/whitelist.json');
  const dataDir = path.dirname(dataPath);

  try {
    // Asegurar que la carpeta data existe
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    let whitelist = [];
    if (fs.existsSync(dataPath)) {
      const fileContent = fs.readFileSync(dataPath, 'utf-8');
      whitelist = JSON.parse(fileContent);
    }

    // Evitar duplicados
    const exists = whitelist.find((entry: any) => entry.wallet === wallet);
    if (!exists) {
      whitelist.push({
        wallet,
        email: email || '',
        timestamp: new Date().toISOString()
      });
      fs.writeFileSync(dataPath, JSON.stringify(whitelist, null, 2));
      console.log(`✅ Whitelist: Nueva wallet registrada -> ${wallet}`);
      res.json({ success: true, message: 'Registrado con éxito' });
    } else {
      res.json({ success: true, message: 'Wallet ya estaba registrada' });
    }
  } catch (err) {
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

  // Guardrail 3: Construcción rígida del Prompt en el Servidor (el cliente no puede alterarlo)
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

  try {
    const fetchResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              { text: serverSystemPrompt + `\nPregunta del manager: "${userText}"` }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.5,
          maxOutputTokens: 120
        }
      })
    });

    const data: any = await fetchResponse.json();
    if (data.candidates && data.candidates[0].content.parts[0].text) {
      const reply = data.candidates[0].content.parts[0].text.trim();
      res.json({ reply });
    } else {
      console.error("Gemini API structure error:", data);
      res.status(500).json({ error: 'Invalid response structure from Gemini API' });
    }
  } catch (error: any) {
    console.error("Error connecting to Gemini API:", error);
    res.status(500).json({ error: 'Failed to communicate with Gemini API: ' + error.message });
  }
});

app.listen(port, () => {
  console.log(`GoalChain API listening at http://localhost:${port}`);
});

