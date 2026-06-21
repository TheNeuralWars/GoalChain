# 💻 Guía de Configuración para Windows (Mini PC Developer Workspace)

Esta guía te permite configurar de forma rápida y automatizada todo tu entorno de desarrollo de **GoalChain** en tu nueva PC con Windows, dejándolo sincronizado con el VPS y con **Antigravity** potenciado tal como lo tienes en macOS.

---

## 📋 Requisitos Previos

Antes de ejecutar el script, asegúrate de realizar estos simples pasos en tu máquina Windows:

1. **Instalar Git para Windows:**
   - Descárgalo e instálalo desde [git-scm.com](https://git-scm.com/).
   - Durante la instalación, asegúrate de habilitar **Git Bash** (que es la terminal que utilizaremos).
2. **Abrir la terminal correcta:**
   - Abre **Git Bash** (búscalo en el menú Inicio de Windows).

---

## 🔑 SSH & Acceso al VPS: Dos Opciones

Dado que el VPS (`89.168.20.135`) requiere autenticación por llave para conectarse, tienes dos formas de darle acceso a tu Mini PC:

### Opción A (Recomendada): Copiar tu llave privada desde la Mac
Si quieres usar la misma llave SSH en ambos dispositivos:
1. En tu **Mac**, abre la terminal y copia tu llave privada:
   ```bash
   cat ~/.ssh/id_ed25519
   ```
2. En tu **Mini PC** (dentro de Git Bash), crea el archivo correspondiente y pega la llave:
   ```bash
   mkdir -p ~/.ssh && chmod 700 ~/.ssh
   nano ~/.ssh/id_ed25519
   # Pega la llave, guarda (Ctrl+O, Enter) y sal (Ctrl+X)
   chmod 600 ~/.ssh/id_ed25519
   ```
3. Genera la clave pública correspondiente en tu Mini PC:
   ```bash
   ssh-keygen -y -f ~/.ssh/id_ed25519 > ~/.ssh/id_ed25519.pub
   ```

### Opción B: Autorizar la nueva llave de la Mini PC usando tu Mac
Si prefieres que la Mini PC genere su propia llave:
1. El script generará una llave en tu Mini PC (`~/.ssh/id_ed25519.pub`).
2. El script te mostrará un comando para ejecutar **en tu Mac** que agregará esta nueva llave al VPS. El comando se verá así:
   ```bash
   ssh ubuntu@89.168.20.135 "echo 'CONTENIDO_DE_TU_LLAVE_MINIPC' >> ~/.ssh/authorized_keys"
   ```

---

## 🚀 Instrucciones de Inicio Rápido

Sigue estos comandos paso a paso en tu terminal de **Git Bash**:

### Paso 1: Clonar el Repositorio
Navega a la carpeta donde deseas guardar el proyecto y clónalo (si aún no lo has hecho):
```bash
# Cambia a tu directorio de desarrollo (ejemplo)
cd /c/Users/N NicoPez/Documents

# Clonar el repositorio
git clone https://github.com/TheNeuralWars/GoalChain.git

# Entrar al directorio
cd GoalChain
```

### Paso 2: Ejecutar el Script de Configuración
Corre el script automatizado para descargar dependencias, emparejar claves SSH, instalar runtimes e integrar Antigravity:
```bash
# Otorgar permisos de ejecución al script
chmod +x scripts/setup-windows-minipc.sh

# Ejecutar el setup completo
./scripts/setup-windows-minipc.sh
```

---

## 🛠️ ¿Qué hace este script de manera automática?

El script [setup-windows-minipc.sh](file:///Users/NicoPez/GoalChain/scripts/setup-windows-minipc.sh) automatizará todo esto por ti:

1. **Herramientas base (winget):** Instala Node.js LTS, GitHub CLI, Python 3 y Obsidian de forma silenciosa.
2. **Runtimes de Desarrollo:** Instala Bun, Rust (Rustup) y Solana CLI.
3. **Anchor CLI:** Configura Anchor en la versión exacta **`1.0.2`** para alinearse con los smart contracts del proyecto.
4. **SSH con el VPS (`89.168.20.135`):** Verifica el acceso y descarga la clave del contrato (`goalchain_program-keypair.json`) y el archivo de secretos `.env`.
5. **Configuración de Antigravity (Editor):** Configura la extensión Gemini en Windows con los mismos accesos, modo oscuro activado y vinculada a los servidores MCP locales.
6. **Integraciones MCP en Windows:**
   - **`gbrain`**: Configurado usando `bun x gbrain serve` para evitar problemas con envoltorios `.cmd` y scripts Unix en Windows.
   - **`goalchain-ops`**: Conectado directamente a través de `python` llamando a la ruta nativa de Windows convertida automáticamente (`cygpath -w`).
7. **Base de Datos gBrain local:** Inicializa la base de datos de contexto local, importa la documentación y genera los embeddings.
8. **Bóveda de Obsidian:** Descarga y activa los plugins `obsidian-git` y `dataview`.

---

## 🔍 Verificación Post-Instalación

Una vez finalizado el script, recarga tu terminal de Git Bash:
```bash
source ~/.bashrc
```

Y comprueba que los binarios estén listos:
```bash
node --version
bun --version
solana --version
anchor --version
```

### Para usar Obsidian:
1. Abre **Obsidian**.
2. Elige "Open folder as vault" (Abrir carpeta como bóveda).
3. Selecciona la carpeta raíz del proyecto `GoalChain` en tu PC.

### Para usar Antigravity:
1. Abre tu editor (VS Code o Cursor) en la carpeta del proyecto.
2. La IA detectará automáticamente el archivo de configuración generado en `~/.gemini/config/mcp_config.json` para conectarse a tu base de datos de conocimiento local (`gbrain`) y al kit de herramientas operacionales (`goalchain-ops`).
3. Si el agente en la Mini PC necesita conectarse a GitHub o VPS, asegúrate de correr `gh auth login` en la terminal de la Mini PC para sincronizar credenciales adicionales.
