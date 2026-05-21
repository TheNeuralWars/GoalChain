import os
from PIL import Image

dirs_to_convert = [
    "/Users/NicoPez/GoalChain/docs/assets/img/nfts",
    "/Users/NicoPez/GoalChain/docs/assets/img/cards"
]

print("🚀 Starting PNG to WebP Conversion...")

total_converted = 0
total_saved_bytes = 0

for target_dir in dirs_to_convert:
    if not os.path.exists(target_dir):
        print(f"⚠️ Directory {target_dir} does not exist, skipping.")
        continue
        
    print(f"\n📂 Scanning directory: {target_dir}")
    files = os.listdir(target_dir)
    png_files = [f for f in files if f.lower().endswith('.png')]
    
    print(f"🔍 Found {len(png_files)} PNG files to convert.")
    
    for filename in png_files:
        png_path = os.path.join(target_dir, filename)
        webp_filename = filename[:-4] + ".webp"
        webp_path = os.path.join(target_dir, webp_filename)
        
        try:
            original_size = os.path.getsize(png_path)
            
            # Convert using PIL
            with Image.open(png_path) as img:
                img.save(webp_path, "WEBP", quality=85)
                
            new_size = os.path.getsize(webp_path)
            saved_bytes = original_size - new_size
            total_saved_bytes += saved_bytes
            total_converted += 1
            
            # Delete original PNG
            os.remove(png_path)
            
            print(f"✅ Converted: {filename} -> {webp_filename} ({original_size/1024:.1f}KB -> {new_size/1024:.1f}KB, Saved: {saved_bytes/1024:.1f}KB)")
            
        except Exception as e:
            print(f"❌ Failed to convert {filename}: {e}")

print(f"\n🎉 Conversion completed successfully!")
print(f"✨ Total converted files: {total_converted}")
print(f"💾 Total space saved: {total_saved_bytes / (1024 * 1024):.2f} MB")
