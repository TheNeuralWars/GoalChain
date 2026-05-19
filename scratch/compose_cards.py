import os
import json
import re
from PIL import Image, ImageDraw, ImageFont, ImageEnhance

# CONFIGURACIÓN DE RUTAS MAESTRAS
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PLAYERS_JSON = os.path.join(BASE_DIR, "docs/assets/data/players.json")

# Carpetas de Origen y Destino
TRANSPARENT_DIR = os.path.join(BASE_DIR, "docs/assets/img/nfts/transparent")
BG_DIR = os.path.join(BASE_DIR, "docs/assets/img/nfts/bg")
FRAME_DIR = os.path.join(BASE_DIR, "docs/assets/img/nfts/frames")
OUTPUT_DIR = os.path.join(BASE_DIR, "docs/assets/img/cards")

# Dimensiones estándar de las cartas coleccionables AAA (Proporción 2:3)
CARD_WIDTH = 800
CARD_HEIGHT = 1200

# Colores de Rareza para efectos tipográficos
RARITY_COLORS = {
    "mythic": (255, 204, 0),       # Oro brillante
    "legendary": (20, 241, 149),    # Verde Solana
    "epic": (153, 69, 255),       # Púrpura Solana
    "rare": (0, 200, 255),        # Cyan Eléctrico
    "common": (200, 200, 200)      # Plateado / Gris
}

BG_IMAGE_MAP = {
    "BG-MYT": "bg_mythic_golden.png",
    "BG-LEG": "bg_legendary_purple.png",
    "BG-EPI": "bg_epic_cyber.png",
    "BG-RAR": "bg_rare_solana.png",
    "BG-COM": "bg_common_street.png"
}

def sanitize_filename(name):
    return re.sub(r'[^a-z0-9_\-]', '', name.lower().replace(' ', '_'))

def find_player_image(player_id, player_name):
    """
    Busca el archivo PNG transparente del jugador en la carpeta de transparentes.
    Soporta formatos tipo: '001_lionel_messi.png', '1_messi.png', etc.
    """
    if not os.path.exists(TRANSPARENT_DIR):
        return None
        
    safe_name = sanitize_filename(player_name)
    pattern_id = f"{player_id}_"
    pattern_id_padded = f"{str(player_id).zfill(3)}_"
    
    for filename in os.listdir(TRANSPARENT_DIR):
        lower_file = filename.lower()
        if lower_file.endswith('.png'):
            # Coincidencia por ID o Nombre
            if lower_file.startswith(pattern_id) or lower_file.startswith(pattern_id_padded) or safe_name in lower_file:
                return os.path.join(TRANSPARENT_DIR, filename)
    return None

def draw_cyber_card_fallback(draw, rarity_color, player):
    """Dibuja un diseño Cyberpunk elegante en el fondo si falta la foto del jugador."""
    draw.rectangle([100, 300, 700, 800], fill=(20, 20, 30, 100), outline=rarity_color, width=2)
    # Dibujar líneas tecnológicas cruzadas
    draw.line([100, 300, 700, 800], fill=(rarity_color[0], rarity_color[1], rarity_color[2], 50), width=1)
    draw.line([700, 300, 100, 800], fill=(rarity_color[0], rarity_color[1], rarity_color[2], 50), width=1)
    
    # Círculo central tecnológico
    draw.ellipse([300, 450, 500, 650], outline=rarity_color, width=3)
    draw.ellipse([320, 470, 480, 630], outline=(255, 255, 255, 30), width=1)

def get_system_font(size):
    """Intenta cargar fuentes del sistema premium, con fallback a fuente básica."""
    fonts_to_try = [
        "/System/Library/Fonts/HelveticaNeue.ttc",
        "/System/Library/Fonts/Cache/Arial.ttf",
        "/Library/Fonts/Arial.ttf",
        "arial.ttf"
    ]
    for font_path in fonts_to_try:
        try:
            return ImageFont.truetype(font_path, size)
        except IOError:
            continue
    return ImageFont.load_default()

