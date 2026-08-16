#!/usr/bin/env python3
import os
import sys
import sqlite3
import requests
import yaml
import subprocess
from datetime import datetime

DB_PATH = "/data/docker/volumes/omniroute-data/_data/storage.sqlite"
CONFIG_PATH = "/data/hermes-home/config.yaml"
ENV_PATH = "/data/hermes-home/.env"
GET_KEY_URL = "https://glm.babel.town/api/get_api_key"
ENCRYPTOR_PATH = "/app/data/encrypt_key_generator.js"

def get_env_variable(var_name):
    if os.path.exists(ENV_PATH):
        try:
            with open(ENV_PATH, 'r', encoding='utf-8') as f:
                for line in f:
                    if line.strip().startswith(f"{var_name}="):
                        # Extract value and strip quotes
                        val = line.split("=")[1].strip()
                        if (val.startswith('"') and val.endswith('"')) or (val.startswith("'") and val.endswith("'")):
                            val = val[1:-1]
                        return val
        except Exception as e:
            print(f"Error reading {var_name} from .env:", e)
    return None

def send_telegram_alert(message):
    token = get_env_variable("TELEGRAM_BOT_TOKEN")
    chat_id = get_env_variable("TELEGRAM_HOME_CHANNEL")
    if token and chat_id:
        url = f"https://api.telegram.org/bot{token}/sendMessage"
        payload = {
            "chat_id": chat_id,
            "text": message
        }
        try:
            r = requests.post(url, json=payload, timeout=10)
            if r.status_code == 200:
                print("Telegram alert sent successfully.")
            else:
                print(f"Failed to send Telegram alert: {r.status_code} - {r.text}")
        except Exception as e:
            print("Error sending Telegram alert:", e)
    else:
        print("Telegram bot credentials not found. Skipping alert.")

def check_key_validity(api_key):
    if not api_key:
        return False
    url = "https://api.babel.town/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "glm-5.2",
        "messages": [{"role": "user", "content": "ping"}],
        "max_tokens": 1
    }
    try:
        r = requests.post(url, headers=headers, json=payload, timeout=5)
        return r.status_code == 200
    except Exception:
        return False

def fetch_api_key():
    headers = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://glm.babel.town/",
        "Origin": "https://glm.babel.town"
    }
    
    print(f"[{datetime.now()}] Fetching GLM-5.2 key from Babel...")
    try:
        res = requests.get(GET_KEY_URL, headers=headers, timeout=15)
        if res.status_code == 200:
            data = res.json()
            if data.get("success") and data.get("api_key"):
                print(f"Successfully retrieved key: {data['api_key'][:15]}...")
                return data["api_key"]
            else:
                print("API returned success=false:", data.get("message"))
        else:
            print(f"Unexpected status code {res.status_code}: {res.text[:200]}")
    except Exception as e:
        print("Error fetching key:", e)
        
    return None

def get_current_key():
    return get_env_variable("ZAI_API_KEY")

def encrypt_key_via_omniroute(api_key):
    try:
        cmd = ["docker", "exec", "omniroute", "node", ENCRYPTOR_PATH, api_key]
        out = subprocess.check_output(cmd).decode().strip()
        if out.startswith("RESULT:"):
            enc_key = out.replace("RESULT:", "").strip()
            print("Successfully encrypted key via OmniRoute container.")
            return enc_key
        else:
            print("Encryption error from container:", out)
    except Exception as e:
        print("Failed to encrypt key via container:", e)
    return None

