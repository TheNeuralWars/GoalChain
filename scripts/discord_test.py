import os
import requests

def load_env():
    env_vars = {}
    env_path = os.path.join(os.path.dirname(__file__), '..', '.env')
    if os.path.exists(env_path):
        with open(env_path, 'r') as f:
            for line in f:
                line = line.strip()
                if not line or line.startswith('#'):
                    continue
                if '=' in line:
                    key, val = line.split('=', 1)
                    env_vars[key.strip()] = val.strip()
    return env_vars

def main():
    env = load_env()
    token = env.get("DISCORD_TOKEN")
    if not token:
        print("❌ Error: Missing DISCORD_TOKEN in .env")
        return

    headers = {
        "Authorization": f"Bot {token}",
        "Content-Type": "application/json"
    }

    # 1. Get guilds
    guilds_url = "https://discord.com/api/v10/users/@me/guilds"
    res = requests.get(guilds_url, headers=headers)
    if res.status_code != 200:
        print(f"❌ Error fetching guilds: {res.status_code} - {res.text}")
        return

    guilds = res.json()
    print(f"Bot is in {len(guilds)} server(s):")
    for g in guilds:
        print(f" - {g['name']} (ID: {g['id']})")
        
        # Get channels for this guild
        channels_url = f"https://discord.com/api/v10/guilds/{g['id']}/channels"
        c_res = requests.get(channels_url, headers=headers)
        if c_res.status_code == 200:
            channels = c_res.json()
            print("   Channels:")
            for c in channels:
                # Type 0 is text channel, type 5 is announcement/news channel
                if c.get("type") in [0, 5]:
                    print(f"     * #{c['name']} (ID: {c['id']}, Type: {c['type']})")
        else:
            print(f"   ❌ Error fetching channels: {c_res.status_code} - {c_res.text}")

if __name__ == "__main__":
    main()
