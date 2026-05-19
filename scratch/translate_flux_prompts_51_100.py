import json
import os
import re

def clean_and_translate_prompts():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    input_path = os.path.join(base_path, "ai_context/nft_master_prompts_51_100.json")
    output_path = os.path.join(base_path, "ai_context/nft_flux_prompts_51_100.json")
    
    print("🚀 Loading Batch 51-100 master prompts...")
    with open(input_path, 'r', encoding='utf-8') as f:
        master_prompts = json.load(f)
        
    flux_prompts = []
    
    for item in master_prompts:
        p_id = item["id"]
        nft_name = item["name"]
        real_name = item["real_name"]
        raw_prompt = item["prompt"]
        
        # 1. Extract physical traits block from Subject:
        # Match 'Subject: [Real Name]. [Physical Traits block] ::3'
        subject_match = re.search(r"Subject:\s*(?:[^.]+)\.\s*([^:]+?)\s*(?:::\d+|\s|$)", raw_prompt)
        if subject_match:
            physical_traits = subject_match.group(1).strip()
        else:
            physical_traits = "Short dark hair, clean shaven, athletic build."
            
        # Parse hair and beard details dynamically for the custom [FACE & PHYSIQUE DETAIL]
        # Look for "hair" and "beard" or "clean shaven"
        hair_desc = "short dark textured hair"
        beard_desc = "clean shaven"
        
        # Extract hair description
        hair_match = re.search(r"([^,.]+hair[^,.]*)", physical_traits, re.IGNORECASE)
        if hair_match:
            hair_desc = hair_match.group(1).strip().lower()
            
        # Extract beard or clean shaven description
        beard_match = re.search(r"([^,.]*(?:beard|shaven|stubble)[^,.]*)", physical_traits, re.IGNORECASE)
        if beard_match:
            beard_desc = beard_match.group(1).strip().lower()
            
        # 2. Build the pristine, high-likeness V5.1 FLUX prompt
        flux_prompt = (
            f"A professional high-speed action photograph of {real_name}. He is standing in an epic football pose. "
            f"[FACE & PHYSIQUE DETAIL]: He must have an highly accurate likeness to {real_name}. His face is lean, sharp, and chiseled "
            f"with a defined jawline, sharp cheekbones, and zero puffiness, zero bloat, and zero roundness. He has {hair_desc} and is {beard_desc}. "
            f"His body shape is slender, lean, tall, and highly athletic, avoiding any bulky, stocky, or wide proportions. "
            f"His facial expression is intense but focused, keeping the mouth closed with balanced, symmetrical facial features. "
            f"He is wearing a completely blank, plain solid pitch-black athletic jersey. The chest of the jersey is smooth, solid, "
            f"and completely plain pitch-black, showing only pure solid clean black fabric with zero logos, zero graphics, and zero markings. "
            f"Captured in a studio shot on a seamless, flat solid white background. Technical specs: 85mm lens, f/2.8, extreme realism, "
            f"highly detailed face, professional photography, professionally isolated, 8k resolution. "
            f"An ultra-wide, ground-level full-body action photograph showing {real_name}'s entire body from head to toe. "
            f"The camera is strictly at eye-level, front-facing, horizontal, and pulled far back, capturing a wide field of view. "
            f"He is wearing solid black soccer cleats (soccer shoes) and athletic socks. Both of his legs, shins, socks, and soccer shoes "
            f"are completely visible standing on the white floor, with a wide, clear border of empty white floor visible below his shoes. "
            f"Absolutely no cropping or cutting off of the feet, shoes, or legs at the bottom of the frame."
        )
        
        # Build search query for Grok's Web Search Protocol
        search_query = f"{real_name} physical appearance face jaw hair style body build athlete profile"
        
        flux_prompts.append({
            "id": p_id,
            "name": nft_name,
            "real_name": real_name,
            "search_query": search_query,
            "flux_prompt": flux_prompt
        })
        
    print(f"💾 Saving {len(flux_prompts)} translated prompts to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(flux_prompts, f, indent=4, ensure_ascii=False)
        
    print("✨ Prompt translation and V5.1 alignment complete!")

if __name__ == "__main__":
    clean_and_translate_prompts()
