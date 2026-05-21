from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os

class GoalChainEngine:
    def __init__(self):
        self.chassis_path = "assets/master_templates/chassis_v13_clean.png"
        self.output_dir = "assets/final_renders"
        self.card_radius = 10
        self.window_radius = 20
        
        # COORDENADAS MANUALES DE PRECISIÓN (Refinadas)
        self.stat_blocks = [
            (167, 2476, 974, 2624),   # Superior Izquierda (+1px izq)
            (167, 2679, 974, 2826),   # Inferior Izquierda (+1px izq)
            (1025, 2476, 1831, 2624), # Superior Derecha (+3px)
            (1025, 2679, 1831, 2826)  # Inferior Derecha (+3px arriba)
        ]
        
        self.stats_coords = {
            "PAC": (250, 2480), "SHO": (450, 2480), "PAS": (650, 2480),
            "DRI": (1150, 2480), "DEF": (1350, 2480), "PHY": (1550, 2480),
            "VIT": (250, 2700), "TEC": (450, 2700), "MEN": (650, 2700),
            "POS": (1150, 2700), "GKP": (1350, 2700), "OVR": (1550, 2700)
        }
        os.makedirs(self.output_dir, exist_ok=True)

    def draw_chamfered_rectangle(self, draw, coords, chamfer, fill, corners=(True, True, True, True)):
        x1, y1, x2, y2 = coords
        c = chamfer
        
        # Puntos del polígono (8 puntos para un rectángulo biselado)
        points = []
        
        # Top Left
        if corners[0]: points.extend([(x1 + c, y1), (x1, y1 + c)])
        else: points.append((x1, y1))
        
        # Bottom Left
        if corners[3]: points.extend([(x1, y2 - c), (x1 + c, y2)])
        else: points.append((x1, y2))
        
        # Bottom Right
        if corners[2]: points.extend([(x2 - c, y2), (x2, y2 - c)])
        else: points.append((x2, y2))
        
        # Top Right
        if corners[1]: points.extend([(x2, y1 + c), (x2 - c, y1)])
        else: points.append((x2, y1))
        
        draw.polygon(points, fill=fill)

    def auto_crop(self, image, threshold=25):
        gray = image.convert("L")
        bw = gray.point(lambda x: 0 if x < threshold else 255)
        bbox = bw.getbbox()
        if bbox:
            return image.crop(bbox)
        return image

    def generate_card(self, player_data):
        import random
        rarity = player_data.get('rarity', 'steel').lower()
        
        # 1. Capa 1: Fondo de Rareza Dinámico y Aleatorio
        # Buscamos variantes (ej: gold_1.png, gold_2.png...)
        variation = player_data.get('bg_variation')
        if not variation:
            # Si no hay variación fija, elegimos una al azar (asumimos al menos 2 por ahora)
            variation = random.randint(1, 2)
            
        bg_path = f"assets/rarity_backgrounds/{rarity}_{variation}.png"
        print(f"Generando carta ({rarity.upper()} #Var{variation}) para: {player_data['name']}...")
        
        base = Image.new('RGBA', (2000, 3000), (0, 0, 0, 255))
        if os.path.exists(bg_path):
            bg_image = Image.open(bg_path).convert("RGBA")
            bg_image = bg_image.resize((2000, 3000), Image.Resampling.LANCZOS)
            base.paste(bg_image, (0, 0))
        else:
            # Fallback a fondo base si no existe la variante
            fallback_path = f"assets/rarity_backgrounds/{rarity}.png"
            if os.path.exists(fallback_path):
                bg_image = Image.open(fallback_path).convert("RGBA")
                base.paste(bg_image.resize((2000, 3000)), (0, 0))
            else:
                draw = ImageDraw.Draw(base)
                draw.rectangle([0, 0, 2000, 3000], fill=(15, 15, 25, 255))
        
        # 2. Capa 2: Jugador (Placeholder por ahora)
        
        # 3. Capa 3: Chasis V13 con TINTE DE RAREZA
        if os.path.exists(self.chassis_path):
            chassis_raw = Image.open(self.chassis_path).convert("RGBA")
            chassis_cropped = self.auto_crop(chassis_raw)
            chassis_final = chassis_cropped.resize((2000, 3000), Image.Resampling.LANCZOS)
            
            # APLICAR TINTE AL CHASIS (Capa translúcida)
            # Definir colores de tinte por rareza (RGBA con opacidad baja)
            tints = {
                "gold": (255, 215, 0, 60),    # Dorado
                "diamond": (0, 255, 255, 60), # Cian Eléctrico
                "steel": (200, 200, 220, 30)  # Acero frío
            }
            tint_color = tints.get(rarity, (255, 255, 255, 0))
            
            # Crear una capa de tinte y multiplicarla por el chasis
            overlay = Image.new('RGBA', (2000, 3000), tint_color)
            chassis_final = Image.alpha_composite(chassis_final, overlay)
            
            draw_chassis = ImageDraw.Draw(chassis_final)
            # Perforar Ventana (Biselada arriba, recta abajo)
            self.draw_chamfered_rectangle(draw_chassis, (175, 525, 1825, 2375), chamfer=20, fill=(0, 0, 0, 0), corners=(True, True, False, False))
            
            # Perforar Stats (Biseladas)
            for block in self.stat_blocks:
                self.draw_chamfered_rectangle(draw_chassis, block, chamfer=10, fill=(0, 0, 0, 0))
            
            base.alpha_composite(chassis_final)
        
        # 5. Capa 5: Stats (Inyección de texto inteligente y centrada)
        draw = ImageDraw.Draw(base)
        try:
            # Fuente un poco más técnica (Helvetica o similar)
            font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 70)
            font_small = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 30)
        except:
            font = ImageFont.load_default()
            font_small = ImageFont.load_default()

        # Definir el orden de las stats por bloque
        stat_groups = [
            ["PAC", "SHO", "PAS"], # Panel 1
            ["DRI", "DEF", "PHY"], # Panel 2
            ["VIT", "TEC", "MEN"], # Panel 3
            ["POS", "GKP", "OVR"]  # Panel 4
        ]

        for i, group in enumerate(stat_groups):
            block = self.stat_blocks[i]
            x1, y1, x2, y2 = block
            block_w = x2 - x1
            block_h = y2 - y1
            
            # Dividir el bloque en 3 sub-slots horizontales
            for j, stat_name in enumerate(group):
                if stat_name in player_data['stats']:
                    value = str(player_data['stats'][stat_name])
                    
                    # Calcular centro de este sub-slot
                    slot_center_x = x1 + (block_w / 6) * (1 + 2*j)
                    center_y = y1 + (block_h / 2)
                    
                    # Dibujar Nombre de Stat (Pequeño arriba)
                    draw.text((slot_center_x, center_y - 30), stat_name, fill=(180, 180, 180, 255), font=font_small, anchor="mm")
                    
                    # Dibujar Valor de Stat (Grande abajo)
                    draw.text((slot_center_x, center_y + 20), value, fill=(255, 255, 255, 255), font=font, anchor="mm")

        # 6. TROQUELADO: Aplicar biselado exterior
        mask = Image.new('L', (2000, 3000), 0)
        draw_mask = ImageDraw.Draw(mask)
        self.draw_chamfered_rectangle(draw_mask, [0, 0, 2000, 3000], chamfer=15, fill=255)
        
        final_card = Image.new('RGBA', (2000, 3000), (0, 0, 0, 0))
        final_card.paste(base, (0, 0), mask=mask)

        output_path = os.path.join(self.output_dir, f"{player_data['id']}_render.png")
        final_card.save(output_path)
        print(f"✅ Render REFINADO guardado en: {output_path}")

if __name__ == "__main__":
    engine = GoalChainEngine()
    mock_player = {
        "id": "GCH_001", "name": "Lionel Satoshi",
        "stats": {"PAC": 94, "SHO": 91, "PAS": 96, "DRI": 95, "DEF": 45, "PHY": 78, "VIT": 99, "TEC": 98, "MEN": 90, "POS": 92, "GKP": 10, "OVR": 96}
    }
    engine.generate_card(mock_player)
