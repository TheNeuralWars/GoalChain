# 🚀 Guía Maestra: Automatización de Imágenes GoalChain (Flux + IP-Adapter) — Edición Nativa para Windows 11 Pro

¡Hola Lucas! Tu hermano Nico y el equipo de GoalChain prepararon este manual de automatización personalizado para tu PC con Windows. Tienes una computadora impresionante con hardware de última generación:
*   **CPU:** AMD Ryzen 7 7700 (8 núcleos, ideal para procesamiento en paralelo).
*   **RAM:** 32 GB (suficiente para cargar múltiples modelos en memoria).
*   **GPU:** **NVIDIA GeForce RTX 3090 con 24 GB de VRAM** (el "monstruo" definitivo para Inteligencia Artificial. Nos permitirá generar imágenes con el modelo ultra-complejo **Flux.1 Dev** de forma local en segundos).

No te preocupes por configurar códigos complejos ni instalar dependencias a mano. **Hermes (tu asistente de IA) se encargará de realizar toda la instalación y correr el proceso de forma 100% automática.** Solo debes copiar y pegar los prompts que te dejamos aquí abajo dentro de la consola **PowerShell** de Windows.

---

## 📂 Directorios y Rutas en tu PC (Windows 11)

Las carpetas de trabajo nativas en tu sistema son:

*   **Ruta del Repositorio (GoalChain):** 
    `C:\Users\lucas.gemini\antigravity\scratch\GoalChain`
*   **Ruta de las Imágenes de Referencia (Caras/Cuerpos):** 
    `C:\Users\lucas.gemini\antigravity\scratch\GoalChain\scratch\grok_batches`

---

## 🔑 Paso 0: Abrir tu Consola y Autenticar a Hermes en Windows

1.  Presiona la tecla **Windows** en tu teclado.
2.  Escribe **PowerShell** y presiona **Enter** para abrir la consola nativa de Windows.
3.  Accede a la carpeta de tu repositorio clonado:
    ```powershell
    cd "C:\Users\lucas.gemini\antigravity\scratch\GoalChain"
    ```
4.  **Iniciar sesión en Grok (xAI) mediante OAuth (Solo la primera vez):**
    *Ejecuta este comando en PowerShell:*
    ```powershell
    hermes auth add xai-oauth
    ```
    *Esto te dará un enlace. Hazle clic, te abrirá tu navegador local de Windows y tras loguearte en tu cuenta de X/Grok quedará enlazado para siempre.*
5.  **Iniciar el Chat Interactivo con tu Agente Hermes:**
    Escribe el siguiente comando para abrir el chat con Hermes directamente en tu PowerShell:
    ```powershell
    hermes
    ```
    *(A partir de este momento, estás hablando directamente con Hermes en la consola. Copia y pega los prompts de abajo secuencialmente).*

---

## ⚡ PROMPT 1: Instalación automática del entorno de generación

Copia y pega este texto en tu chat con **Hermes** y presiona **Enter**:

> **PROMPT A COPIAR Y PEGAR:**
> *"Hermes, necesito que instales de forma completamente automática en mi máquina Windows 11 (NVIDIA RTX 3090 de 24GB) el entorno para generación de imágenes. Debes realizar las siguientes acciones de forma autónoma usando comandos de PowerShell:*
> 
> *1. **Crear el entorno de IA:** Instala `ComfyUI` mediante git clone en `C:\Users\lucas.gemini\comfyui`, o bien configura un entorno local de Python con las librerías nativas de Windows: `diffusers`, `transformers`, `accelerate`, `insightface` y `onnxruntime-gpu` para habilitar la aceleración CUDA por hardware de mi RTX 3090.*
> *2. **Instalar dependencias de procesado:** Instala `rembg` (para remover fondos) y `Pillow` (para composición gráfica y guardado de archivos).*
> *3. **Descargar los modelos de IA de forma optimizada:***
>   *   *Flux.1 Dev FP8 (la versión optimizada de 8 bits del modelo de 12 mil millones de parámetros de Black Forest Labs, ideal para correr súper rápido en mis 24GB de VRAM).*
>   *   *IP-Adapter-FaceID-PlusV2 para Flux.*
>   *   *InsightFace model (antelopev2) para detección de características faciales.*
> 
> *Por favor, ejecuta la instalación de las dependencias paso a paso usando PowerShell y avísame cuando esté todo listo."*

