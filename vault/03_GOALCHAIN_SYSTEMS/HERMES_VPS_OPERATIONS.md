# 🤖 Operaciones Autónomas de Hermes en VPS (Oracle Cloud)

Manual de infraestructura, gestión de procesos y protocolos de seguridad para el agente Hermes operando 24/7 en el servidor remoto.

---

## 🖥️ 1. Infraestructura y Rutas Críticas del Servidor

* **Host:** Oracle Cloud Infrastructure (Ubuntu 24.04 LTS).
* **Directorio Raíz de Datos:** `/data/` y `/data/hermes-home/`
* **Daemon de Hermes:** Gestionado vía systemd / tmux.
* **Modelo LLM Activo:** `xai/grok-4.6` con autenticación Super Grok OAuth (`xai-oauth`).
* **Canal Primario de Comunicación:** Discord servidor oficial, canal `#hermes` (WhatsApp está 100% deprecado).

---

## 🛡️ 2. Prevención de Congelamientos y Salud del Sistema

* **Regla de Oro de I/O de Logs:**
  * **NUNCA** ejecutar `.read_text()` o `.splitlines()` sobre archivos `.jsonl` o `.log` superiores a 50 MB en memoria de golpe (causante del bloqueo previo por OOM de 19 GB de RAM).
  * Siempre utilizar lectura en streaming por chunks o `tail` desde el final del archivo.
  * El script `scripts/trading/log_rotator.py` se encarga de truncar logs mayores a 25 MB.
* **Carga de Trabajo:** Mantener el `load average` del VPS por debajo de 2.0. Si supera 4.0, pausar daemons de scraping o video.

---

## 💼 3. Hot Wallet Canary (`trader_canary.json`)

* **Ruta en Servidor:** `/home/ubuntu/.config/solana/trader_canary.json` (`chmod 600 ubuntu:ubuntu`).
* **Dirección Pública:** `7zNMCLvTdW1YQcVP1yqD6Ct4iyaGaTdztNrZWaYGqopm`
* **Wallet Principal de CLI:** `id.json` (`D6AabfJnF6sxuAymDz7JMbB4r2i2FaQVzPb7G7nhMMxo`) — **JAMÁS MEZCLAR FONDOS**.
* **Protocolo de Fondos:** Nunca almacenar más de 0.50 SOL en la hot wallet canary. Fondear en tramos según avance el piloto de 50 trades.

---

## 🧠 4. Protocolo de Sincronización gBrain

* **Visibilidad:** Cuando Hermes tome una decisión de arquitectura, complete un trade o cambie de estado, debe llamar al MCP tool `gbrain -> remember` con `visibility: world`.
* Esto garantiza que Antigravity en la máquina local conozca el estado de Hermes sin necesidad de sondeo manual.
