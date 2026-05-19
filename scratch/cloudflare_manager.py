import requests
import json
import sys

# Cloudflare Credentials
ACCOUNT_ID = "ef46a2b8d3d46b785a0ecc30c4b994cf"
ZONE_ID = "152a1124f5fb2d3568129ff4df774e75"
API_TOKEN = "cfat_e8UVuFLV2MoZ7IVRuvv4NrDzClmTpWG0yfVUNaLB0742ac87"

HEADERS = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}

def verify_token():
    """Verify that the API token has correct permissions and is active."""
    url = f"https://api.twitter.com/2/users/me" # Dummy API template check, but we call the cloudflare verification url instead
    url = "https://api.cloudflare.com/client/v4/user/tokens/verify"
    
    try:
        response = requests.get(url, headers=HEADERS)
        if response.status_code == 200:
            res_json = response.json()
            if res_json.get("success"):
                print("✅ Cloudflare API Token verified successfully!")
                print(f"   Status: {res_json.get('result', {}).get('status')}")
                return True
            else:
                print(f"❌ Verification failed: {res_json.get('errors')}")
        else:
            print(f"❌ Verification failed (HTTP {response.status_code}): {response.text}")
    except Exception as e:
        print(f"❌ Connection error during verification: {e}")
    return False

def purge_all_cache():
    """Purge 100% of the Cloudflare Edge Cache for goalchain.fun."""
    url = f"https://api.cloudflare.com/client/v4/zones/{ZONE_ID}/purge_cache"
    payload = {
        "purge_everything": True
    }
    
    try:
        response = requests.post(url, headers=HEADERS, json=payload)
        res_json = response.json()
        if response.status_code == 200 and res_json.get("success"):
            print("🚀 [Cloudflare] Cache PURGED successfully! All visitors will now see the latest version in real-time.")
            return True
        else:
            print(f"❌ [Cloudflare] Failed to purge cache: {res_json.get('errors')}")
    except Exception as e:
        print(f"❌ [Cloudflare] Connection error during cache purge: {e}")
    return False

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "verify":
        verify_token()
    else:
        print("🔄 Initiating Cloudflare Cache Purging for goalchain.fun...")
        purge_all_cache()
