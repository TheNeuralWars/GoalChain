import os
import requests

FAL_KEY = os.getenv("FAL_KEY")
headers = {"Authorization": f"Key {FAL_KEY}", "Content-Type": "application/json"}
data = {"prompt": "test image", "image_size": "1:1", "num_inference_steps": 4, "enable_safety_checker": True, "sync_mode": True}
resp = requests.post("https://queue.fal.run/fal-ai/flux/dev", headers=headers, json=data, timeout=60)
print(resp.status_code)
print(resp.text[:500])
