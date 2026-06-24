#!/usr/bin/env python3
import os
import json
import shutil

COUNTRY_JERSEY_MAP = {
    "argentina": "featuring iconic sky blue and white vertical stripes, subtle gold accents, jersey number {num} in gold modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "brazil": "featuring a vibrant yellow body with faint debossed native patterns, green trim on the crew collar and cuffs, jersey number {num} in green modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching blue athletic shorts",
    "brasil": "featuring a vibrant yellow body with faint debossed native patterns, green trim on the crew collar and cuffs, jersey number {num} in green modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching blue athletic shorts",
    "france": "featuring a deep royal blue body, elegant gold details, jersey number {num} in gold modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "francia": "featuring a deep royal blue body, elegant gold details, jersey number {num} in gold modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "spain": "featuring a vibrant red body with yellow details along the shoulders and sides, jersey number {num} in yellow modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching royal blue athletic shorts",
    "españa": "featuring a vibrant red body with yellow details along the shoulders and sides, jersey number {num} in yellow modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching royal blue athletic shorts",
    "germany": "featuring a classic white body with black, red, and gold gradient patterns on the shoulders, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "alemania": "featuring a classic white body with black, red, and gold gradient patterns on the shoulders, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "italy": "featuring a classic azure blue body with subtle green-white-red tricolor details on the collar, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "italia": "featuring a classic azure blue body with subtle green-white-red tricolor details on the collar, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "portugal": "featuring a rich red body with green and gold trim on the collar and sides, jersey number {num} in gold modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching green athletic shorts",
    "england": "featuring a clean white body with a navy blue collar and side stripe details, jersey number {num} in navy modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching navy athletic shorts",
    "inglaterra": "featuring a clean white body with a navy blue collar and side stripe details, jersey number {num} in navy modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching navy athletic shorts",
    "uruguay": "featuring a classic sky blue body with white and black accents on the collar and cuffs, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "usa": "featuring a white body with red and blue piping, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching navy blue athletic shorts",
    "united states": "featuring a white body with red and blue piping, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching navy blue athletic shorts",
    "estados unidos": "featuring a white body with red and blue piping, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching navy blue athletic shorts",
    "mexico": "featuring a deep green body with subtle Aztec-inspired tonal patterns, red trim on the collar and sides, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "méxico": "featuring a deep green body with subtle Aztec-inspired tonal patterns, red trim on the collar and sides, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "netherlands": "featuring a vibrant orange body with subtle tonal wave patterns, black trim on the collar and cuffs, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching orange athletic shorts",
    "países bajos": "featuring a vibrant orange body with subtle tonal wave patterns, black trim on the collar and cuffs, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching orange athletic shorts",
    "holanda": "featuring a vibrant orange body with subtle tonal wave patterns, black trim on the collar and cuffs, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching orange athletic shorts",
    "colombia": "featuring a bright yellow body with subtle blue and red accent stripes, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "croatia": "featuring the iconic red and white checkerboard pattern, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "croacia": "featuring the iconic red and white checkerboard pattern, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "morocco": "featuring a red body with green accents and trim, jersey number {num} in green modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching green athletic shorts",
    "marruecos": "featuring a red body with green accents and trim, jersey number {num} in green modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching green athletic shorts",
    "belgium": "featuring a deep wine red body with gold and black accents, jersey number {num} in gold modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "bélgica": "featuring a deep wine red body with gold and black accents, jersey number {num} in gold modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "japan": "featuring a samurai blue body with subtle abstract blue and white flame graphics, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "japón": "featuring a samurai blue body with subtle abstract blue and white flame graphics, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "south korea": "featuring a vibrant red body with subtle tiger-stripe tonal patterns, black trim, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "corea del sur": "featuring a vibrant red body with subtle tiger-stripe tonal patterns, black trim, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching black athletic shorts",
    "nigeria": "featuring a vibrant light green and white feather-patterned body, jersey number {num} in black modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "canada": "featuring a red body with white accent side panels, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "canadá": "featuring a red body with white accent side panels, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "switzerland": "featuring a clean red body with thin white horizontal lines, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "suiza": "featuring a clean red body with thin white horizontal lines, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "denmark": "featuring a red body with tonal diagonal textures and white accents, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "dinamarca": "featuring a red body with tonal diagonal textures and white accents, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "poland": "featuring a white body with red sleeve stripes, jersey number {num} in red modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "polonia": "featuring a white body with red sleeve stripes, jersey number {num} in red modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "senegal": "featuring a green body with yellow and red chest chevron patterns, jersey number {num} in yellow modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching green athletic shorts",
    "ecuador": "featuring a yellow body with blue and red details, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching blue athletic shorts",
    "ukraine": "featuring a yellow body with blue accent piping, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching yellow athletic shorts",
    "ucrania": "featuring a yellow body with blue accent piping, jersey number {num} in blue modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching yellow athletic shorts",
    "turkey": "featuring a white body with a red chest band and red collar, jersey number {num} in red modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "turquía": "featuring a white body with a red chest band and red collar, jersey number {num} in red modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
    "austria": "featuring a red body with subtle white trim, jersey number {num} in white modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching red athletic shorts",
    "georgia": "featuring a white body with red cross motifs and red side panels, jersey number {num} in red modern font on the chest, realistic fabric knit texture, high-end athletic seams, and matching white athletic shorts",
}

