import sys

def main():
    filepath = "docs/index.html"
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # --- 1. MOVE #SOCIAL SECTION ---
    start_marker = '    <section id="social" class="section">'
    end_marker = '    <!-- ROADMAP & TOKENOMICS -->'
    
    social_idx = content.find(start_marker)
    end_idx = content.find(end_marker, social_idx)
    
    if social_idx != -1 and end_idx != -1:
        # Extract block
        social_block = content[social_idx:end_idx]
        
        # Remove from old position
        content = content[:social_idx] + content[end_idx:]
        
        # Insert after pitch section
        pitch_end_marker = '    <!-- TOKENOMICS SECTION -->'
        pitch_end_idx = content.find(pitch_end_marker)
        
        if pitch_end_idx != -1:
            content = content[:pitch_end_idx] + social_block + content[pitch_end_idx:]
            print("✅ Section #social moved successfully.")
        else:
            print("❌ Could not find pitch_end_marker")
    else:
        print("❌ Could not find social block boundaries")

    # --- 2. UPDATE TOKENOMICS ---
    old_tokenomics = """                    <!-- Distribution Chart Summary -->
                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <h4 style="text-align: center; margin-bottom: 20px; font-size: 0.8rem; color: var(--text-dim);">DISTRIBUCIÓN INICIAL DE $GCH</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div>
                                <div style="font-size: 0.7rem; color: var(--primary);">AIRDROP: 40%</div>
                                <div style="height: 4px; background: var(--primary); border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--secondary);">ECOSYSTEM: 30%</div>
                                <div style="height: 4px; background: var(--secondary); border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: var(--gold);">LIQUIDITY: 15%</div>
                                <div style="height: 4px; background: var(--gold); border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: #fff;">DEV (NFT #0): 15%</div>
                                <div style="height: 4px; background: #fff; border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                        </div>
                    </div>"""

    new_tokenomics = """                    <!-- Distribution Chart Summary -->
                    <div style="margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(255,255,255,0.05);">
                        <h4 style="text-align: center; margin-bottom: 20px; font-size: 0.8rem; color: var(--text-dim);">DISTRIBUCIÓN INICIAL DE $GCH</h4>
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
                            <div>
                                <div style="font-size: 0.65rem; font-weight: 800; color: var(--primary);">MARKETING & ZEALY: 15%</div>
                                <div style="height: 4px; background: var(--primary); border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.65rem; font-weight: 800; color: #14f195;">PLAY-TO-AIRDROP: 30%</div>
                                <div style="height: 4px; background: #14f195; border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.65rem; font-weight: 800; color: var(--secondary);">ECOSYSTEM & JACKPOT: 30%</div>
                                <div style="height: 4px; background: var(--secondary); border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.65rem; font-weight: 800; color: var(--gold);">LIQUIDITY (DEX): 15%</div>
                                <div style="height: 4px; background: var(--gold); border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                            <div>
                                <div style="font-size: 0.65rem; font-weight: 800; color: #fff;">CORE & DAO: 10%</div>
                                <div style="height: 4px; background: #fff; border-radius: 2px; margin-top: 5px;"></div>
                            </div>
                        </div>
                    </div>"""
    
    if old_tokenomics in content:
        content = content.replace(old_tokenomics, new_tokenomics)
        print("✅ Tokenomics updated successfully.")
    else:
        print("❌ Could not find old tokenomics block")

    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)

if __name__ == "__main__":
    main()
