import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const XAI_API_KEY = process.env.XAI_API_KEY;

async function testGrok() {
  console.log('--- GoalChain Grok (xAI) Node.js Test ---');

  if (!XAI_API_KEY) {
    console.error('❌ Error: Falta XAI_API_KEY en el archivo .env');
    return;
  }

  try {
    console.log('Conectando con SuperGrok...');
    
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${XAI_API_KEY}`
      },
      body: JSON.stringify({
        model: process.env.XAI_MODEL || 'grok-4.3',
        messages: [
          { role: 'system', content: 'Eres el motor de inteligencia artificial de GoalChain. Hablas de forma épica, futbolera y con terminología Web3/Solana.' },
          { role: 'user', content: 'Saluda a la comunidad de GoalChain y confirma que tu motor de IA está en línea.' }
        ],
        temperature: 0.7
      })
    });

    if (response.ok) {
      const result = await response.json() as any;
      const content = result.choices[0].message.content;
      console.log(`\n🤖 Grok dice:\n${content}\n`);
      console.log('✅ ¡Conexión exitosa!');
    } else {
      const errorText = await response.text();
      console.error(`❌ Error en la API (${response.status}):`, errorText);
    }
  } catch (error) {
    console.error('❌ Error inesperado:', error);
  }
}

testGrok();