def update_omniroute_db(plain_key, encrypted_key):
    if not os.path.exists(DB_PATH):
        print(f"Error: OmniRoute SQLite database not found at {DB_PATH}")
        return
        
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    now_str = datetime.now().isoformat()
    
    try:
        cursor.execute("""
            SELECT id, provider FROM provider_connections 
            WHERE provider LIKE 'openai-compatible-chat-%';
        """)
        other_conns = cursor.fetchall()
        updated_count = 0
        for c_id, c_prov in other_conns:
            cursor.execute("SELECT name FROM provider_nodes WHERE id = ?;", (c_prov,))
            node_row = cursor.fetchone()
            if node_row and node_row[0] == "Glm 5.2":
                print(f"Updating user's UI connection '{c_id}' (provider '{c_prov}') with fresh key...")
                cursor.execute("""
                    UPDATE provider_connections
                    SET api_key = ?, is_active = 1, updated_at = ?
                    WHERE id = ?;
                """, (encrypted_key, now_str, c_id))
                updated_count += 1
            
        conn.commit()
        print(f"OmniRoute database updated successfully ({updated_count} connections updated).")
        print("Restarting OmniRoute Docker container...")
        os.system("docker restart omniroute")
        print("Restart command issued.")
        
    except Exception as e:
        print("Database transaction error:", e)
        conn.rollback()
    finally:
        conn.close()

def update_hermes_config_and_env(api_key):
    # 1. Update config.yaml
    if os.path.exists(CONFIG_PATH):
        try:
            print("Updating config.yaml with new zai/z-ai keys...")
            with open(CONFIG_PATH, 'r', encoding='utf-8') as f:
                cfg = yaml.safe_load(f) or {}
                
            providers = cfg.setdefault('providers', {})
            for key_name in ['zai', 'z-ai']:
                prov = providers.setdefault(key_name, {})
                prov['base_url'] = 'https://api.babel.town/v1'
                prov['api_key'] = api_key
                
            with open(CONFIG_PATH, 'w', encoding='utf-8') as f:
                yaml.dump(cfg, f, default_flow_style=False, sort_keys=False, allow_unicode=True)
            print("config.yaml updated successfully.")
        except Exception as e:
            print("Error updating config.yaml:", e)
            
    # 2. Update .env file
    if os.path.exists(ENV_PATH):
        try:
            print("Updating .env file with ZAI env keys...")
            with open(ENV_PATH, 'r', encoding='utf-8') as f:
                env_content = f.read()
            lines = env_content.splitlines()
            
            keys_to_update = {
                'ZAI_API_KEY': api_key,
                'Z_AI_API_KEY': api_key,
                'GLM_API_KEY': api_key,
                'GLM_BASE_URL': 'https://api.babel.town/v1'
            }
            
            for key, val in keys_to_update.items():
                has_key = False
                for i, line in enumerate(lines):
                    if line.strip().startswith(f"{key}="):
                        lines[i] = f'{key}="{val}"'
                        has_key = True
                        break
                if not has_key:
                    lines.append(f'{key}="{val}"')
                    
            with open(ENV_PATH, 'w', encoding='utf-8') as f:
                f.write('\n'.join(lines) + '\n')
            print(".env file updated successfully.")
        except Exception as e:
            print("Error updating .env file:", e)
            
    print("Restarting Hermes gateway and dashboard services...")
    cmd = "su - ubuntu -c 'XDG_RUNTIME_DIR=/run/user/1001 DBUS_SESSION_BUS_ADDRESS=unix:path=/run/user/1001/bus systemctl --user restart hermes-gateway.service hermes-dashboard-new.service'"
    os.system(cmd)
    print("Hermes services restarted.")

if __name__ == "__main__":
    current_key = get_current_key()
    if check_key_validity(current_key):
        print("Current key is still active and working. Skipping renewal.")
        sys.exit(0)
        
    print("Current key is invalid or expired. Attempting to fetch a new one...")
    key = fetch_api_key()
    if key:
        encrypted_key = encrypt_key_via_omniroute(key)
        if encrypted_key:
            update_omniroute_db(key, encrypted_key)
            update_hermes_config_and_env(key)
            
            # Send Telegram notification
            alert_msg = f"🔔 [Hermes Key Renew] GLM-5.2 API key successfully updated to: {key[:10]}... (expires in 1 hour)"
            send_telegram_alert(alert_msg)
        else:
            print("Failed to encrypt key. Aborting DB update.")
            sys.exit(1)
    else:
        sys.exit(1)
