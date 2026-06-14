#!/usr/bin/env python3
import shutil
from pathlib import Path

def main():
    batches_dir = Path("/data/apps/GoalChain/grok_batches")
    faces_dir = Path("/home/ubuntu/hermes/original_faces")
    faces_dir.mkdir(parents=True, exist_ok=True)
    
    count = 0
    for batch_dir in sorted(batches_dir.glob("batch_*")):
        for p_path in batch_dir.glob("*_portrait.jpg"):
            try:
                pid = int(p_path.name.split("_")[0])
                dest_path = faces_dir / f"player_{pid}.jpg"
                shutil.copy2(p_path, dest_path)
                count += 1
            except Exception as e:
                print(f"Error copying {p_path}: {e}")
                
    print(f"Successfully copied {count} portraits to original_faces")

if __name__ == "__main__":
    main()
