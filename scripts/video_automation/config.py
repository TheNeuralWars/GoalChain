import os
from pathlib import Path

# Base Directory of the project
BASE_DIR = Path(__file__).resolve().parent.parent.parent

def load_dotenv():
    """Manually parse .env file to avoid external dependency issues if python-dotenv is not installed"""
    env_file = BASE_DIR / '.env'
    if env_file.exists():
        with open(env_file, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, value = line.split('=', 1)
                    key = key.strip()
                    value = value.strip().strip('"').strip("'")
                    os.environ[key] = value

# Load the environment variables
load_dotenv()

# API Keys and configuration
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_GENERATIVE_AI_API_KEY")
RAPIDAPI_KEY = os.getenv("RAPIDAPI_KEY")
RAPIDAPI_HOST_TWITTER = "twitter241.p.rapidapi.com"

# More LLM Providers
XAI_API_KEY = os.getenv("XAI_API_KEY")
NVIDIA_API_KEY = os.getenv("NVIDIA_API_KEY")

# Media Generation API Keys (user can add these to their .env file)
PEXELS_API_KEY = os.getenv("PEXELS_API_KEY")
ELEVENLABS_API_KEY = os.getenv("ELEVENLABS_API_KEY")

# Configuration for Account Types
ACCOUNTS = {
    "NicoPezDorado": {
        "niche": "Desarrollo personal, productividad extrema, motivación y hábitos de desarrollo (Build in Public).",
        "voice_preset": "adam", # ElevenLabs voice preset
        "color_palette": "Oscuro con acentos dorados y blancos de alto contraste",
    },
    "GoalChainSol": {
        "niche": "Gamificación de metas con Blockchain en Solana, apuestas a uno mismo, contratos inteligentes y recompensas.",
        "voice_preset": "antoni",
        "color_palette": "Oscuro con acentos verdes/morados (colores de Solana) y blancos",
    }
}

# Directories for outputs
OUTPUT_DIR = BASE_DIR / "scripts" / "video_automation" / "output"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

if __name__ == "__main__":
    print("Configuración cargada:")
    print(f"Base Dir: {BASE_DIR}")
    print(f"Gemini API Key cargada: {bool(GEMINI_API_KEY)}")
    print(f"RapidAPI Key cargada: {bool(RAPIDAPI_KEY)}")
