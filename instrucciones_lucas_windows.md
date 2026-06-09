# 🚀 Instrucciones para Lucas — Conexión y Uso de Hermes en Windows

¡Hola Lucas! Nico y el equipo de integración de GoalChain ya configuraron todo tu entorno de multi-agentes y tus bots dentro del servidor VPS de GoalChain. **Todo está pre-autenticado, clonado y listo para operar**, por lo que **NO** necesitas hacer login en X (Twitter), ni crear credenciales de Grok, ni configurar tokens de Discord desde cero.

---

## ⚠️ Corrección del error común
Si intentas ejecutar `hermes-gateway start`, el sistema te dirá `command not found`. 
Esto se debe a que **no lleva guion**. El comando correcto es **con espacio**:
```bash
hermes gateway start
```
O especificando el perfil directamente con `-p`:
```bash
hermes -p lucas gateway start
```

---

## 🛠️ Paso 1: Abrir la consola en Windows
Para conectarte al servidor VPS, utilizaremos la consola nativa de Windows.

1. Presiona la tecla **Windows** en tu teclado.
2. Escribe **cmd** (Símbolo del sistema) o **PowerShell**.
3. Presiona **Enter** para abrir la consola.

---

## 🔑 Paso 2: Conectarte al Servidor por SSH
En la consola de Windows, ejecuta el siguiente comando:

```cmd
ssh ubuntu@89.168.20.135
```
*Si es la primera vez que te conectas, la consola te preguntará si confías en la clave del servidor. Escribe `yes` y presiona **Enter**. Luego, ingresa la contraseña cuando te sea solicitada.*

---

## 👤 Paso 3: Asegurar que el PATH esté cargado
A veces, al iniciar sesión por SSH, el sistema no carga la ruta de las herramientas de Hermes automáticamente. Para asegurarte de que todos los comandos funcionen, ejecuta esto primero:

```bash
export PATH="$HOME/.local/bin:$PATH"
```

---

## 🤖 Paso 4: Levantar tus bots en Discord contemporáneamente

¡Ya está todo listo! Tus bots están pre-configurados con sus respectivos tokens e identidades separadas de Discord y con su pool de Grok (xAI) listo para razonar.

### 1. Activar tu bot principal del CEO
Para activar tu bot principal del **CEO** en Discord y empezar a hablarle en los canales de forma fluida (sin necesidad de mencionarlo con `@`):

```bash
# Cambiar al perfil de Lucas
hermes profile use lucas

# Iniciar o reiniciar el gateway de mensajería
hermes gateway restart
```
*También puedes comprobar su estado actual con:*
```bash
hermes gateway status
```

---

### 🧠 2. Levantar otros agentes en paralelo (Bots concurrentes)
Dado que el servidor corre un servicio de fondo para el perfil principal, si quieres levantar **otros bots en paralelo de forma contemporánea** (por ejemplo, el de **X-Scout** o **Daily-Routine**), el método ideal es ejecutarlos en primer plano usando la opción `-p` y `gateway run`:

1. Abre otra pestaña o ventana de la consola en Windows (`cmd` o `PowerShell`).
2. Conéctate de nuevo por SSH: `ssh ubuntu@89.168.20.135`.
3. Asegura el PATH: `export PATH="$HOME/.local/bin:$PATH"`.
4. Ejecuta el bot en primer plano:

*   **Para levantar el bot de X-Scout:**
    ```bash
    hermes -p lucas-x-scout gateway run
    ```
*   **Para levantar el bot del Daily Routine:**
    ```bash
    hermes -p lucas-daily-routine gateway run
    ```
*   **Para levantar el bot de Jito Strategy:**
    ```bash
    hermes -p lucas-jito-strategy gateway run
    ```

*Deja esa ventana de la consola abierta para que el bot siga corriendo. Si deseas cerrarla sin apagar el bot, puedes investigar el uso del comando `screen` o simplemente avísanos para darte soporte.*

---

*¡Cualquier duda o consulta que tengas, avísale a Nico para que lo revisemos de inmediato! Bienvenido al control de la Swarm de GoalChain.*
