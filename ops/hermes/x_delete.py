#!/usr/bin/env python3
"""
X Tweet Deleter for GoalChain (X API v2 - OAuth 1.0a)
Uso: python3 x_delete.py <tweet_id_1> <tweet_id_2> ...
"""

import os
import sys
import json
import time
import hashlib
import hmac
import base64
import urllib.parse
import requests

def load_credentials():
    creds = {
        "X_API_KEY": os.getenv("X_API_KEY"),
        "X_API_KEY_SECRET": os.getenv("X_API_KEY_SECRET"),
        "X_ACCESS_TOKEN": os.getenv("X_ACCESS_TOKEN"),
        "X_ACCESS_TOKEN_SECRET": os.getenv("X_ACCESS_TOKEN_SECRET"),
    }

    if not all(creds.values()):
        cred_file = os.path.expanduser("~/.hermes/credentials/x-scout.env")
        if os.path.exists(cred_file):
            with open(cred_file) as f:
                for line in f:
                    if line.strip() and not line.startswith("#"):
                        if "=" in line:
                            key, value = line.strip().split("=", 1)
                            key = key.replace("export ", "").strip()
                            value = value.strip('"').strip("'")
                            if key in creds and not creds.get(key):
                                creds[key] = value
            for k, v in creds.items():
                if v:
                    os.environ[k] = v
    return creds

creds = load_credentials()
X_API_KEY = creds.get("X_API_KEY")
X_API_KEY_SECRET = creds.get("X_API_KEY_SECRET")
X_ACCESS_TOKEN = creds.get("X_ACCESS_TOKEN")
X_ACCESS_TOKEN_SECRET = creds.get("X_ACCESS_TOKEN_SECRET")

def generate_oauth1_header(method, url, params, consumer_key, consumer_secret, access_token, access_token_secret):
    oauth_params = {
        'oauth_consumer_key': consumer_key,
        'oauth_nonce': hashlib.md5(str(time.time()).encode()).hexdigest(),
        'oauth_signature_method': 'HMAC-SHA1',
        'oauth_timestamp': str(int(time.time())),
        'oauth_token': access_token,
        'oauth_version': '1.0'
    }

    all_params = {**oauth_params, **params}
    sorted_params = sorted(all_params.items())

    param_string = '&'.join([f"{k}={urllib.parse.quote(str(v), safe='')}" for k, v in sorted_params])
    base_string = f"{method.upper()}&{urllib.parse.quote(url, safe='')}&{urllib.parse.quote(param_string, safe='')}"
    signing_key = f"{urllib.parse.quote(consumer_secret, safe='')}&{urllib.parse.quote(access_token_secret, safe='')}"

    signature = base64.b64encode(
        hmac.new(signing_key.encode(), base_string.encode(), hashlib.sha1).digest()
    ).decode()

    oauth_params['oauth_signature'] = signature
    auth_header = 'OAuth ' + ', '.join([f'{k}="{urllib.parse.quote(str(v), safe="")}"' for k, v in oauth_params.items()])
    return auth_header

def delete_tweet(tweet_id: str):
    if not all([X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET]):
        raise ValueError("Faltan credenciales. Define X_API_KEY, X_API_KEY_SECRET, X_ACCESS_TOKEN y X_ACCESS_TOKEN_SECRET")

    url = f"https://api.twitter.com/2/tweets/{tweet_id}"
    auth_header = generate_oauth1_header(
        "DELETE", url, {}, 
        X_API_KEY, X_API_KEY_SECRET, 
        X_ACCESS_TOKEN, X_ACCESS_TOKEN_SECRET
    )

    headers = {
        "Authorization": auth_header,
        "Content-Type": "application/json"
    }

    response = requests.delete(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    else:
        raise Exception(f"Error {response.status_code}: {response.text}")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print('Uso: python3 x_delete.py <tweet_id_1> [tweet_id_2] ...')
        sys.exit(1)

    tweet_ids = sys.argv[1:]
    for tid in tweet_ids:
        print(f"Borrando Tweet {tid}...")
        try:
            result = delete_tweet(tid)
            print(f"✅ Tweet {tid} borrado correctamente!")
            print(json.dumps(result, indent=2))
        except Exception as e:
            print(f"❌ Error al borrar Tweet {tid}: {e}")
