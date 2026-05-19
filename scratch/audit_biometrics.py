import json
import os

def audit_batch_1():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    json_path = os.path.join(base_path, "docs/assets/data/players.json")
    out_path = os.path.join(base_path, "scratch/biometric_audit_1_50.md")
    
    with open(json_path, 'r', encoding='utf-8') as f:
        players = json.load(f)
        
    batch = players[0:50] # ID 1 to 50
    
    with open(out_path, 'w', encoding='utf-8') as f:
        f.write("# 🕵️‍♂️ Auditoría Biométrica: Batch 1 (IDs 1-50)\n\n")
        for p in batch:
            f.write(f"### ID {p['id']} - {p.get('real_name', p['name'])}\n")
            f.write(f"- **País**: {p.get('country', 'N/A')}\n")
            f.write(f"- **Descripción Física Base**: {p.get('physical', {}).get('t', 'MISSING')}\n")
            f.write("---\n")
            
    print(f"Auditoría exportada a {out_path}")

if __name__ == "__main__":
    audit_batch_1()