def compose_card(player):
    player_id = player["id"]
    player_name = player["name"]
    rarity = player["rarity"]
    bg_type = player.get("bg_type", "BG-COM")
    
    print(f"🎬 Componiendo cromo: #{player_id} - {player_name} ({rarity.upper()})")
    
    # 1. Cargar fondo o crear uno con degradado premium si no existe
    bg_filename = BG_IMAGE_MAP.get(bg_type, "bg_common_grass.png")
    bg_path = os.path.join(BG_DIR, bg_filename)
    
    if os.path.exists(bg_path):
        card_img = Image.open(bg_path).convert("RGBA").resize((CARD_WIDTH, CARD_HEIGHT))
    else:
        # Fallback: Degradado futurista oscuro
        card_img = Image.new("RGBA", (CARD_WIDTH, CARD_HEIGHT), (10, 10, 15, 255))
        draw_fallback_bg = ImageDraw.Draw(card_img)
        # Degradado lineal vertical
        for y in range(CARD_HEIGHT):
            ratio = y / CARD_HEIGHT
            # Mezclar negro azulado con el color de la rareza muy atenuado
            r = int(10 * (1 - ratio) + RARITY_COLORS[rarity][0] * 0.15 * ratio)
            g = int(10 * (1 - ratio) + RARITY_COLORS[rarity][1] * 0.15 * ratio)
            b = int(15 * (1 - ratio) + RARITY_COLORS[rarity][2] * 0.15 * ratio)
            draw_fallback_bg.line([(0, y), (CARD_WIDTH, y)], fill=(r, g, b, 255))

    # Crear capa de dibujo
    draw = ImageDraw.Draw(card_img, "RGBA")
    rarity_color = RARITY_COLORS[rarity]

    # 2. Superponer al Jugador (PNG Transparente de Grok)
    player_img_path = find_player_image(player_id, player_name)
    if player_img_path and os.path.exists(player_img_path):
        player_raw = Image.open(player_img_path).convert("RGBA")
        
        # Escalar al jugador manteniendo proporción (alto ideal ~60% de la carta)
        ideal_height = 700
        aspect_ratio = player_raw.width / player_raw.height
        new_width = int(ideal_height * aspect_ratio)
        
        player_resized = player_raw.resize((new_width, ideal_height), Image.Resampling.LANCZOS)
        
        # Centrar horizontalmente y posicionar verticalmente en la zona de juego
        x_pos = (CARD_WIDTH - new_width) // 2
        y_pos = 220 # Margen superior para dejar ver el ID y marco de arriba
        
        # Pegar usando el canal alpha como máscara
        card_img.alpha_composite(player_resized, (x_pos, y_pos))
    else:
        print(f"   ⚠️ Jugador transparente no encontrado para #{player_id}. Aplicando fallback vectorial.")
        draw_cyber_card_fallback(draw, rarity_color, player)

    # 3. Dibujar el marco de rareza si no hay archivo PNG físico del marco
    # Creamos un marco digital vectorial premium con esquinas biseladas (cyberpunk)
    margin = 35
    border_width = 8
    draw.rectangle(
        [margin, margin, CARD_WIDTH - margin, CARD_HEIGHT - margin],
        outline=rarity_color,
        width=border_width
    )
    
    # Sub-borde fino interior para efecto tecnológico
    draw.rectangle(
        [margin + 12, margin + 12, CARD_WIDTH - margin - 12, CARD_HEIGHT - margin - 12],
        outline=(255, 255, 255, 30),
        width=2
    )

    # 4. Capa UI de Estadísticas (Fondo oscuro semitransparente abajo para legibilidad)
    card_panel_height = 300
    panel_y = CARD_HEIGHT - card_panel_height - margin - 15
    
    # Rectángulo base del panel de datos (Glassmorphic)
    draw.rectangle(
        [margin + 20, panel_y, CARD_WIDTH - margin - 20, CARD_HEIGHT - margin - 20],
        fill=(10, 10, 18, 220), # Fondo oscuro denso
        outline=(rarity_color[0], rarity_color[1], rarity_color[2], 80),
        width=2
    )

    # 5. Cargar Fuentes tipográficas
    font_id = get_system_font(32)
    font_rarity = get_system_font(20)
    font_name = get_system_font(52)
    font_real_name = get_system_font(22)
    font_stat_val = get_system_font(38)
    font_stat_lbl = get_system_font(18)
    font_biometric = get_system_font(20)

    # 6. Escribir textos en la tarjeta
    # A) ID de la carta (Arriba izquierda)
    draw.text((margin + 30, margin + 25), f"#{str(player_id).zfill(3)}", fill=(255, 255, 255, 255), font=font_id)
    
    # B) Insignia de Rariad (Arriba Derecha)
    rarity_txt = rarity.upper()
    # Calcular tamaño para centrar en caja
    draw.rounded_rectangle(
        [CARD_WIDTH - margin - 200, margin + 25, CARD_WIDTH - margin - 30, margin + 65],
        fill=rarity_color,
        radius=5
    )
    draw.text((CARD_WIDTH - margin - 180, margin + 33), rarity_txt, fill=(0, 0, 0), font=font_rarity)

    # C) Nombre del Jugador
    name_y = panel_y + 25
    draw.text((margin + 45, name_y), player_name, fill=(255, 255, 255), font=font_name)

    # D) Nombre Real / Identidad Cripto
    real_name = player.get("real_name", "Verified Athlete")
    draw.text((margin + 45, name_y + 65), real_name.upper(), fill=(rarity_color[0], rarity_color[1], rarity_color[2], 255), font=font_real_name)

    # E) Estadísticas Biométricas (Altura, Peso, Pie)
    physical = player.get("physical", {})
    height = physical.get("h", "1.80m")
    weight = physical.get("w", "75kg")
    foot = physical.get("foot", "Right")
    biometric_text = f"HEIGHT: {height}   |   WEIGHT: {weight}   |   FOOT: {foot.upper()}"
    draw.text((margin + 45, name_y + 105), biometric_text, fill=(200, 200, 200, 180), font=font_biometric)

    # G) Grilla de Estadísticas de Juego (ATK, DEF, HYPE) en cajas dedicadas
    stats = player["stats"]
    stat_box_width = 160
    stat_box_height = 85
    start_x = margin + 45
    gap_x = 40
    
    stat_items = [
        ("ATTACK", stats["atk"]),
        ("DEFENSE", stats["def"]),
        ("HYP Aura", stats["hype"])
    ]
    
    for idx, (label, value) in enumerate(stat_items):
        x = start_x + idx * (stat_box_width + gap_x)
        y = panel_y + 175
        
        # Caja de la estadística (Dark translucent solid for perfect readability)
        draw.rectangle(
            [x, y, x + stat_box_width, y + stat_box_height],
            fill=(20, 20, 30, 255),
            outline=(rarity_color[0], rarity_color[1], rarity_color[2], 120),
            width=1
        )
        
        # Etiqueta
        draw.text((x + 12, y + 10), label, fill=(180, 180, 180), font=font_stat_lbl)
        
        # Valor de la estadística (color de la rareza para HYPE, blanco para el resto)
        color = rarity_color if label == "HYP Aura" else (255, 255, 255)
        draw.text((x + 12, y + 32), str(value), fill=color, font=font_stat_val)

    # 7. Asegurar que existe directorio de salida y guardar cromo final
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    output_filename = f"{str(player_id).zfill(3)}_{sanitize_filename(player_name)}.png"
    output_path = os.path.join(OUTPUT_DIR, output_filename)
    
    # Guardar como PNG de alta calidad listo para IPFS
    card_img.save(output_path, "PNG")
    print(f"✅ Guardado cromo final en: {output_path}\n")

def process_all_cards():
    if not os.path.exists(PLAYERS_JSON):
        print(f"❌ Error: Archivo de base de datos no encontrado en: {PLAYERS_JSON}")
        return

    with open(PLAYERS_JSON, 'r', encoding='utf-8') as f:
        players = json.load(f)

    print(f"🔥 Base de datos cargada. Preparando composición para {len(players)} jugadores...")
    
    composed_count = 0
    for player in players:
        # Solo componer si tenemos la imagen del jugador transparente lista
        player_img_path = find_player_image(player["id"], player["name"])
        if player_img_path:
            compose_card(player)
            composed_count += 1
        else:
            # Puedes quitar este filtro para forzar a generar las 528 cartas con fallback cyberpunk
            # Por ahora, solo componemos si la imagen transparente existe
            pass
            
    print(f"🏁 Tarea completada. Se pre-compusieron {composed_count} cromos listos para Metaplex.")

if __name__ == "__main__":
    process_all_cards()
