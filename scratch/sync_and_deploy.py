import os
import sys
import subprocess
import requests

# Cloudflare Credentials
ACCOUNT_ID = "ef46a2b8d3d46b785a0ecc30c4b994cf"
ZONE_ID = "152a1124f5fb2d3568129ff4df774e75"
API_TOKEN = "cfat_e8UVuFLV2MoZ7IVRuvv4NrDzClmTpWG0yfVUNaLB0742ac87"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def run_command(cmd):
    """Run a system command and return output, printing errors if any."""
    try:
        result = subprocess.run(cmd, shell=True, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return True, result.stdout
    except subprocess.CalledProcessError as e:
        return False, e.stderr + "\n" + e.stdout

def purge_cloudflare_cache():
    """Attempt to purge the Cloudflare Edge cache."""
    print("⚡ [Cloudflare] Solicitando purgado completo de caché para goalchain.fun...")
    url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache"
    payload = {"purge_everything": True}
    
    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        res_json = response.json()
        if response.status_code == 200 and res_json.get("success"):
            print("🚀 [Cloudflare] ¡Caché purgada con éxito! Todos los cambios están en vivo al instante en todo el mundo.")
            return True
        else:
            errors = res_json.get("errors", [])
            print("❌ [Cloudflare] Error de autenticación o permisos al purgar la caché.")
            for err in errors:
                if err.get("code") == 10000:
                    print("\n💡 AVISO IMPORTANTE:")
                    print("   Tu API Token está ACTIVO y VERIFICADO, pero le falta la autorización de purga.")
                    print("   Para activar la sincronización instantánea automática, sigue estos 3 pasos rápidos:")
                    print("   1. Loguéate en tu panel de Cloudflare.")
                    print("   2. Ve a 'My Profile' -> 'API Tokens' (o en la sección del Token donde lo creaste).")
                    print("   3. Haz clic en 'Edit' sobre tu token y agrega la siguiente fila de permiso:")
                    print("      - Category: [Zone]")
                    print("      - Sub-category: [Cache Purge]")
                    print("      - Access: [Edit]")
                    print("   4. Guarda los cambios. ¡Y listo! La próxima vez que corras este script funcionará automático.")
                else:
                    print(f"   [Error {err.get('code')}]: {err.get('message')}")
            return False
    except Exception as e:
        print(f"❌ [Cloudflare] Error de conexión: {e}")
        return False

def deploy_website(commit_message):
    """Orchestrate the Git commit, push and Cloudflare purge."""
    print("🐙 Iniciando proceso de despliegue y sincronización de GoalChain...\n")
    
    # 1. Check git status to see if there are tracked changes
    print("🔍 [Git] Comprobando cambios en el repositorio...")
    success, status_out = run_command("git status --porcelain")
    if not success:
        print(f"❌ Error al comprobar estado de Git: {status_out}")
        return
        
    # We only care if there are changes in 'docs/' or other tracked folders
    if not status_out.strip():
        print("ℹ️  No hay cambios modificados para subir a Git.")
    else:
        print("📝 Cambios detectados. Preparando commit...")
        # Add docs and code files
        run_command("git add docs/")
        run_command("git add ai_context/")
        
        # Check if we have staged changes now
        success, staged_out = run_command("git diff --cached --name-only")
        if staged_out.strip():
            print("💾 Realizando commit de los cambios staged...")
            success, commit_out = run_command(f'git commit -m "{commit_message}"')
            if success:
                print("📤 Subiendo cambios a GitHub Pages (origin main)...")
                push_success, push_out = run_command("git push origin main")
                if push_success:
                    print("✅ ¡Código subido a GitHub con éxito!")
                else:
                    print(f"❌ Error al subir cambios a GitHub: {push_out}")
                    return
            else:
                print(f"❌ Error al hacer commit: {commit_out}")
                return
        else:
            print("ℹ️  Los cambios detectados son archivos untracked (scratch/ o assets/raw/). No requieren subirse a la web.")
            
    # 2. Always attempt to purge Cloudflare cache to ensure edge is fresh
    print("")
    purge_cloudflare_cache()
    print("\n🏁 Proceso de despliegue finalizado.")

if __name__ == "__main__":
    msg = "Auto-update website assets & matching system"
    if len(sys.argv) > 1:
        msg = " ".join(sys.argv[1:])
    deploy_website(msg)