---

## 🔄 PROMPT 2: Creación del Script de Automatización de los 19 Batches

Una vez que Hermes te confirme que instaló el entorno de IA con éxito, cópiale este segundo prompt:

> **PROMPT A COPIAR Y PEGAR:**
> *"Hermes, ahora crea un script inteligente de Python llamado `procesar_cromos.py` dentro de mi repositorio en `C:\Users\lucas.gemini\antigravity\scratch\GoalChain`. El script debe ser compatible con Windows (utilizando pathlib para manejar las barras inversas `\` de las rutas) y automatizar el siguiente flujo:*
> 
> *1. **Cargar la base de datos de prompts:** Debe leer de forma secuencial los archivos JSON de prompts desde `prompts_batch_1.json` hasta `prompts_batch_19.json`.*
> *2. **Buscar imágenes de referencia:** Para cada jugador con ID `[ID]`, debe buscar de forma automática las fotos de referencia en mi carpeta de Windows `C:\Users\lucas.gemini\antigravity\scratch\GoalChain\scratch\grok_batches`. Las imágenes se llaman `[padded_id]_portrait.jpg` (cara) y `[padded_id]_fullbody.jpg` (cuerpo).*
> *3. **Generación con Face Transfer (Flux.1 Dev + IP-Adapter):***
>   *   *Usar Euler Sampler con 25 pasos y CFG 3.5.*
>   *   *Aplicar Face Transfer usando IP-Adapter-FaceID-PlusV2 con una fuerza inicial de 0.9 (ajustable de 0.8 a 1.2).*
>   *   *Asegurar resolución exacta vertical 1024x1536 (relación de aspecto 2:3).*
> *4. **Estructura de salida:** Debe crear las carpetas de salida en mi repositorio llamadas `batch_01/` a `batch_19/` y guardar los archivos generados en formato PNG limpio.*
> 
> *Escribe el código completo y avísame para poder correrlo."*

---

## 🎨 PROMPT 3: Post-procesamiento y Limpieza PNG (Fondo Blanco Puro)

Una vez diseñado el script de generación, dile a Hermes que implemente la fase final de post-procesamiento:

> **PROMPT A COPIAR Y PEGAR:**
> *"Hermes, añade al pipeline la fase final de post-procesamiento estricto sobre cada imagen generada usando Python (`Pillow` y `rembg`):*
> 
> *1. **Remoción de fondos residuales:** Ejecuta `rembg` sobre la caricatura generada para aislar al jugador por completo de forma nativa en Windows.*
> *2. **Fondo Blanco Puro (#FFFFFF):** Compón al jugador recortado sobre un fondo plano de color blanco sólido puro sin sombras.*
> *3. **Encuadre estricto:** Asegura que los pies descalzos del jugador toquen el suelo blanco de forma de estatua 3D natural y realiza un recorte/redimensionado exacto a proporción 2:3 en formato PNG optimizado sin pérdida.*
> 
> *Una vez que completes la integración del script, ejecútalo para comenzar la producción automática desde el Batch 1 hasta el Batch 19. Muéstrame el progreso de las tarjetas generadas en tiempo real."*

---

## 💡 Alternativas técnicas que Hermes evaluará en Windows:

*   **Alternativa A (Headless python diffusers nativo):** Hermes correrá un script nativo de Python usando la librería `diffusers`. Esto es **extremadamente rápido**, consume menos recursos y no requiere abrir ninguna página web de ComfyUI. Es la opción ideal para automatizar por completo en Windows.
*   **Alternativa B (API de ComfyUI en Windows):** Hermes descargará ComfyUI Portable para Windows, lo levantará en segundo plano en el puerto `:8188` e inyectará los flujos JSON por API. Es excelente si luego quieres abrir ComfyUI en tu navegador de Windows y ver el flujo gráfico de las conexiones.

*(Hermes elegirá e implementará la alternativa más estable y veloz para tu GPU RTX 3090 de forma automática).*
