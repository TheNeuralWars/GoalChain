#!/usr/bin/env python3
import os
import sys
import requests
import unicodedata
from io import BytesIO
from PIL import Image

# Intenta importar rembg, si no está instalado avisa amistosamente
try:
    from rembg import remove
    REMBG_AVAILABLE = True
except ImportError:
    REMBG_AVAILABLE = False

# Colores y decoración de terminal Cyberpunk
class Term:
    CYAN = '\033[96m'
    GREEN = '\033[92m'
    PURPLE = '\033[95m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BOLD = '\033[1m'
    RESET = '\033[0m'
    GRID = '\033[90m'

def print_header():
    os.system('clear' if os.name == 'posix' else 'cls')
    print(f"{Term.GRID}┌────────────────────────────────────────────────────────┐{Term.RESET}")
    print(f"{Term.GRID}│{Term.RESET}   {Term.CYAN}{Term.BOLD}⚽ GOALCHAIN ART ENGINE - PIPELINE INTEGRADO v3.0{Term.RESET}   {Term.GRID}│{Term.RESET}")
    print(f"{Term.GRID}│{Term.RESET}        [Estadios Monumentales & Remoción de Fondos]        {Term.GRID}│{Term.RESET}")
    print(f"{Term.GRID}└────────────────────────────────────────────────────────┘{Term.RESET}\n")

def normalize_name(name):
    n = unicodedata.normalize('NFD', name)
    n = ''.join([c for c in n if unicodedata.category(c) != 'Mn'])
    return n.lower().replace('.', '').replace(' ', '_').replace('-', '_').strip()

# =====================================================================
# 📚 1. MANUAL DE PROMPTS PARA ESTADIOS (STADIUM ARCHITECT)
# =====================================================================
STADIUM_PROMPTS = {
    "1": {
        "rarity": "COMMON (Potrero Nocturno)",
        "color": "Muted Orange / Dark Shadows",
        "prompt": "A professional high-end photograph of an urban street soccer pitch at night, captured in a strictly vertical 3:2 portrait aspect ratio from a very low ground-level camera perspective. The bottom of the frame is dominated by a highly detailed, textured dark cracked concrete ground with faded white painted lines. In the background, tall dark chain-link fences and weathered brick walls rise vertically into the night shadows. Recessed dim orange streetlights cast soft, low-contrast warm glows onto the ground. Low contrast, dark, realistic raw street atmosphere. Shot with a premium 35mm lens at a wide-open aperture of f/1.4, creating a powerful depth of field with the distant fences strongly out of focus, dissolving into a soft, buttery warm-accented bokeh blur while the foreground concrete remains grounded. Vertical portrait framing, 3:2 aspect ratio, --ar 2:3."
    },
    "2": {
        "rarity": "RARE (Obsidian Arena)",
        "color": "Solana Green (#14f195)",
        "prompt": "A professional high-end photograph of a futuristic monumental football stadium at night, captured in a strictly vertical 3:2 portrait aspect ratio from a very low ground-level camera perspective. The bottom of the frame is dominated by a highly detailed, textured dark soccer pitch turf with subtle, clean lines. In the background, the empty massive grandstands and a single sweeping architectural arch of the stadium loom in the dark sky, extending vertically. A thin, low-intensity recessed LED strip outlines the sweeping arch with a soft, muted Solana Green (dark emerald green-cyan), casting a faint, diffused green glow onto the dark grass. Soft, out-of-focus volumetric green mist rises gently from the pitch in the distance. Low contrast, highly elegant, dark atmospheric depth. Shot with a premium 35mm lens at a wide-open aperture of f/1.4, creating a powerful depth of field with the distant stadium structures strongly out of focus, dissolving into a soft, buttery green-accented bokeh blur while the foreground turf remains grounded. Vertical portrait framing, 3:2 aspect ratio, --ar 2:3."
    },
    "3": {
        "rarity": "EPIC (Aether Cyber-Dome)",
        "color": "Electric Cyan (#00e5ff)",
        "prompt": "A professional high-end photograph of a futuristic monumental geodesic soccer dome at night, captured in a strictly vertical 3:2 portrait aspect ratio from a very low ground-level camera perspective. The bottom of the frame displays a highly detailed, textured dark carbon-reinforced soccer pitch turf with crisp clean lines. In the background, the colossal soaring geodesic glass panels of the dome roof and sleek diagonal structural arches rise vertically into the dark night sky. Sleek, thin, low-intensity recessed LED light strips run along the dome's structural frame, glowing softly in a muted electric cyan (soft neon cyan-blue) with zero glare. A soft, dim, out-of-focus volumetric cyan haze rises gently from the pitch in the far distance, creating a sense of ultra-modern, clean, restrained tech luxury. Low contrast, dark, highly elegant. Shot with a premium 35mm lens at a wide-open aperture of f/1.4, creating a powerful depth of field with the distant dome structures strongly out of focus, dissolving into a soft, buttery cyan-accented bokeh blur while the foreground turf remains grounded. Vertical portrait framing, 3:2 aspect ratio, --ar 2:3."
    },
    "4": {
        "rarity": "LEGENDARY (Carbon Monolith Dome)",
        "color": "Phantom Purple (#9945ff)",
        "prompt": "A professional high-end photograph of an elite, monumental football dome at night, captured in a strictly vertical 3:2 portrait aspect ratio from a very low ground-level camera perspective. The bottom of the frame shows a highly detailed, textured dark soccer pitch turf. In the background, massive empty geometric grandstands and structural monoliths are enveloped in shadowed darkness, extending vertically. A soft, low-intensity, highly diffused glow of deep phantom purple (muted, deep amethyst violet) emanates from behind the towering geometric roof structures, creating a subtle, elegant violet halo effect in the night sky. Sparse, tiny purple bokeh dust particles drift gently above the dark pitch in the distance. High-end, premium sport luxury aesthetic, dark and sober with zero glare. Shot with a premium 35mm lens at a wide-open aperture of f/1.4, creating a powerful depth of field with the towering stadium dome strongly out of focus, dissolving into a soft, buttery purple-accented bokeh blur while the foreground turf remains grounded. Vertical portrait framing, 3:2 aspect ratio, --ar 2:3."
    },
    "5": {
        "rarity": "MYTHIC (Golden Olympus Arena)",
        "color": "Brushed Antique Gold (#ffd700)",
        "prompt": "A professional high-end photograph of an ultra-premium, monumental soccer stadium at night, captured in a strictly vertical 3:2 portrait aspect ratio from a very low ground-level camera perspective. The bottom of the frame features a highly detailed, textured dark soccer pitch turf. In the background, towering, empty luxury grandstands made of matte charcoal concrete and dark obsidian glass rise vertically into the sky. Embedded along the upper architectural contour of the main stadium structure is a single, extremely thin, recessed accent line of brushed, low-reflectivity antique gold, glowing softly and warm with zero glare, zero flares, and zero sparks. A dim, subtle warm golden ambient fog hangs in the atmospheric darkness in the far distance, creating a restrained, highly elegant, sober golden color palette with clean, dark atmospheric depth. Shot with a premium 35mm lens at a wide-open aperture of f/1.4, creating a powerful depth of field with the towering stadium structures strongly out of focus, dissolving into a soft, buttery gold-accented bokeh blur while the foreground turf remains grounded. Vertical portrait framing, 3:2 aspect ratio, --ar 2:3."
    }
}

def show_prompts():
    print_header()
    print(f"{Term.BOLD}🏟️  BIBLIOTECA OFICIAL DE PROMPTS PARA ESTADIOS DE FLUX{Term.RESET}\n")
    for key, value in STADIUM_PROMPTS.items():
        print(f"{Term.CYAN}{Term.BOLD}[Rareza {key}] - {value['rarity']}{Term.RESET}")
        print(f"   {Term.PURPLE}🎨 Color Key:{Term.RESET} {value['color']}")
        print(f"   {Term.GREEN}✍️ Prompt:{Term.RESET}\n   {Term.GRID}{value['prompt']}{Term.RESET}\n")
    
    input(f"\n{Term.YELLOW}Presione ENTER para volver al menú principal...{Term.RESET}")

# =====================================================================
# ⚙️ 2. PIPELINE DE PROCESAMIENTO UNITARIO (DESCARGA + REMBG)
# =====================================================================
def run_interactive_pipeline():
    print_header()
    print(f"{Term.BOLD}⚡ PIPELINE DE PROCESAMIENTO AUTOMÁTICO{Term.RESET}")
    print("Este módulo descarga una imagen generada por Grok en caliente, la procesa e inyecta en producción.\n")

    # Verificar disponibilidad de rembg
    if not REMBG_AVAILABLE:
        print(f"{Term.RED}⚠️ Advertencia: La librería 'rembg' no está disponible en este entorno de Python.{Term.RESET}")
        print("El script descargará la imagen pero no podrá remover el fondo automáticamente.")
        print("Para instalar rembg, corre: `pip install rembg` en tu terminal local.\n")

    print(f"{Term.CYAN}1. ¿Qué tipo de recurso deseas procesar?{Term.RESET}")
    print("   [1] Jugador (Se le removerá el fondo por IA y se guardará como PNG transparente)")
    print("   [2] Fondo de Estadio (Se optimizará y guardará en la carpeta de backgrounds)")
    tipo = input("Selección: ").strip()

    if tipo not in ('1', '2'):
        print(f"{Term.RED}❌ Selección inválida.{Term.RESET}")
        return

    url = input(f"\n{Term.YELLOW}🔗 Pega la URL de la imagen de Grok (JPG/PNG): {Term.RESET}").strip()
    if not url.startswith("http"):
        print(f"{Term.RED}❌ URL inválida.{Term.RESET}")
        return

    # Definir rutas base
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Directorios de producción GoalChain
    PRODUCTION_NFTS = os.path.join(base_path, "docs/assets/img/nfts")
    PRODUCTION_BGS = os.path.join(base_path, "docs/assets/img/nfts/bg")
    RAW_GENS = os.path.join(base_path, "assets/img/raw_grok_generations")

    os.makedirs(PRODUCTION_NFTS, exist_ok=True)
    os.makedirs(PRODUCTION_BGS, exist_ok=True)
    os.makedirs(RAW_GENS, exist_ok=True)

    headers = {
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko)"
    }

    try:
        print(f"\n📥 Descargando recurso desde CDN...")
        r = requests.get(url, headers=headers, timeout=30)
        r.raise_for_status()
        img_data = r.content
        print(f"{Term.GREEN}   ✅ Descarga completada! (Tamaño: {len(img_data)} bytes){Term.RESET}")

        if tipo == '1': # JUGADOR
            print(f"\n{Term.CYAN}2. Configura los metadatos del Jugador:{Term.RESET}")
            num_ref = input("   Padded ID (ej: 001, 007, 023): ").strip()
            name = input("   Nombre del Jugador (ej: Lionel Satoshi): ").strip()
            
            safe_name = normalize_name(name)
            
            raw_filename = f"{num_ref}_{safe_name}.jpg"
            out_filename = f"{num_ref}_{safe_name}.png"
            
            raw_path = os.path.join(RAW_GENS, raw_filename)
            out_path = os.path.join(PRODUCTION_NFTS, out_filename)

            # Guardar copia Raw
            with open(raw_path, 'wb') as f:
                f.write(img_data)
            print(f"   📝 Copia de seguridad guardada en raw: {Term.CYAN}{raw_path}{Term.RESET}")

            # Remover fondo por IA
            if REMBG_AVAILABLE:
                print(f"   🧠 Removiendo fondo por Red Neuronal local (Alpha Matting activado)...")
                cleaned_data = remove(img_data, alpha_matting=True, alpha_matting_foreground_threshold=240)
                
                with open(out_path, 'wb') as f:
                    f.write(cleaned_data)
                print(f"   {Term.GREEN}🎉 ¡Procesamiento Exitoso! Guardado transparente en producción:{Term.RESET}")
                print(f"      👉 {Term.BOLD}{Term.CYAN}{out_path}{Term.RESET}")
            else:
                # Si no hay rembg, guardamos directamente como PNG
                img = Image.open(BytesIO(img_data))
                img.save(out_path, format="PNG")
                print(f"   ⚠️ Guardado como PNG plano sin remoción de fondo en: {Term.CYAN}{out_path}{Term.RESET}")

        else: # STADIUM BACKGROUND
            print(f"\n{Term.CYAN}2. Configura el archivo del Fondo:{Term.RESET}")
            print("   Formatos recomendados:")
            print("   - bg_common_grass.png")
            print("   - bg_rare_obsidian.png")
            print("   - bg_epic_aurora.png")
            print("   - bg_legendary_purple.png")
            print("   - bg_mythic_gold.png")
            bg_name = input("   Nombre del archivo final: ").strip()
            if not bg_name.endswith(".png"):
                bg_name += ".png"

            out_path = os.path.join(PRODUCTION_BGS, bg_name)

            # Optimizar y guardar como PNG
            print(f"   🌅 Optimizando y guardando imagen...")
            img = Image.open(BytesIO(img_data))
            img.save(out_path, format="PNG", optimize=True)
            print(f"   {Term.GREEN}🎉 ¡Procesamiento Exitoso! Fondo guardado en producción:{Term.RESET}")
            print(f"      👉 {Term.BOLD}{Term.CYAN}{out_path}{Term.RESET}")

    except Exception as e:
        print(f"\n{Term.RED}❌ Error durante el pipeline de procesamiento: {str(e)}{Term.RESET}")

    input(f"\n{Term.YELLOW}Presione ENTER para volver al menú principal...{Term.RESET}")

