import { TwitterApi } from 'twitter-api-v2';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Cargar .env desde la raíz del proyecto
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const client = new TwitterApi({
  appKey: process.env.X_API_KEY || '',
  appSecret: process.env.X_API_SECRET || '',
  accessToken: process.env.X_ACCESS_TOKEN || '',
  accessSecret: process.env.X_ACCESS_SECRET || '',
});

async function testTweet() {
  console.log('--- GoalChain X (Twitter) Node.js Test ---');
  
  if (!process.env.X_API_KEY || !process.env.X_ACCESS_TOKEN) {
    console.error('❌ Error: Faltan credenciales en el archivo .env');
    return;
  }

  try {
    const tweetText = '⚽ El motor de GoalChain (Node.js) está oficialmente en línea.\n\nEl futuro del fútbol descentralizado comienza aquí. 🏆🚀\n\n#GoalChain #Solana #Web3 #WorldCup2026';
    
    console.log(`Enviando tweet: \n"${tweetText}"\n`);
    
    const { data: createdTweet } = await client.v2.tweet(tweetText);
    
    console.log('✅ ¡Tweet enviado con éxito!');
    console.log(`🔗 ID del Tweet: ${createdTweet.id}`);
    console.log('🌐 Mira el perfil oficial: https://x.com/GoalChainDotFun');
  } catch (error) {
    console.error('❌ Error al enviar el tweet:', error);
    console.log('\nNota: Asegúrate de que las llaves tengan permisos de "Read and Write" en el Developer Portal de X.');
  }
}

testTweet();
