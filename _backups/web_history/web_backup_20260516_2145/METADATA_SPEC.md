# 📜 GoalChain NFT Metadata Specification

Este documento define la estructura JSON de los metadatos dinámicos para los NFTs de GoalChain ($GCH).

## 🧩 JSON Schema (Metaplex Standard)

```json
{
  "name": "GoalChain #001 - Lionel Satoshi",
  "symbol": "GCH",
  "description": "Genesis Squad Player Card. Official collectible for The Neural Wars.",
  "image": "https://arweave.net/...",
  "attributes": [
    { "trait_type": "Nationality", "value": "Argentina" },
    { "trait_type": "Position", "value": "Forward" },
    { "trait_type": "Rarity", "value": "Mythic" },
    { "trait_type": "PAC", "value": 94 },
    { "trait_type": "SHO", "value": 91 },
    { "trait_type": "PAS", "value": 96 },
    { "trait_type": "DRI", "value": 95 },
    { "trait_type": "DEF", "value": 45 },
    { "trait_type": "PHY", "value": 78 },
    { "trait_type": "Season", "value": "2026" }
  ],
  "properties": {
    "files": [
      { "uri": "https://arweave.net/...", "type": "image/png" }
    ],
    "category": "image"
  }
}
```

## ⚡ Atributos Dinámicos
Los atributos marcados con `PAC`, `SHO`, `PAS`, `DRI`, `DEF`, `PHY` son mutables. El Oráculo de GoalChain actualizará estos valores tras cada partido oficial.

## 🔗 Storage
Utilizaremos **Arweave** (vía Irys) para el almacenamiento permanente de las capas base, y el `uri` del metadato apuntará a nuestro servidor dinámico o a una actualización directa en el Merkle Tree de Solana.