# =====================================================================
# ⚙️ 3. PROCESAMIENTO MASIVO LOCAL
# =====================================================================
def run_mass_pipeline():
    print_header()
    print(f"{Term.BOLD}📦 PROCESAMIENTO MASIVO DE IMÁGENES LOCALES{Term.RESET}")
    print("Busca imágenes en la carpeta 'assets/img/raw_grok_generations/', les quita el fondo y las guarda en docs.\n")

    if not REMBG_AVAILABLE:
        print(f"{Term.RED}❌ Error: Para correr la remoción de fondos masiva necesitas tener instalada la librería 'rembg'.{Term.RESET}")
        print("Instálala corriendo: `pip install rembg` y vuelve a ejecutar el script.")
        input(f"\n{Term.YELLOW}Presione ENTER para continuar...{Term.RESET}")
        return

    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    RAW_DIR = os.path.join(base_path, "assets/img/raw_grok_generations")
    OUTPUT_DIR = os.path.join(base_path, "docs/assets/img/nfts")

    if not os.path.exists(RAW_DIR) or not os.listdir(RAW_DIR):
        print(f"{Term.YELLOW}⚠️ No se encontraron imágenes en {RAW_DIR}{Term.RESET}")
        print("Asegúrate de colocar las imágenes descargadas ahí primero.")
        input(f"\n{Term.YELLOW}Presione ENTER para continuar...{Term.RESET}")
        return

    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    images = [f for f in os.listdir(RAW_DIR) if f.lower().endswith(valid_extensions)]

    print(f"🚀 Iniciando extracción de fondos para {len(images)} imágenes locales...")

    for i, filename in enumerate(images, 1):
        input_path = os.path.join(RAW_DIR, filename)
        
        # Mantener nombre pero cambiar extensión a PNG
        output_filename = os.path.splitext(filename)[0] + ".png"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        try:
            print(f"   [{i}/{len(images)}] Procesando silueta: {filename}...")
            
            with open(input_path, 'rb') as i_file:
                input_data = i_file.read()

            output_data = remove(input_data, alpha_matting=True, alpha_matting_foreground_threshold=240)

            with open(output_path, 'wb') as o_file:
                o_file.write(output_data)
                
            print(f"      {Term.GREEN}✅ Guardada: {output_filename}{Term.RESET}")

        except Exception as e:
            print(f"      {Term.RED}❌ Error en {filename}: {str(e)}{Term.RESET}")

    print(f"\n{Term.GREEN}🎉 ¡Proceso masivo completado!{Term.RESET}")
    input(f"\n{Term.YELLOW}Presione ENTER para volver al menú principal...{Term.RESET}")