def get_jersey_description(country, num):
    country_clean = country.lower().strip()
    if country_clean in COUNTRY_JERSEY_MAP:
        desc = COUNTRY_JERSEY_MAP[country_clean].format(num=num)
        return f"wearing the premium {country} national team jersey {desc}"
    return (
        f"wearing a premium modern national team athletic jersey of {country} (featuring the country's signature athletic colors "
        f"with high-end athletic trim, jersey number {num} printed in a modern font on the chest, and realistic fabric knit texture) "
        f"and matching team athletic shorts"
    )

def prepare_batches_v7_mono():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    players_path = os.path.join(base_path, "docs/assets/data/players.json")
    current_players_dir = os.path.join(base_path, "scratch/current_web_players")
    batches_dir = os.path.join(base_path, "scratch/grok_batches_v7")
    logo_src = r"C:\Users\NicoPez\Pictures\logo_3d_jersey.jpg"
    
    # 1. Clean previous batches if any
    if os.path.exists(batches_dir):
        shutil.rmtree(batches_dir)
    os.makedirs(batches_dir, exist_ok=True)
    
    # Copy logo to batches_dir root
    if os.path.exists(logo_src):
        shutil.copy(logo_src, os.path.join(batches_dir, "logo_3d_jersey.jpg"))
        print("[GoalChain] Logo de 3D copiado a la raíz de batches_v7.")
    else:
        print(f"[GoalChain - WARNING] El archivo de logo origen no existe en: {logo_src}")
    
    print("[GoalChain] Cargando base de datos de jugadores...")
    with open(players_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    total_players = len(players)
    players_per_batch = 30
    
    # Calculate batches
    batches = [players[i:i + players_per_batch] for i in range(0, total_players, players_per_batch)]
    num_batches = len(batches)
    
    print(f"[GoalChain] Total jugadores: {total_players}")
    print(f"[GoalChain] Configurando {num_batches} carpetas de batches con Mono-LEEME.txt V7.1...")
    
    # Generate batch directories
    for idx, batch_players in enumerate(batches):
        batch_num = idx + 1
        batch_folder_name = f"batch_{batch_num:02d}"
        batch_folder_path = os.path.join(batches_dir, batch_folder_name)
        os.makedirs(batch_folder_path, exist_ok=True)
        
        # Copy logo to the batch folder
        if os.path.exists(logo_src):
            shutil.copy(logo_src, os.path.join(batch_folder_path, "logo_3d_jersey.jpg"))
            
        # Build metadata list for this batch
        batch_metadata = []
        for p in batch_players:
            pid = p['id']
            padded_id = f"{pid:03d}"
            name = p.get('name', 'Player')
            real_name = p.get('real_name', name)
            country = p.get('country', 'Unknown')
            jersey_number = p.get('jersey_number', 10)
            physical_t = p.get('physical', {}).get('t', '')
            
            jersey_desc = get_jersey_description(country, jersey_number)
            
            prompt_str = (
                f"Using the uploaded image '{padded_id}.jpg' as the exact pose, body proportions, and 3D caricature style reference: "
                f"Modify and improve this caricature of {real_name} ({country}). "
                f"STYLE: Retain the identical premium 3D digital sculpture caricature aesthetic (high-end vinyl toy collector figurine render, stylized proportions with a slightly enlarged head). "
                f"FACIAL DETAILS: Analyze the face in '{padded_id}.jpg' and adjust the features to look closer to the real-life {real_name} (actual physical traits: {physical_t}), correcting any glaring facial or hair differences while maintaining the vinyl toy likeness. "
                f"KIT UPDATE: Replace the plain kit or existing branding from '{padded_id}.jpg' with: {jersey_desc} containing the player's jersey number {jersey_number} printed in a clean modern font in the center of the chest. The left chest must ONLY feature a 3D GoalChain logo (rendered exactly as a 3D translucent glass cube containing a small soccer ball inside, with 'GCH' glowing in neon green on the front and a metallic chain wrapping its base, using 'logo_3d_jersey.jpg' as the exact visual reference). The right chest must ONLY feature the 3D Solana logo (three parallel tilted slash bars in neon teal-to-purple gradient). You must completely REMOVE all real-world sports brand logos (like Adidas, Nike, Puma), all official national football federation badges or crests (such as the AFA shield, federation stars, or golden championship patches), and any country flags. The jersey must be completely clean apart from the chest number, Solana logo, and the GoalChain cube logo. "
                f"FEET & STANCE: Keep him strictly barefoot, with bare feet, heels, and toes fully visible, standing flat on the floor. Absolutely NO base, pedestal, stand, platform, or support under the feet. No shoes, no socks. "
                f"BACKGROUND: Isolated on a pure flat solid white background (#FFFFFF) with absolutely zero shadows, zero gradients, zero shading, and zero reflections. The floor and background are one single uniform white plane."
            )
            
            batch_metadata.append({
                "id": pid,
                "padded_id": padded_id,
                "name": name,
                "real_name": real_name,
                "country": country,
                "jersey_number": jersey_number,
                "physical_description": physical_t,
                "jersey_description": jersey_desc,
                "grok_prompt": prompt_str
            })
            
            # Copy player image
            source_img = os.path.join(current_players_dir, f"{padded_id}.jpg")
            if os.path.exists(source_img):
                shutil.copy(source_img, os.path.join(batch_folder_path, f"{padded_id}.jpg"))
            else:
                fallback_img = os.path.join(current_players_dir, f"{pid}.jpg")
                if os.path.exists(fallback_img):
                    shutil.copy(fallback_img, os.path.join(batch_folder_path, f"{padded_id}.jpg"))
                else:
                    print(f"[GoalChain - WARNING] Imagen faltante para ID: {padded_id}")

        # Format JSON metadata as string for inclusion
        json_data_str = json.dumps(batch_metadata, indent=4, ensure_ascii=False)
        
        # Write separate JSON file per batch for Hermes
        batch_json_path = os.path.join(batches_dir, f"batch_{batch_num:02d}_players.json")
        with open(batch_json_path, 'w', encoding='utf-8') as jf:
            json.dump(batch_metadata, jf, indent=4, ensure_ascii=False)
        print(f"[GoalChain] Guardado {batch_json_path}")
        
        # Build the final Mono-LEEME text content
        mono_readme_content = f"""================================================================================
⚽ GOALCHAIN BATCH {batch_num:02d} - MONO-INSTRUCCIONES PARA GROK IMAGINE AGENT V7.1
================================================================================

Este archivo contiene TODAS las habilidades, instrucciones y metadatos de los jugadores
para el Batch {batch_num:02d} (IDs {batch_players[0]['id']} al {batch_players[-1]['id']}).

Copia TODO el contenido de este archivo (desde "COMIENZO DEL PROMPT" hasta el final)
y envíalo como el primer mensaje en un chat limpio en Grok (https://grok.com/imagine/agent/).
Carga también las {len(batch_players)} imágenes (.jpg) y el logo 'logo_3d_jersey.jpg' de esta carpeta en el mismo chat.

--------------------------------------------------------------------------------
👇 COMIENZO DEL PROMPT (COPIA DESDE AQUÍ) 👇
--------------------------------------------------------------------------------
Grok, asumes el rol de **Ejecutor Visual de GoalChain V7.1 (Actualización de Jerseys, Logos y Fisionomía)**.
Tu objetivo es mejorar secuencialmente las imágenes de caricaturas 3D de los jugadores subidos al chat, basándote en la metadata y las habilidades contenidas en este mensaje.

### 📚 HABILIDADES DE SOPORTE (SKILLS)
Debes aplicar de forma estricta las siguientes 3 habilidades cargadas en este mensaje:

#### HABILIDAD 1: Jersey & Texturas (grok_skill_jersey_upgrade)
- Remove Plain Kits: Reemplaza cualquier camiseta lisa o negra de la imagen por el jersey de selección nacional.
- Apply National Colors & Patterns: Usa los colores oficiales y patrones del país del jugador.
- Fabric & Material: Agrega textura de malla deportiva (athletic mesh knit), costuras 3D en hombros/cuello, y arrugas de tela con sombreado y brillos premium.
- Collar: Cuello moderno (crew-neck) o de canalé con detalles en puños.

#### HABILIDAD 2: Fisionomía y Parecido (grok_skill_physiognomy_refinement)
- No rostro genérico: Ajusta ojos, cejas, nariz, boca, vello facial y pelo para parecerse al jugador real en base a "real_name" y "physical_description".
- Caricatura 3D: Mantener proporciones de cabeza grande (bobblehead) y estilo de figura de vinilo de colección o juguete de arte (Art Toy), con textura de piel mate tipo vinilo suave/resina y luces suaves de estudio.

#### HABILIDAD 3: Branding, Logos y Dorsal (grok_skill_branding_details)
- Número: Dorsal ("jersey_number") impreso en tipografía deportiva limpia y moderna en el centro del pecho.
- Logo GoalChain: Emblema e-sports 3D (basado exactamente en la imagen 'logo_3d_jersey.jpg' cargada en este chat) en el lado izquierdo del pecho (sobre el corazón). Debe renderizarse como una versión en miniatura 3D del logotipo con reflejos metálicos sutiles.
- Logo Solana: Tres barras inclinadas paralelas (emblema de Solana) en relieve 3D, brillando con un degradado de neón verde-cian (#14f195) a morado (#9945ff), ubicado en el lado derecho del pecho.

### 📐 REGLAS CLAVE DE LA OPERACIÓN (V7.1)
- REFERENCIA VISUAL INVIOLABLE: Usa la imagen cargada "[padded_id].jpg" como la referencia de pose, proporciones y estilo 3D de base. También usa 'logo_3d_jersey.jpg' como la referencia visual obligatoria para el escudo de GoalChain.
- PIES Y SOPORTE: Strictly barefoot. Pies descalzos visibles (talón, planta y dedos) apoyados planos directamente sobre el suelo blanco. Sin calzado ni calcetines. Absolutamente SIN base, pedestal, tarima, plataforma, stand ni soporte debajo de los pies.
- JERSEY LIMPIO: El jersey solo debe incluir el dorsal, el logo 3D de GoalChain y el logo 3D de Solana. Absolutamente NINGÚN otro logo, sponsor, marca o bandera de país.
- FONDO: Fondo blanco puro (#FFFFFF) completamente liso, plano, sin sombras en el piso ni degradados. El piso y el fondo son un solo plano uniforme.

### 🔄 FLUJO SECUENCIAL DE TRABAJO
1. Yo te indicaré el ID (ej. "Procesa ID {batch_players[0]['id']:03d}" o "Siguiente").
2. Mostrarás un resumen del cambio:
   - **Jugador**: [Nombre Real] ([País])
   - **Fisionomía**: [Ajustes faciales a realizar]
   - **Jersey**: [Colores, número y logos]
3. Generarás la imagen mejorada vertical (Aspect Ratio 2:3).
4. Escribirás tras generar: `✅ ID [padded_id] - [real_name] completado. Guardar como: [padded_id]_[safe_name].jpg`
5. DETENTE y espera a que yo te diga "Siguiente" o "Next" antes de continuar.

### 📊 METADATA DE LOS JUGADORES DEL BATCH
Usa esta base de datos exacta para las generaciones:
```json
{json_data_str}
```

¿Entendido? Confirma que tienes toda la información y procesa el primer jugador del lote.
--------------------------------------------------------------------------------
"""
        with open(os.path.join(batch_folder_path, "LEEME.txt"), 'w', encoding='utf-8') as f:
            f.write(mono_readme_content)
            
    print("[GoalChain] Estructura de batches V7.1 Monolítica completada con éxito en: scratch/grok_batches_v7/!")
    print(f"[GoalChain] Se crearon {num_batches} lotes y se copiaron las imágenes y logos correspondientes con su Mono-LEEME.txt V7.1.")

if __name__ == "__main__":
    prepare_batches_v7_mono()
