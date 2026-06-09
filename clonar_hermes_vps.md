# 🚀 Guía: Cómo clonar el entorno completo de Hermes desde el Servidor VPS a tu Windows Local (vía WSL2)

¡Hola Lucas! Nico y el equipo de GoalChain prepararon esta guía para que puedas realizar una **réplica exacta de todo el entorno de Hermes** (incluyendo configuraciones, credenciales, scripts de integración y repositorios) directamente desde el servidor VPS a tu PC de Windows. Esto te permitirá correr una copia idéntica del sistema de forma local en tu computadora.

---

## 🛠️ Paso 1: Activar Linux (WSL2) en Windows
Para realizar la réplica con total compatibilidad y alta velocidad, utilizaremos **Ubuntu en WSL2**.

1. Presiona la tecla **Windows**, escribe **PowerShell**, haz clic derecho y selecciona **Ejecutar como Administrador**.
2. Instala Linux ejecutando:
   ```powershell
   wsl --install
   ```
   *(Si el sistema lo solicita, reinicia la PC. Al reiniciar, se abrirá la terminal de Ubuntu pidiéndote crear un usuario y contraseña. Pon los que desees).*

---

## 📦 Paso 2: Preparar la consola Ubuntu en Windows
Una vez dentro de la terminal de Ubuntu que se acaba de abrir en Windows, instala las herramientas de red indispensables para transferir los archivos de forma segura:

```bash
sudo apt update && sudo apt install -y rsync openssh-client python3 python3-pip
```

---

## 🔑 Paso 3: Clonar el "Cerebro" de Hermes (Configuraciones y Credenciales)
Ejecuta el siguiente comando para copiar la carpeta oculta de configuraciones del servidor VPS directamente a tu directorio personal en Windows:

```bash
# Crear la carpeta de destino local
mkdir -p ~/.hermes

# Clonar del servidor a local (excluyendo registros históricos pesados)
rsync -avz --exclude="logs/" --exclude="sandboxes/" --exclude="sessions/" ubuntu@89.168.20.135:~/.hermes/ ~/.hermes/
```
*Si la consola te pregunta si confías en el host SSH, escribe `yes` y presiona **Enter**. Luego, introduce la contraseña del servidor.*

---

## 📂 Paso 4: Clonar el Espacio de Trabajo y Repositorio (`hermes`)
A continuación, copia la carpeta principal de trabajo del servidor, la cual contiene el código clonado del proyecto GoalChain:

```bash
# Crear la carpeta de destino local
mkdir -p ~/hermes

# Clonar los directorios y código del servidor a local
rsync -avz --exclude="logs/" --exclude="workspace/GoalChain/.git/hooks/" ubuntu@89.168.20.135:~/hermes/ ~/hermes/
```

---

## 🔗 Paso 5: Instalar y Vincular el Cliente Local en tu PC
Una vez finalizada la transferencia, instala la herramienta ejecutable de Hermes en tu Ubuntu local y conéctala con el repositorio que acabas de clonar:

1. **Instalar el cliente ejecutable de Hermes en tu máquina:**
   ```bash
   curl -fsSL https://hermes-agent.nousresearch.com/install.sh | bash
   ```
2. **Asegurar que la ruta esté cargada en tu consola:**
   ```bash
   export PATH="$HOME/.local/bin:$PATH"
   ```
3. **Vincular el repositorio local con el "cerebro" de Hermes:**
   ```bash
   ln -sfn ~/hermes/workspace/GoalChain ~/.hermes/workspace/GoalChain
   ```

---

## 🎉 ¡Listo para Operar Localmente!
Ya tienes un **clon exacto y funcional** de todo el entorno del servidor corriendo localmente en tu PC de Windows. 

*   Para abrir el cliente interactivo local de Hermes, escribe:
    ```bash
    hermes
    ```
*   Para hacer consultas directas al agente local sobre el estado del proyecto:
    ```bash
    hermes chat -q "GoalChain status"
    ```
*   Todo tu código y archivos del repositorio se encuentran en la carpeta local: `~/hermes/workspace/GoalChain`. ¡Ya puedes trabajar de forma aislada y segura en tu PC local!

---

## 🖥️ Modo remoto: Hermes Desktop → VPS (gateway del servidor)

El **Mac no ejecuta el agente**; el Desktop es una GUI fina y el backend corre en Oracle (`ubuntu@89.168.20.135`).

**En el VPS** (una vez):

```bash
GOALCHAIN_SSH=ubuntu@89.168.20.135 bash ops/hermes/setup-vps-remote-dashboard.sh
```

**En el Mac** (túnel SSH + prefijar conexión):

```bash
START_TUNNEL=1 bash ops/hermes/connect-hermes-desktop-remote-mac.sh
```

**En Hermes.app** → Settings → Gateway → **Remote gateway**:

1. Remote URL: `http://127.0.0.1:9119` (vía túnel) o `http://89.168.20.135:9119` (si el puerto 9119 está abierto en Oracle)
2. **Test remote** → debe mostrar `auth_providers: ["basic"]`
3. **Sign in** (usuario/contraseña) — no uses session token manual
4. **Save and reconnect**

Credenciales en el VPS: `ssh ubuntu@89.168.20.135 'cat ~/hermes/remote-dashboard.credentials'`

OAuth (Nous) en lugar de password: en el VPS `hermes auth add nous` + `hermes dashboard register`, luego Sign in with Nous Research en el Desktop.

**Importante:** `:8644` y `:8645` son *gateways* de mensajería (webhook/Telegram), no el dashboard. El Desktop remoto usa **`:9119`** (`hermes dashboard`).
