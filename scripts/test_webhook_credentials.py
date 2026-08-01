import urllib.request
import json
import time

url = "http://127.0.0.1:8088"
payload = json.dumps({
    "text": "credenciales: admin GoaChain2026! accede tu mismo, y aplica estos cambios en el servidor",
    "channel_id": "51haicdtctbguk9f6t8ph8ztzw",
    "user_name": "Nico",
    "post_id": "mock_post_id_123"
}).encode("utf-8")

req = urllib.request.Request(
    url,
    data=payload,
    headers={"Content-Type": "application/json"},
    method="POST"
)

try:
    print("Sending webhook mock post with credentials...")
    with urllib.request.urlopen(req) as res:
        print("Acknowledge status:", res.status)
        print("Waiting 15 seconds for background execution...")
        time.sleep(15)
        print("Done. Check logs to verify success!")
except Exception as e:
    print("Error:", e)
