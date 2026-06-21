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

1. **Herramientas base (winget):** Instala Node.js LTS, GitHub CLI y Obsidian de forma silenciosa.
2. **Runtimes de Desarrollo:** Instala Bun, Rust (Rustup) y Solana CLI.
3. **Anchor CLI:** Configura Anchor en la versión exacta **`1.0.2`** para alinearse con los smart contracts del proyecto.
4. **SSH con el VPS (`89.168.20.135`):** Genera tu par de claves SSH locales, las copia al servidor para acceso sin contraseña, descarga la clave del contrato (`goalchain_program-keypair.json`) y el archivo de secretos `.env`.
5. **Base de Datos gBrain local:** Inicializa la base de datos de contexto local, importa la documentación y genera los embeddings.
6. **Configuración de Antigravity (Editor):** Configura la extensión Gemini en Windows con los mismos accesos, modo oscuro activado y vinculada al MCP de gBrain local.
7. **Bóveda de Obsidian:** Descarga y activa los plugins `obsidian-git` y `dataview`.

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
2. La IA detectará automáticamente el archivo de configuración generado en `~/.gemini/config/mcp_config.json` para conectarse a tu base de datos de conocimiento local (`gbrain`).
