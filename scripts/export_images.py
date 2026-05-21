#!/usr/bin/env python3
"""
GoalChain NFT Image Exporter - V5.1
Ejecuta este script después de descargar manualmente las imágenes del chat de Grok.
"""

import os
import shutil
from pathlib import Path

# ============================================================
# MAPEO OFICIAL DE JUGADORES (IDs 1-20 generados hasta ahora)
# ============================================================
players = {
    1: "lionel_satoshi",
    2: "dibu_de_fi",
    3: "julian_bull_varez",
    4: "enzo_ether",
    5: "rodrigo_de_pool",
    6: "angel_di_merkle",
    7: "alexis_mac_chain",
    8: "cuti_crypt",
    9: "lisandro_butcher_dao",
    10: "nahuel_mo_wallet",
    11: "nico_taglia_token",
    12: "kylian_m_bypass_pe",
    13: "antoine_g_zksync",
    14: "ousmane_de_shard",
    15: "eduardo_cama_logic",
    16: "theo_shiller",
    17: "mike_maignan_admin",
    18: "aurelien_buffer_tch",
    19: "william_sali_struct",
    20: "dayot_upame_kernel"
}

# ============================================================
# CONFIGURACIÓN (EDITA ESTO SI ES NECESARIO)
# ============================================================
SOURCE_DIR = Path("./descargas_jugadores")      # Carpeta donde guardaste las imágenes como 1.jpg, 2.jpg...
DEST_DIR = Path("./docs/assets/images/nfts")    # Carpeta destino (se crea automáticamente)
IMAGE_EXTENSION = ".jpg"                        # Cambia a .png si las descargaste en ese formato

def main():
    print("🚀 GoalChain NFT Exporter iniciado...")
    
    # Crear carpeta destino si no existe
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    
    copied = 0
    missing = []
    
    for player_id, parody_name in players.items():
        # Nombre original esperado (descargado del chat)
        original_name = f"{player_id}{IMAGE_EXTENSION}"
        src_path = SOURCE_DIR / original_name
        
        # Nombre final según tu especificación exacta
        final_name = f"{player_id:03d}_{parody_name}{IMAGE_EXTENSION}"
        dst_path = DEST_DIR / final_name
        
        if src_path.exists():
            shutil.copy2(src_path, dst_path)
            print(f"✅ {original_name} → {final_name}")
            copied += 1
        else:
            missing.append(original_name)
    
    print(f"\n📦 Proceso completado: {copied} imágenes copiadas.")
    
    if missing:
        print(f"⚠️  Faltan {len(missing)} archivos: {', '.join(missing)}")
        print("   Descárgalos del chat de Grok (clic derecho → Guardar imagen como...) y vuelve a ejecutar.")
    
    print("\n📁 Archivos listos en:", DEST_DIR.resolve())
    print("\n🔧 Próximos pasos manuales:")
    print("   cd docs/assets/images/nfts")
    print("   git add .")
    print('   git commit -m "feat: export generated player images to docs/assets/images/nfts"')
    print("   git push origin main   # (o la rama activa que uses)")

if __name__ == "__main__":
    main()
