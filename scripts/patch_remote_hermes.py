import os
import sys

def patch():
    path = "/data/ubuntu/.hermes/hermes-agent/hermes_cli/models.py"
    if not os.path.exists(path):
        print(f"Error: {path} not found")
        sys.exit(1)
        
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
        
    patch_marker = "# -- Custom patch for local omniroute provider model listing --"
    
    if patch_marker in content:
        # Revert models.py to clean state using git checkout to be 100% safe
        print("Omniroute patch found in models.py. Restoring file to clean git state...")
        os.system("cd /data/ubuntu/.hermes/hermes-agent && git checkout hermes_cli/models.py")
    else:
        print("models.py is clean and unpatched (managed natively via provider plugin)")

if __name__ == "__main__":
    patch()
