# ⚡ GoalChain Minting Strategy (Solana)

Especificaciones para el despliegue masivo y eficiente en la red Solana.

## 🌳 State Compression (cNFTs)
Dada la escala de la colección (1,248 iniciales + expansiones futuras), utilizaremos **Compressed NFTs (cNFTs)** para reducir costos en un 99%.
- **Costo estimado para 1,248 NFTs:** < 0.1 SOL (frente a 25+ SOL con NFTs tradicionales).
- **Herramienta:** Metaplex Bubblegum / Helius Mint API.

## 📜 Metadata Standards (Metaplex)
Cada NFT cumplirá con el estándar `non-fungible` de Metaplex:
- **Name:** "GoalChain #001 - Lionel Satoshi"
- **Symbol:** $GCH
- **Royalty (Seller Fee):** 5% (Destinado al pozo de premios de la comunidad).
- **Mutable:** TRUE (Crítico para que el Oráculo pueda actualizar stats).

## 🚀 Batch Process
1. Creación del **Merkle Tree** en Solana.
2. Minting asíncrono de los 10 "Captain Packs".
3. Minting del resto de la Genesis Squad.
