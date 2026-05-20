import os
import sys
import time
import subprocess
import random

def main():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    downloader_script = os.path.join(base_path, "scratch/download_batch_images.py")
    
    print("🌟 Starting Download Master Script for all 19 Batches 🌟")
    print("This script will run each batch sequentially and sleep between batches to avoid rate limits.")
    print("Existing files will be skipped automatically, making this script safe to run multiple times.")
    
    # We will loop from 1 to 19
    for batch_num in range(1, 20):
        print(f"\n========================================")
        print(f"🎬 STARTING BATCH {batch_num:02d} / 19")
        print(f"========================================")
        
        # Run download_batch_images.py batch_num
        cmd = [sys.executable, "-u", downloader_script, str(batch_num)]
        
        try:
            # We run it and let stdout/stderr stream directly
            result = subprocess.run(cmd, check=True)
            print(f"✅ Batch {batch_num:02d} completed execution.")
        except subprocess.CalledProcessError as e:
            print(f"❌ Error occurred during execution of Batch {batch_num:02d}: {e}")
            print("Moving on to the next batch...")
            
        if batch_num < 19:
            # Sleep between batches to allow connection/cool down
            sleep_time = random.uniform(45.0, 90.0)
            print(f"\n⏳ Cool-down sleep of {sleep_time:.1f} seconds before next batch...")
            time.sleep(sleep_time)
            
    print("\n🎉 ALL BATCHES PROCESSED 🎉")
    print("Verify your scratch/grok_batches/ folders to see the results!")

if __name__ == "__main__":
    main()
