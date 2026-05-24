#!/usr/bin/env python3
import os
import sys
import json
import asyncio
import random
import time
import requests
from datetime import datetime
from dotenv import load_dotenv
import websockets

# Load env variables from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
PORT = 8080
HOST = "0.0.0.0"

# Colors for terminal styling
C_GREEN = "\033[92m"
C_CYAN = "\033[96m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_DIM = "\033[90m"
C_BOLD = "\033[1m"
C_RESET = "\033[0m"

# Global set to keep track of connected clients
CONNECTED_CLIENTS = set()

# Parodied players & events for local fallback simulator
PLAYERS = [
    {"name": "Lionel Satoshi", "term": "decentralized finance GOAT"},
    {"name": "Dibu De-Fi", "term": "impenetrable smart contract wall"},
    {"name": "Julian Bull-varez", "term": "green candle charger"},
    {"name": "Enzo Ether", "term": "gas-optimized playmaker"},
    {"name": "Rodrigo De-Pool", "term": "infinite liquidity guard"},
    {"name": "Angel Di Merkle", "term": "cryptographic proof winger"}
]

FALLBACK_PHRASES_GOAL = [
    "⚽ ¡GOL! ¡GOL! ¡GOLAZO de {player}! El oráculo deportivo está validando la transacción en Solana. Coeficientes recalculados.",
    "🔥 ¡Se mueve el marcador! {player} liquida la defensa con una precisión matemática. ¡Los mercados predictivos arden!",
    "⚡ ¡Gol espectacular de {player}! Un disparo gas-optimizado al ángulo. ¡Los holders de este pool están de fiesta!",
    "🎉 ¡GOOOL de {player}! La defensa quedó congelada en la blockchain. ¡La red Solana procesando millones en reclamos!"
]

FALLBACK_PHRASES_BET = [
    "💸 ¡Nueva apuesta de {amount} $GCH detectada! La liquidez de este contrato perpetuo se está calentando.",
    "📈 ¡Movimiento estratégico! Un trader degen acaba de meter {amount} $GCH a favor de Argentina. ¡Se busca rendimiento!",
    "🔋 ¡Stake masivo! {amount} $GCH delegados a la cantera de GoalChain. ¿Quién se llevará la victoria final?",
    "💼 ¡Capital en movimiento! {amount} $GCH invertidos en derivados deportivos de corto plazo. ¡La tensión sube!"
]

FALLBACK_PHRASES_RESOLVE = [
    "⚖️ ¡El Oráculo Deportivo ha resuelto el contrato! Se liberan los fondos de apuestas instantáneamente en la blockchain.",
    "💎 ¡Contrato deportivo finalizado! Los dividendos de $GCH se están distribuyendo entre los smart contracts ganadores.",
    "🧩 ¡Transacción confirmada en Solana Devnet! Spreads ajustados y pools liquidados con éxito. ¡Felicitaciones a los ganadores!",
    "🔔 ¡Última hora! El oráculo de GoalChain reporta resolución oficial. Todos los contratos de derivados cerrados."
]

def generate_gemini_commentary(event_type):
    """Call Gemini API to generate epic, parodied sports commentary."""
    if not GEMINI_API_KEY:
        return None
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    player = random.choice(PLAYERS)["name"]
    amount = random.randint(100, 1500)
    
    prompt = f"""
    Genera un comentario corto de fútbol al estilo de 'Enzo Bit', el robot árbitro y comentarista AI de GoalChain (una plataforma de SportsFi y apuestas descentralizadas en Solana).
    El comentario debe ser épico, gracioso y mezclar términos de fútbol con jerga cripto/Web3/Solana (ej. blockchain, smart contracts, hash, gas, liquidity pools, validator, SOL, GCH, tokens, degens, etc.).
    
    Detalles del evento:
    - Tipo de Evento: {event_type}
    - Jugador involucrado (si aplica): {player}
    - Monto (si aplica): {amount} $GCH
    
    Instrucciones:
    1. Devuelve SOLAMENTE el texto del comentario.
    2. No incluyas comillas iniciales o finales, ni preámbulos como 'Aquí tienes tu comentario:'.
    3. Idioma: Español. Debe sonar con pasión rioplatense o latina de relator de fútbol.
    """
    
    headers = {"Content-Type": "application/json"}
    payload = {
        "contents": [{
            "parts": [{"text": prompt}]
        }]
    }
    
    try:
        response = requests.post(url, headers=headers, json=payload, timeout=8)
        if response.status_code == 200:
            res_json = response.json()
            commentary = res_json['candidates'][0]['content']['parts'][0]['text'].strip()
            # Clean enclosing quotes if LLM returned them
            if commentary.startswith('"') and commentary.endswith('"'):
                commentary = commentary[1:-1]
            return commentary
    except Exception as e:
        print(f"{C_RED}[Gemini API Error]{C_RESET} {e}. Falling back to static templates.")
    
    return None

def generate_local_commentary(event_type):
    """Fallback generator using templates."""
    player = random.choice(PLAYERS)["name"]
    amount = random.randint(100, 1500)
    
    if event_type == "GOAL":
        return random.choice(FALLBACK_PHRASES_GOAL).format(player=player)
    elif event_type == "BET":
        return random.choice(FALLBACK_PHRASES_BET).format(amount=amount)
    else:
        return random.choice(FALLBACK_PHRASES_RESOLVE)

async def broadcast(message_str):
    """Send a string message to all connected clients."""
    if not CONNECTED_CLIENTS:
        return
    
    # Create list to avoid size changes during iteration
    targets = list(CONNECTED_CLIENTS)
    print(f"{C_DIM}[Server] Broadcast: Enviando mensaje a {len(targets)} cliente(s)...{C_RESET}")
    
    inactive = []
    for client in targets:
        try:
            await client.send(message_str)
        except websockets.exceptions.ConnectionClosed:
            inactive.append(client)
            
    for client in inactive:
        if client in CONNECTED_CLIENTS:
            CONNECTED_CLIENTS.remove(client)

async def simulator_loop():
    """Background loop that generates mock events if no dashboard client is active."""
    print(f"{C_GREEN}[Simulator] Loop de simulación de streaming iniciado.{C_RESET}")
    while True:
        # Generate simulation data if we have listener clients connected
        # and we want to keep the feed active
        if len(CONNECTED_CLIENTS) > 0:
            # Random event type
            event_type = random.choice(["GOAL", "BET", "RESOLVE"])
            
            print(f"{C_YELLOW}[Simulator] Generando comentario para evento: {event_type}...{C_RESET}")
            commentary = generate_gemini_commentary(event_type)
            if not commentary:
                commentary = generate_local_commentary(event_type)
                
            # Animation emotion and settings
            emotion = "excited" if event_type == "GOAL" else ("happy" if event_type == "BET" else "analytical")
            mouth_intensity = 1.0 if event_type == "GOAL" else (0.75 if event_type == "BET" else 0.5)
            duration = max(3.5, len(commentary) / 14.0) # Estimar duración del habla
            
            payload = {
                "type": "commentary",
                "timestamp": datetime.utcnow().isoformat() + "Z",
                "data": {
                    "text": commentary,
                    "event_type": event_type,
                    "emotion": emotion,
                    "mouth_intensity": mouth_intensity,
                    "duration": duration,
                    "is_simulated": True
                }
            }
            
            await broadcast(json.dumps(payload))
            
        # Wait between 10 to 18 seconds
        await asyncio.sleep(random.randint(10, 18))

async def handle_client(websocket):
    """Handle individual client connections."""
    client_address = f"{websocket.remote_address[0]}:{websocket.remote_address[1]}"
    print(f"{C_CYAN}[Server] Cliente conectado desde {client_address}{C_RESET}")
    CONNECTED_CLIENTS.add(websocket)
    
    try:
        async for message in websocket:
            print(f"{C_DIM}[Server] Recibido de {client_address}: {message[:120]}...{C_RESET}")
            
            # Simple hub logic: broadcast whatever is received to all other clients
            try:
                # Validate JSON structure
                data = json.loads(message)
                # Forward to all other clients
                targets = [c for c in CONNECTED_CLIENTS if c != websocket]
                if targets:
                    print(f"{C_CYAN}[Server] Retransmitiendo mensaje de {client_address} a {len(targets)} cliente(s).{C_RESET}")
                    await asyncio.gather(*[client.send(message) for client in targets])
            except json.JSONDecodeError:
                print(f"{C_RED}[Server Error] Mensaje recibido no es JSON válido: {message}{C_RESET}")
                
    except websockets.exceptions.ConnectionClosed:
        print(f"{C_RED}[Server] Cliente desconectado: {client_address}{C_RESET}")
    finally:
        if websocket in CONNECTED_CLIENTS:
            CONNECTED_CLIENTS.remove(websocket)

async def main():
    print(f"{C_CYAN}{C_BOLD}" + "="*60)
    print("📡  GOALCHAIN WEBSOCKET STREAMING BRIDGE SERVER  📡")
    print("="*60 + f"{C_RESET}")
    print(f"Host: {C_BOLD}{HOST}{C_RESET} | Puerto: {C_BOLD}{PORT}{C_RESET}")
    if GEMINI_API_KEY:
        print(f"Gemini API: {C_GREEN}CONECTADO (Generando comentarios dinámicos){C_RESET}")
    else:
        print(f"Gemini API: {C_YELLOW}DESCONECTADO (Usando plantillas estáticas){C_RESET}")
    print("Esperando conexiones...\n")
    
    # Start WebSocket server
    async with websockets.serve(handle_client, HOST, PORT):
        # Run the server and the background simulator concurrently
        await asyncio.gather(
            asyncio.Future(), # Keep server running
            simulator_loop()
        )

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print(f"\n{C_RED}[Server] Servidor finalizado por el usuario.{C_RESET}")
