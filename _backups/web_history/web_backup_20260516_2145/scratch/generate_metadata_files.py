import json
import os

# Configuración base para GoalChain
BASE_URL = "https://raw.githubusercontent.com/TheNeuralWars/GoalChain/main/goalchain_web/assets/img/nfts/"
METADATA_DIR = "/Users/NicoPez/GoalChain/goalchain_web/assets/data/metadata"
PLAYERS_JSON = "/Users/NicoPez/GoalChain/goalchain_web/assets/data/players.json"
SYMBOL = "GCH"
SELLER_FEE_BPS = 500 # 5% de Royalties para la Tesorería de GoalChain

def generate_metadata():
    # Asegurar que el directorio de salida existe
    if not os.path.exists(METADATA_DIR):
        os.makedirs(METADATA_DIR)
        print(f"Directorio creado: {METADATA_DIR}")

    # Cargar el registro maestro de jugadores
    with open(PLAYERS_JSON, 'r', encoding='utf-8') as f:
        players = json.load(f)

    print(f"Procesando {len(players)} jugadores...")

    for p in players:
        # Formatear el nombre del archivo de imagen (igual que en nft_registry.js)
        safe_name = p['name'].lower().replace(' ', '_').replace('/', '_')
        image_filename = f"{str(p['id']).zfill(3)}_{safe_name}.png"
        
        # Estructura Estándar Metaplex
        metadata = {
            "name": p['name'],
            "symbol": SYMBOL,
            "description": f"GoalChain Genesis Squad - Jugador #{p['number']} de {p['country']}. {p['details']}",
            "seller_fee_basis_points": SELLER_FEE_BPS,
            "image": f"{BASE_URL}{image_filename}",
            "attributes": [
                {"trait_type": "País", "value": p['country']},
                {"trait_type": "Posición", "value": p['position']},
                {"trait_type": "Rareza", "value": p['rarity'].capitalize()},
                {"trait_type": "Número", "value": str(p['number'])},
                {"trait_type": "Ataque", "value": p['stats']['atk']},
                {"trait_type": "Defensa", "value": p['stats']['def']},
                {"trait_type": "Hype", "value": p['stats']['hype']}
            ],
            "properties": {
                "files": [
                    {
                        "uri": f"{BASE_URL}{image_filename}",
                        "type": "image/png"
                    }
                ],
                "category": "image",
                "creators": [
                    {
                        "address": "TU_WALLET_OFICIAL_AQUÍ", # Nico: Aquí pondremos la wallet de tesorería que crees
                        "share": 100
                    }
                ]
            }
        }

        # Guardar archivo individual
        output_path = os.path.join(METADATA_DIR, f"{p['id']}.json")
        with open(output_path, 'w', encoding='utf-8') as out:
            json.dump(metadata, out, indent=4, ensure_ascii=False)

    print(f"¡Hecho! Se han generado {len(players)} archivos de metadatos en {METADATA_DIR}")

if __name__ == "__main__":
    generate_metadata()