# =====================================================================
# 🎮 MENÚ PRINCIPAL INTERACTIVO
# =====================================================================
def main_menu():
    while True:
        print_header()
        print(f"{Term.BOLD}¿Qué acción deseas realizar hoy, Arquitecto?{Term.RESET}\n")
        print(f"   {Term.CYAN}[1]{Term.RESET} Ver Biblioteca de Prompts de Estadios de FLUX (Filtros de Rareza)")
        print(f"   {Term.CYAN}[2]{Term.RESET} Procesar recurso en caliente (Descargar URL CDN de Grok -> rembg -> docs)")
        print(f"   {Term.CYAN}[3]{Term.RESET} Procesar carpeta masiva local (Quitar fondo a todo en assets/img/raw_grok_generations/)")
        print(f"   {Term.CYAN}[4]{Term.RESET} Salir de la consola del Motor")
        print(f"{Term.GRID}────────────────────────────────────────────────────────{Term.RESET}")
        
        choice = "2"

        if choice == '1':
            show_prompts()
        elif choice == '2':
            run_interactive_pipeline()
        elif choice == '3':
            run_mass_pipeline()
        elif choice == '4':
            print(f"\n{Term.GREEN}✨ Desconectando terminal del Motor de Arte. ¡Hasta pronto, Arquitecto!{Term.RESET}\n")
            break
        else:
            print(f"\n{Term.RED}❌ Opción no válida.{Term.RESET}")
            os.system('sleep 1')

if __name__ == "__main__":
    main_menu()
