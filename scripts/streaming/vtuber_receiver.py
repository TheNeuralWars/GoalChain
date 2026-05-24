#!/usr/bin/env python3
import os
import sys
import json
import asyncio
import time
from datetime import datetime
import websockets

# Colors for terminal styling
C_GREEN = "\033[92m"
C_CYAN = "\033[96m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_DIM = "\033[90m"
C_BOLD = "\033[1m"
C_RESET = "\033[0m"

URI = "ws://localhost:8080"

def clear_screen():
    os.system('clear' if os.name != 'nt' else 'cls')

def get_avatar_frame(emotion, mouth_state):
    """Generate the ASCII art of the avatar based on emotion and mouth open state."""
    # Visor and header styles
    if emotion == "excited":
        eyes = "⚡   ⚡"
        color = C_GREEN + C_BOLD
        title = "🔥 ¡ENZO BIT - RELATOR EXCITADO! 🔥"
        tag = "GOAL ALERT"
    elif emotion == "happy":
        eyes = "^   ^"
        color = C_CYAN + C_BOLD
        title = "💸 ¡ENZO BIT - SUBIDA DE STAKE! 💸"
        tag = "DEFI / BET"
    elif emotion == "analytical":
        eyes = "⚙️   ⚙️"
        color = C_YELLOW + C_BOLD
        title = "⚖️ ¡ENZO BIT - RESOLVIENDO CONTRATO! ⚖️"
        tag = "ORACLE RESOLVE"
    else:
        eyes = "•   •"
        color = C_DIM
        title = "💤 ENZO BIT - ESPERANDO EVENTOS... 💤"
        tag = "STANDBY"

    # Mouth states
    # 0 = closed, 1 = half-open, 2 = wide-open
    mouths = [
        "  [  -  ]  ",
        "  [  o  ]  ",
        "  [  O  ]  "
    ]
    mouth = mouths[mouth_state]

    avatar = f"""
{C_CYAN}{C_BOLD}================================================================{C_RESET}
{C_CYAN}                 {title}{C_RESET}
{C_CYAN}{C_BOLD}================================================================{C_RESET}

                    /===============\\
                   /                 \\
                  |   {color}{eyes}{C_RESET}   |
                  |   {color}{mouth}{C_RESET}   |
                   \\_________________/
                      ||         ||
                  ====[]=========[]====
                  |   |   |   |   |   |
"""
    return avatar

async def animate_speech(text, emotion, duration):
    """Animate the text printing and lipsync mouth movement in real time."""
    # Total duration of speech
    char_delay = duration / max(len(text), 1)
    # Ensure delay is not too long or too short
    char_delay = min(0.04, max(0.015, char_delay))
    
    mouth_cycle = [0, 1, 2, 1]
    
    text_so_far = ""
    for i, char in enumerate(text):
        text_so_far += char
        # Cycle mouth every 3 characters
        mouth_idx = mouth_cycle[(i // 3) % len(mouth_cycle)]
        
        clear_screen()
        # Draw avatar
        print(get_avatar_frame(emotion, mouth_idx))
        # Draw spoken text
        print(f"{C_BOLD}Enzo Bit dice:{C_RESET}\n")
        print(f"👉 {C_GREEN}{text_so_far}{C_RESET}")
        
        await asyncio.sleep(char_delay)
        
    # Return to idle/closed mouth at the end
    clear_screen()
    print(get_avatar_frame(emotion, 0))
    print(f"{C_BOLD}Enzo Bit dice:{C_RESET}\n")
    print(f"👉 {C_CYAN}{text}{C_RESET}\n")
    print(f"{C_DIM}(Transmisión completada - {datetime.now().strftime('%H:%M:%S')}){C_RESET}")

async def listen():
    clear_screen()
    print(f"{C_CYAN}{C_BOLD}" + "="*60)
    print("🤖  GOALCHAIN VTUBER STREAM RECEIVER CLIENT  🤖")
    print("="*60 + f"{C_RESET}")
    print(f"Conectando a {C_BOLD}{URI}{C_RESET}...")
    
    retry_delay = 1
    while True:
        try:
            async with websockets.connect(URI) as websocket:
                print(f"{C_GREEN}¡CONECTADO AL STREAMING BRIDGE CON ÉXITO!{C_RESET}")
                print(f"{C_DIM}Esperando transmisiones en vivo del Comentarista AI...{C_RESET}\n")
                
                # Show initial idle avatar
                print(get_avatar_frame("idle", 0))
                
                async for message in websocket:
                    try:
                        packet = json.loads(message)
                        if packet.get("type") == "commentary":
                            data = packet.get("data", {})
                            text = data.get("text", "")
                            emotion = data.get("emotion", "neutral")
                            duration = data.get("duration", 3.0)
                            
                            # Animate the speech lip sync
                            await animate_speech(text, emotion, duration)
                            
                    except json.JSONDecodeError:
                        print(f"{C_RED}[Error] Mensaje no es JSON válido: {message}{C_RESET}")
                        
        except (websockets.exceptions.ConnectionClosed, ConnectionRefusedError, OSError):
            clear_screen()
            print(f"{C_YELLOW}⚠️  No se pudo conectar al servidor de streaming o se perdió la conexión.{C_RESET}")
            print(f"Reintentando en {retry_delay} segundos...")
            await asyncio.sleep(retry_delay)
            retry_delay = min(15, retry_delay * 1.5)

if __name__ == "__main__":
    try:
        asyncio.run(listen())
    except KeyboardInterrupt:
        print(f"\n{C_RED}[VTuber Client] Cliente finalizado por el usuario.{C_RESET}")
