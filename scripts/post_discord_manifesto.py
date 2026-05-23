import os
import requests
import json

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

    # Channel ID for #📢┃announcements
    channel_id = "1503668120521408513"
    url = f"https://discord.com/api/v10/channels/{channel_id}/messages"

    headers = {
        "Authorization": f"Bot {token}",
        "Content-Type": "application/json"
    }

    message_content = (
        "⚽ **GOALCHAIN: THE LIVING PROTOCOL**\n"
        "*Dismantling Predatory Betting. Building the Player-First Economy.*\n\n"
        "Traditional sports betting is an extractive, predatory engine. It is designed to induce addiction, "
        "drain personal wealth, and enrich a shadow network of bookmakers. The house always wins.\n\n"
        "**We are killing the house.**\n\n"
        "GoalChain has officially evolved from a founder-led project into **The Living Protocol**—a self-governing "
        "organism powered by Collective Intelligence and ruled by transparency.\n\n"
        "Our code is fully open-source, our data oracle is linked directly to GitHub, and overseeing it all is "
        "a progressive **AI CEO Agent** layer.\n\n"
        "⚖️ **The Player-First Economic Paradigm**\n"
        "We have redesigned our tokenomics to maximize player rewards and direct value back to the community:\n\n"
        "* **The 1% Founder Cap:** On-chain founder fees are strictly hard-capped at **1% maximum** (`MAX_FEE_BPS = 100`). "
        "The era of massive founder extraction is over.\n"
        "* **The 10% Unified Builder Fund:** Consolidating developer, API, infrastructure, and marketing costs. "
        "10% of generated value flows directly here to reward active contributors.\n"
        "* **89% Community Treasury & 99% Payouts:** By capping the protocol fee at 1%, our parimutuel betting pools "
        "return **99% of all wagers** directly to the winning players.\n\n"
        "🏟️ **Current Pitch Status**\n"
        "The landing page at https://goalchain.fun is fully updated! The layout overlap between the Live Oracle "
        "Transmission and the World Cup fixtures is resolved, and the raw white space between background panels has been fixed.\n\n"
        "*Build the code. Play the odds. Capture the yield.* 🚀⚽"
    )

    payload = {
        "content": message_content
    }

    res = requests.post(url, headers=headers, json=payload)
    if res.status_code in [200, 201]:
        print("✅ Announcement posted to Discord channel #📢┃announcements successfully!")
        print(f"🔗 Message ID: {res.json()['id']}")
    else:
        print(f"❌ Error posting to Discord: {res.status_code} - {res.text}")

if __name__ == "__main__":
    main()
