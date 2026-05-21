import os
from rembg import remove
from PIL import Image
import io

def process_images(input_dir, output_dir):
    """
    Recorre una carpeta llena de imágenes JPG/PNG con fondo blanco,
    les quita el fondo usando IA (rembg) y las guarda como PNG transparentes.
    """
    # Crear directorio de salida si no existe
    if not os.path.exists(output_dir):
        os.makedirs(output_dir)
        print(f"📁 Directorio creado: {output_dir}")

    # Obtener todas las imágenes del directorio de entrada
    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    images = [f for f in os.listdir(input_dir) if f.lower().endswith(valid_extensions)]

    if not images:
        print(f"⚠️ No se encontraron imágenes en {input_dir}")
        return

    print(f"🚀 Iniciando extracción de fondos para {len(images)} jugadores...")

    for i, filename in enumerate(images, 1):
        input_path = os.path.join(input_dir, filename)
        
        # Cambiamos la extensión de salida siempre a .png para la transparencia
        output_filename = os.path.splitext(filename)[0] + ".png"
        output_path = os.path.join(output_dir, output_filename)

        try:
            print(f"[{i}/{len(images)}] Procesando: {filename}...")
            
            # Leer imagen original
            with open(input_path, 'rb') as i_file:
                input_data = i_file.read()

            # Eliminar fondo (Alpha Matting activado para bordes más suaves en el pelo)
            output_data = remove(input_data, alpha_matting=True, alpha_matting_foreground_threshold=240)

            # Guardar imagen resultante como PNG
            with open(output_path, 'wb') as o_file:
                o_file.write(output_data)

        except Exception as e:
            print(f"❌ Error procesando {filename}: {str(e)}")

    print("✅ ¡Extracción completada! Todos los jugadores están listos para la Capa L2.")

if __name__ == "__main__":
    # CONFIGURACIÓN DE RUTAS
    # Cambia estas rutas por la carpeta donde descargues las imágenes de Grok
    INPUT_FOLDER = "assets/img/raw_grok_generations" 
    OUTPUT_FOLDER = "assets/img/players_transparent"

    # Si estamos corriendo desde la raíz del proyecto GoalChain
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    full_input = os.path.join(base_path, INPUT_FOLDER)
    full_output = os.path.join(base_path, OUTPUT_FOLDER)

    # Crear la carpeta de input automáticamente por conveniencia si no existe
    if not os.path.exists(full_input):
        os.makedirs(full_input)
        print(f"💡 Creada carpeta para que sueltes tus imágenes: {full_input}")

    process_images(full_input, full_output)
