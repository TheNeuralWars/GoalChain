#!/usr/bin/env python3
"""
Enhanced Physical Details Reference for GoalChain Players
Contains detailed biometric data for generating hyper-realistic prompts.
"""

# Enhanced physical details for players (structured data for prompt generation)
# Format: player_id -> {enhanced fields}
ENHANCED_PHYSICAL_DATA = {
    # ============ ARGENTINA ============
    1: {  # Lionel Satoshi (Messi)
        "hair_color": "dark brown",
        "hairstyle": "short textured crop with subtle side fade",
        "facial_hair": "thick well-groomed full beard with gray streaks at chin",
        "face_structure": "round face with high cheekbones, soft jawline, slight overbite",
        "skin_tone": "light olive with warm undertones",
        "eye_color": "dark brown",
        "tattoos": ["left calf: thiago's handprint", "left arm: jesus portrait", "right arm: lotus flower", "back: winged design"],
        "distinctive_features": ["compact 1.70m frame", "low center of gravity", "intense competitive gaze", "slight gap in front teeth"],
        "build_type": "lean muscular, short legs, powerful thighs"
    },
    2: {  # Dibu De-Fi (Martínez)
        "hair_color": "dark brown",
        "hairstyle": "short with creative side graphics/stars shaved into temples",
        "facial_hair": "clean shaven",
        "face_structure": "square jaw, broad forehead, prominent nose bridge",
        "skin_tone": "fair with cool undertones",
        "eye_color": "light brown",
        "tattoos": ["left leg: world cup trophy with date", "right arm: family names", "chest: lion"],
        "distinctive_features": ["towering 1.95m frame", "long limbs", "expressive animated face", "psychologicalmind games stare"],
        "build_type": "tall commanding goalkeeper build, broad shoulders"
    },
    3: {  # Julian Bull-varez (Álvarez)
        "hair_color": "dark brown",
        "hairstyle": "classic fade with textured top, slightly longer fringe",
        "facial_hair": "clean shaven",
        "face_structure": "oval face, delicate features, straight nose",
        "skin_tone": "fair with pink undertones",
        "eye_color": "dark brown",
        "tattoos": ["minimal - small wrist tattoo"],
        "distinctive_features": ["youthful baby face", "compact 1.70m frame", "perpetual focus expression", "quick darting eyes"],
        "build_type": "compact strong athletic, low center of gravity"
    },
    4: {  # Enzo Ether (Fernández)
        "hair_color": "dark brown",
        "hairstyle": "mid-skin burst fade with razor-sharp lineup, textured fringe",
        "facial_hair": "clean shaven",
        "face_structure": "angular jawline, high cheekbones, straight nose",
        "skin_tone": "fair-olive, tans easily",
        "eye_color": "dark brown",
        "tattoos": ["prominent lion on right forearm", "family script on ribs", "left arm sleeve in progress", "chest: date"],
        "distinctive_features": ["intense penetrating gaze", "sharp defined jawline", "midfield engine posture"],
        "build_type": "strong midfield build, 1.78m, balanced musculature"
    },
    5: {  # Rodrigo De-Pool (De Paul)
        "hair_color": "dark brown",
        "hairstyle": "short textured top swept back, clean fade sides",
        "facial_hair": "light stubble or clean shaven",
        "face_structure": "diamond face shape, strong brow ridge, aquiline nose",
        "skin_tone": "fair-olive",
        "eye_color": "dark brown",
        "tattoos": ["extensive: full left arm sleeve", "right forearm: script", "chest piece", "multiple small pieces"],
        "distinctive_features": ["passionate animated expressions", "elegant but powerful frame", "constant talking on pitch"],
        "build_type": "elegant strong midfield build, 1.80m lean"
    },
    6: {  # Angel Di Merkle (Di María)
        "hair_color": "dark brown",
        "hairstyle": "classic side part, medium length, swept to side",
        "facial_hair": "clean shaven",
        "face_structure": "long narrow face, high forehead, thin nose",
        "skin_tone": "olive with warm undertones",
        "eye_color": "dark brown",
        "tattoos": ["left arm: family", "right arm: religious", "subtle pieces"],
        "distinctive_features": ["el fideo - extremely lean 1.78m/75kg", "exceptional agility", "experienced leadership presence"],
        "build_type": "exceptionally lean and agile forward build"
    },
    7: {  # Alexis Mac-Chain (Mac Allister)
        "hair_color": "dark brown",
        "hairstyle": "very short buzz cut, almost shaved",
        "facial_hair": "distinctive reddish-brown well-kept full beard",
        "face_structure": "round friendly face, soft jawline, button nose",
        "skin_tone": "fair with freckles",
        "eye_color": "light brown/hazel",
        "tattoos": ["minimal - small wrist"],
        "distinctive_features": ["ginger beard vs dark hair contrast", "intelligent calm expression", "technical posture"],
        "build_type": "technical central midfield build, 1.76m compact"
    },
    8: {  # Cuti Crypt (Romero)
        "hair_color": "dark brown",
        "hairstyle": "short with clean fade, textured top",
        "facial_hair": "short well-groomed beard",
        "face_structure": "square jaw, heavy brow, intimidating resting face",
        "skin_tone": "fair-olive",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["intimidating glare", "aggressive defensive posture", "strong robust 1.85m build"],
        "build_type": "strong robust athletic, physical powerhouse"
    },
    9: {  # Lisandro Butcher-DAO (Martínez)
        "hair_color": "dark brown",
        "hairstyle": "shaggier loose medium length, messy texture",
        "facial_hair": "clean shaven",
        "face_structure": "heart-shaped face, wide eyes, determined jaw",
        "skin_tone": "fair",
        "eye_color": "dark brown",
        "tattoos": ["left arm: family names", "chest: small"],
        "distinctive_features": ["warrior aggressive expression", "compact 1.75m but imposes presence", "wears headband often"],
        "build_type": "compact strong centre-back build"
    },
    10: {  # Nahuel Mo-Wallet (Molina)
        "hair_color": "dark brown",
        "hairstyle": "clean professional fade, short",
        "facial_hair": "clean shaven",
        "face_structure": "oblong face, straight nose, pleasant features",
        "skin_tone": "fair",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["focused professional look", "agile right-back posture", "constant overlapping runs"],
        "build_type": "agile fast right-back build, 1.75m lean"
    },
    11: {  # Nico Taglia-Token (Tagliafico)
        "hair_color": "dark brown",
        "hairstyle": "short neat, side part",
        "facial_hair": "clean shaven",
        "face_structure": "round face, soft features, kind eyes",
        "skin_tone": "fair",
        "eye_color": "dark brown",
        "tattoos": ["left arm: small"],
        "distinctive_features": ["professional no-nonsense look", "versatile left-back energy", "1.71m compact"],
        "build_type": "versatile strong left-back build"
    },
    # ============ FRANCIA ============
    12: {  # Kylian M-Bypass-pé (Mbappé)
        "hair_color": "black",
        "hairstyle": "buzz cut, uniformly short",
        "facial_hair": "clean shaven",
        "face_structure": "narrow long face, prominent nose, wide smile",
        "skin_tone": "deep dark brown",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["explosive speed posture", "wide infectious smile", "lean 1.78m sprinter build", "hands on hips celebration"],
        "build_type": "lean athletic speed-oriented build"
    },
    13: {  # Antoine G-ZkSync (Griezmann)
        "hair_color": "blonde / light brown",
        "hairstyle": "varies: short textured crop or creative braids with taper",
        "facial_hair": "light well-kept beard/stubble",
        "face_structure": "angular face, sharp jawline, high cheekbones",
        "skin_tone": "fair with freckles",
        "eye_color": "blue-green",
        "tattoos": ["right arm: sleeve", "left arm: pieces", "chest", "back"],
        "distinctive_features": ["charismatic expressive face", "agile forward movement", "fortnite dance celebrations"],
        "build_type": "agile forward build, 1.76m balanced"
    },
    14: {  # Ousmane De-Shard (Dembélé)
        "hair_color": "black",
        "hairstyle": "short with clean side fade, textured top",
        "facial_hair": "clean shaven",
        "face_structure": "round youthful face, wide nose, bright smile",
        "skin_tone": "deep dark brown",
        "eye_color": "dark brown",
        "tattoos": ["minimal"],
        "distinctive_features": ["elastic dynamic movement", "two-footed unpredictability", "lean 1.78m/67kg", "infectious energy"],
        "build_type": "lean elastic athletic build"
    },
    15: {  # Eduardo Cama-Logic (Camavinga)
        "hair_color": "black",
        "hairstyle": "short dreadlocks, neat",
        "facial_hair": "clean shaven",
        "face_structure": "oval face, soft features, gentle eyes",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["youthful intense focus", "versatile box-to-box engine", "1.82m tall for midfielder"],
        "build_type": "versatile strong athletic build"
    },
    16: {  # Theo Shiller (Hernández)
        "hair_color": "bleached blonde (often with creative designs like smiley faces)",
        "hairstyle": "short with creative dyed patterns",
        "facial_hair": "clean shaven",
        "face_structure": "angular jaw, high cheekbones, confident smile",
        "skin_tone": "fair-olive, tans well",
        "eye_color": "dark brown",
        "tattoos": ["extensive: full sleeves both arms", "chest piece", "back", "leg pieces"],
        "distinctive_features": ["explosive overlapping runs", "smiley face hair designs", "dynamic celebratory energy", "1.84m powerful frame"],
        "build_type": "explosive strong full-back build"
    },
    17: {  # Mike Maignan-Admin (Maignan)
        "hair_color": "black",
        "hairstyle": "very short buzz cut",
        "facial_hair": "clean shaven",
        "face_structure": "square jaw, broad face, commanding presence",
        "skin_tone": "deep dark brown",
        "eye_color": "dark brown",
        "tattoos": ["left arm: script", "chest"],
        "distinctive_features": ["tall commanding 1.91m GK presence", "focused intense stare", "vocal leader"],
        "build_type": "tall powerful goalkeeper build"
    },
    18: {  # Aurélien Buffer-Tch (Tchouaméni)
        "hair_color": "black",
        "hairstyle": "short with clean fade",
        "facial_hair": "clean shaven",
        "face_structure": "square strong jaw, broad nose, determined features",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["imposing 1.88m physical presence", "determined focused look", "defensive midfield authority"],
        "build_type": "imposing muscular midfield build"
    },
    19: {  # William Sali-Struct (Saliba)
        "hair_color": "dark brown/black",
        "hairstyle": "crisp well-groomed fade, sharp lineup",
        "facial_hair": "clean shaven",
        "face_structure": "long elegant face, straight nose, calm eyes",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["tall elegant 1.92m CB frame", "calm composed demeanor", "exceptional reading of game"],
        "build_type": "tall elegant centre-back build"
    },
    20: {  # Dayot Upame-Kernel (Upamecano)
        "hair_color": "black",
        "hairstyle": "short with clean fade",
        "facial_hair": "clean shaven",
        "face_structure": "broad face, strong jaw, intense eyes",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["right arm: script", "left arm"],
        "distinctive_features": ["exceptional physical power", "focused intense stare", "1.86m powerful CB", "ball-playing confidence"],
        "build_type": "exceptionally strong powerful centre-back"
    },
    21: {  # Jules Koun-DEX (Koundé)
        "hair_color": "black",
        "hairstyle": "short braids or creative fade style",
        "facial_hair": "well-groomed light beard/stubble",
        "face_structure": "angular face, defined jawline, stylish",
        "skin_tone": "dark brown, tans to deeper tone",
        "eye_color": "dark brown",
        "tattoos": ["left arm: script", "minimal"],
        "distinctive_features": ["stylish agile movement", "technical ball-playing CB", "1.80m compact athletic", "fashion-forward appearance"],
        "build_type": "agile stylish athletic build"
    },
    22: {  # Adrien Rabi-Protocol (Rabiot)
        "hair_color": "dark brown",
        "hairstyle": "short-to-medium textured, often gelled/styled with volume",
        "facial_hair": "clean shaven",
        "face_structure": "long elegant face, straight nose, composed",
        "skin_tone": "fair",
        "eye_color": "dark brown",
        "tattoos": ["left arm: script", "chest"],
        "distinctive_features": ["tall elegant 1.88m midfield frame", "composed mature demeanor", "box-to-box engine", "strong aerial presence"],
        "build_type": "tall versatile midfield build"
    },
    # ============ INGLATERRA ============
    23: {  # Harry Stake (Kane)
        "hair_color": "blonde-brown (dirty blonde)",
        "hairstyle": "short classic, neat",
        "facial_hair": "well-kept light beard/stubble",
        "face_structure": "square jaw, strong chin, leadership features",
        "skin_tone": "fair with cool undertones",
        "eye_color": "blue",
        "tattoos": ["none visible"],
        "distinctive_features": ["powerful classic 1.88m striker frame", "focused leadership expression", "elite finisher posture", "tottenham/england captain presence"],
        "build_type": "powerful classic striker build"
    },
    24: {  # Jude Belling-Swap (Bellingham)
        "hair_color": "black",
        "hairstyle": "short afro fade, textured top",
        "facial_hair": "clean shaven",
        "face_structure": "strong defined jaw, high cheekbones, mature beyond years",
        "skin_tone": "deep olive, tans dark",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["generational talent aura", "arms outstretched celebration", "1.86m elegant athletic", "intense competitive fire"],
        "build_type": "elegant tall athletic midfield build"
    },
    25: {  # Phil Fod-Phantom (Foden)
        "hair_color": "dark brown",
        "hairstyle": "sharp skin fade, textured top",
        "facial_hair": "clean shaven",
        "face_structure": "youthful round face, soft jaw, bright eyes",
        "skin_tone": "fair",
        "eye_color": "dark brown",
        "tattoos": ["neck: 'sky is the limit'", "behind ear: number 47", "small wrist"],
        "distinctive_features": ["compact 1.71m agile frame", "focused intense expression", "technical wizardry", "number 47 tribute"],
        "build_type": "compact fast attacking build"
    },
    26: {  # Bukayo Solana (Saka)
        "hair_color": "black",
        "hairstyle": "high-top fade with sharp line-ups",
        "facial_hair": "clean shaven",
        "face_structure": "youthful oval, bright smile, expressive",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["energetic constant smile", "1.78m agile winger", "bukayo saka celebration", "humble focused demeanor"],
        "build_type": "agile fast winger build"
    },
    27: {  # Declan Rice-Validator (Rice)
        "hair_color": "dark brown",
        "hairstyle": "classic flow - longer textured scissor cut, natural taper",
        "facial_hair": "light stubble",
        "face_structure": "strong square jaw, commanding presence",
        "skin_tone": "fair",
        "eye_color": "blue",
        "tattoos": ["left arm: family script", "small pieces"],
        "distinctive_features": ["commanding 1.85m presence", "deep voice authority", "defensive midfield general", "west ham/arsenal captain energy"],
        "build_type": "tall strong midfield build"
    },
    28: {  # Kyle Gas-Walker (Walker)
        "hair_color": "dark brown/black",
        "hairstyle": "buzz cut or very short with precision fade",
        "facial_hair": "well-groomed short beard",
        "face_structure": "square strong jaw, intense eyes",
        "skin_tone": "tanned olive",
        "eye_color": "dark brown",
        "tattoos": ["right arm: sleeve", "chest", "back pieces"],
        "distinctive_features": ["exceptional recovery pace", "intense focused stare", "1.78m powerful athletic", "veteran leader presence"],
        "build_type": "exceptionally powerful fast athletic build"
    },
    29: {  # Jordan Pick-Safe (Pickford)
        "hair_color": "blonde-brown",
        "hairstyle": "short textured with volume",
        "facial_hair": "clean shaven",
        "face_structure": "round expressive face, high energy",
        "skin_tone": "fair",
        "eye_color": "blue",
        "tattoos": ["left arm: sleeve", "chest", "rib script"],
        "distinctive_features": ["vocal expressive GK", "1.85m agile frame", "quick reflexes posture", "everton/england passion"],
        "build_type": "agile high-energy goalkeeper build"
    },
    30: {  # John Stone-Base (Stones)
        "hair_color": "brown",
        "hairstyle": "short styled, neat",
        "facial_hair": "clean shaven",
        "face_structure": "long elegant face, composed features",
        "skin_tone": "fair",
        "eye_color": "blue",
        "tattoos": ["none visible"],
        "distinctive_features": ["elegant 1.88m CB", "composed ball-playing", "calm under pressure", "man city system perfect"],
        "build_type": "elegant lean centre-back build"
    },
    31: {  # Trent Cross-Arnold (Alexander-Arnold)
        "hair_color": "dark brown",
        "hairstyle": "short natural curls or short braids",
        "facial_hair": "clean shaven",
        "face_structure": "technical intelligent face, focused eyes",
        "skin_tone": "mixed/olive",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["technical genius posture", "1.80m lean FB", "crossing master", "scouse energy"],
        "build_type": "technical lean full-back build"
    },
    32: {  # Luke Vector (Shaw)
        "hair_color": "brown",
        "hairstyle": "short neat",
        "facial_hair": "clean shaven",
        "face_structure": "strong face, intense eyes",
        "skin_tone": "fair",
        "eye_color": "blue",
        "tattoos": ["left arm: pieces", "chest"],
        "distinctive_features": ["robust powerful 1.85m LB", "intense competitive fire", "injury comeback resilience", "attacking threat"],
        "build_type": "robust powerful full-back build"
    },
    33: {  # Cole Cold-Coin (Palmer)
        "hair_color": "blonde-brown",
        "hairstyle": "neat short, clean",
        "facial_hair": "clean shaven",
        "face_structure": "youthful calm features, composed",
        "skin_tone": "fair",
        "eye_color": "blue",
        "tattoos": ["none visible"],
        "distinctive_features": ["cold calm expression", "1.85m technical attacker", "ice in veins finisher", "chelsea breakout star"],
        "build_type": "technical attacking build"
    },
    # ============ BRASIL ============
    34: {  # Neymar-NFT (Neymar Jr.)
        "hair_color": "dark brown (often dyed blonde/platinum)",
        "hairstyle": "short with side fade, varies frequently",
        "facial_hair": "light stubble beard",
        "face_structure": "narrow face, high cheekbones, expressive",
        "skin_tone": "bronze olive",
        "eye_color": "dark brown",
        "tattoos": ["extensive: 60+ tattoos", "neck: prayer hands", "full sleeves", "chest", "back", "legs", "hand tattoos"],
        "distinctive_features": ["creative charismatic expression", "1.75m agile frame", "theatrical flair", "showman personality"],
        "build_type": "agile lean athletic build"
    },
    35: {  # Vinicius Jpeg Jr (Vinícius Jr.)
        "hair_color": "black",
        "hairstyle": "short curly top with fade, natural curls",
        "facial_hair": "clean shaven",
        "face_structure": "youthful round, wide infectious smile",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["left arm: family", "chest: 'vini jr'", "small pieces"],
        "distinctive_features": ["electric pace celebration", "1.76m explosive winger", "constant joy expression", "dancing samba energy"],
        "build_type": "explosive winger build"
    },
    36: {  # Alisson Vault-son (Becker)
        "hair_color": "blonde/light brown",
        "hairstyle": "short neat, sometimes longer textured",
        "facial_hair": "light beard/stubble, well-groomed",
        "face_structure": "kind oval face, gentle eyes, calm",
        "skin_tone": "fair, tans well",
        "eye_color": "blue/green",
        "tattoos": ["right arm: Jesa (faith)", "left arm: family", "chest: cross", "back: wings"],
        "distinctive_features": ["calm composed GK", "1.91m tall frame", "exceptional distribution", "faith-focused demeanor"],
        "build_type": "tall composed goalkeeper build"
    },
    37: {  # Rodrygo-Yield (Rodrygo)
        "hair_color": "dark brown",
        "hairstyle": "short textured crop, neat",
        "facial_hair": "clean shaven",
        "face_structure": "youthful delicate features, bright smile",
        "skin_tone": "olive bronze",
        "eye_color": "dark brown",
        "tattoos": ["small wrist", "minimal"],
        "distinctive_features": ["rayo celebration", "1.74m agile", "technical finesse", "humble focused"],
        "build_type": "agile technical forward build"
    },
    38: {  # Bruno Guima-Liquid (Guimarães)
        "hair_color": "dark brown",
        "hairstyle": "short fade, textured top",
        "facial_hair": "light beard/stubble",
        "face_structure": "angular strong jaw, determined",
        "skin_tone": "olive",
        "eye_color": "dark brown",
        "tattoos": ["extensive sleeves", "chest", "religious themes"],
        "distinctive_features": ["box-to-box engine", "1.82m strong midfield", "passionate leader", "newcastle captain energy"],
        "build_type": "strong versatile midfield build"
    },
    39: {  # Casemiro-Mint (Casemiro)
        "hair_color": "dark brown/black",
        "hairstyle": "short fade, neat",
        "facial_hair": "light beard",
        "face_structure": "square strong, battle-hardened",
        "skin_tone": "olive",
        "eye_color": "dark brown",
        "tattoos": ["extensive: full sleeves", "chest", "back", "religious/family"],
        "distinctive_features": ["defensive midfield general", "1.85m powerful", "tactical intelligence", "real madrid/man utd winner"],
        "build_type": "powerful defensive midfield build"
    },
    40: {  # Marquinhos-Server (Marquinhos)
        "hair_color": "black",
        "hairstyle": "short neat fade",
        "facial_hair": "clean shaven or light stubble",
        "face_structure": "calm intelligent, leadership presence",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["left arm: script", "family names"],
        "distinctive_features": ["elegant CB leader", "1.83m composed", "psg captain", "ball-playing excellence"],
        "build_type": "elegant composed centre-back build"
    },
    41: {  # Eder Mili-Pixel (Militão)
        "hair_color": "black",
        "hairstyle": "short fade, clean",
        "facial_hair": "clean shaven",
        "face_structure": "strong determined, focused",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["physical specimen", "1.86m athletic", "explosive recovery", "real madrid rock"],
        "build_type": "explosive athletic centre-back build"
    },
    42: {  # Danilo-Legacy (Danilo)
        "hair_color": "dark brown/black",
        "hairstyle": "short neat",
        "facial_hair": "light beard",
        "face_structure": "experienced calm, leadership",
        "skin_tone": "olive bronze",
        "eye_color": "dark brown",
        "tattoos": ["right arm: family", "chest"],
        "distinctive_features": ["versatile veteran", "1.84m intelligent", "tactical master", "juventus/brazil leader"],
        "build_type": "intelligent versatile defensive build"
    },
    43: {  # Lucas Paque-Frame (Paquetá)
        "hair_color": "dark brown",
        "hairstyle": "medium textured, often styled back",
        "facial_hair": "light beard/stubble",
        "face_structure": "creative intelligent, expressive",
        "skin_tone": "olive",
        "eye_color": "dark brown",
        "tattoos": ["extensive: sleeves", "chest", "back", "religious"],
        "distinctive_features": ["creative magician", "1.80m technical", "flair player", "west ham/brazil playmaker"],
        "build_type": "technical creative midfield build"
    },
    44: {  # Endrick Moon (Endrick)
        "hair_color": "dark brown",
        "hairstyle": "short textured crop",
        "facial_hair": "clean shaven",
        "face_structure": "youthful determined, mature beyond 17",
        "skin_tone": "olive bronze",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["prodigy confidence", "1.73m powerful", "clinical finisher", "real madrid bound"],
        "build_type": "powerful youthful striker build"
    },
    # ============ ESPAÑA ============
    45: {  # Lamine Ya-Alpha (Yamal)
        "hair_color": "black",
        "hairstyle": "short curly top with fade",
        "facial_hair": "clean shaven",
        "face_structure": "youthful round, innocent but determined",
        "skin_tone": "olive",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["16yo prodigy", "1.78m growing", "left foot magic", "barcelona/spain sensation", "humble grounded"],
        "build_type": "youthful agile winger build"
    },
    46: {  # Pedri-Script (Pedri)
        "hair_color": "dark brown",
        "hairstyle": "short textured, messy fringe",
        "facial_hair": "clean shaven",
        "face_structure": "youthful intelligent, kind eyes",
        "skin_tone": "fair-olive",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["magician with ball", "1.74m low center gravity", "constant scanning", "iniesta heir", "golden boy"],
        "build_type": "technical intelligent midfield build"
    },
    47: {  # Rodri Proof-of-Stake (Rodri)
        "hair_color": "dark brown",
        "hairstyle": "short neat, professional",
        "facial_hair": "light stubble",
        "face_structure": "intelligent serious, commanding",
        "skin_tone": "fair-olive",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["best DM in world", "1.90m tactical giant", "perfect positioning", "ballon d'or contender", "man city system brain"],
        "build_type": "tall tactical defensive midfield build"
    },
    48: {  # Gavi-Gas (Gavi)
        "hair_color": "dark brown",
        "hairstyle": "short messy, distinctive fringe",
        "facial_hair": "clean shaven",
        "face_structure": "youthful fierce, intense eyes",
        "skin_tone": "fair-olive",
        "eye_color": "dark brown",
        "tattoos": ["none visible"],
        "distinctive_features": ["pitbull intensity", "1.73m warrior", "relentless energy", "golden boy 2022", "barcelona heart"],
        "build_type": "compact warrior midfield build"
    },
    49: {  # Nico Shard-Williams (Williams)
        "hair_color": "black",
        "hairstyle": "short afro fade",
        "facial_hair": "clean shaven",
        "face_structure": "athletic determined, bright smile",
        "skin_tone": "dark brown",
        "eye_color": "dark brown",
        "tattoos": ["minimal"],
        "distinctive_features": ["explosive winger", "1.81m athletic", "bilbao loyalty", "ghanian heritage pride", "pace merchant"],
        "build_type": "explosive athletic winger build"
    },
    50: {  # Unai Simon-Key (Simón)
        "hair_color": "dark brown",
        "hairstyle": "short neat",
        "facial_hair": "light beard",
        "face_structure": "calm confident, broad face",
        "skin_tone": "fair-olive",
        "eye_color": "dark brown",
        "tattoos": ["left arm: script", "chest"],
        "distinctive_features": ["modern ball-playing GK", "1.90m composed", "euro 2024 winner", "athletic bilbao icon", "penalty specialist"],
        "build_type": "tall modern goalkeeper build"
    },
}

# Additional players can be added here following the same structure
# For players 51-528, we'll generate variations based on position, country, and rarity

def get_enhanced_physical(player_id, base_physical, real_name, country, position):
    """
    Get enhanced physical data for a player.
    Returns merged data with fallback defaults based on position/country.
    """
    enhanced = ENHANCED_PHYSICAL_DATA.get(player_id, {})
    
    # Build the enhanced physical object
    result = base_physical.copy()
    
    # Add structured fields
    for key in ['hair_color', 'hairstyle', 'facial_hair', 'face_structure', 
                'skin_tone', 'eye_color', 'tattoos', 'distinctive_features', 'build_type']:
        if key in enhanced:
            result[key] = enhanced[key]
        else:
            # Generate sensible defaults based on position/country
            result[key] = generate_default_physical_field(key, position, country)
    
    # Rebuild the 't' (text description) field from structured data
    result['t'] = build_enhanced_description(result)
    
    return result


def generate_default_physical_field(field, position, country):
    """Generate default physical field values based on position and country."""
    
    # Position-based variations
    position_styles = {
        'GK': {
            'hair_color': 'dark brown',
            'hairstyle': 'short neat buzz cut or fade',
            'facial_hair': 'clean shaven',
            'face_structure': 'broad confident face, commanding presence',
            'skin_tone': 'olive',
            'eye_color': 'dark brown',
            'distinctive_features': ['tall commanding frame', 'alert focused gaze'],
            'build_type': 'tall commanding goalkeeper build, broad shoulders',
        },
        'DEF': {
            'hair_color': 'dark brown',
            'hairstyle': 'short with clean fade',
            'facial_hair': 'clean shaven or light stubble',
            'face_structure': 'strong square jaw, determined expression',
            'skin_tone': 'olive',
            'eye_color': 'dark brown',
            'distinctive_features': ['imposing physical presence', 'aggressive defensive stance'],
            'build_type': 'strong robust centre-back build, powerful frame',
        },
        'MID': {
            'hair_color': 'dark brown',
            'hairstyle': 'short textured crop with fade',
            'facial_hair': 'clean shaven',
            'face_structure': 'intelligent composed face, sharp eyes',
            'skin_tone': 'olive',
            'eye_color': 'dark brown',
            'distinctive_features': ['technical posture', 'constant scanning vision'],
            'build_type': 'balanced athletic midfield build, engine-like stamina',
        },
        'FWD': {
            'hair_color': 'dark brown',
            'hairstyle': 'short with fade, textured top',
            'facial_hair': 'clean shaven',
            'face_structure': 'sharp predatory features, intense eyes',
            'skin_tone': 'olive',
            'eye_color': 'dark brown',
            'distinctive_features': ['explosive acceleration posture', 'clinical finisher focus'],
            'build_type': 'lean explosive forward build, low center of gravity',
        },
    }
    
    # Country-based skin tone adjustments
    country_skin = {
        'Argentina': 'olive with warm undertones',
        'Francia': 'dark brown to olive',
        'France': 'dark brown to olive',
        'Inglaterra': 'fair with cool undertones',
        'England': 'fair with cool undertones',
        'Brasil': 'bronze to dark brown',
        'Brazil': 'bronze to dark brown',
        'España': 'olive to light brown',
        'Spain': 'olive to light brown',
        'Portugal': 'olive to light brown',
        'Alemania': 'fair',
        'Germany': 'fair',
        'Italia': 'olive',
        'Italy': 'olive',
        'Países Bajos': 'fair to olive',
        'Netherlands': 'fair to olive',
        'Croacia': 'fair to olive',
        'Croatia': 'fair to olive',
        'Bélgica': 'fair to olive',
        'Belgium': 'fair to olive',
        'Uruguay': 'olive',
        'Colombia': 'bronze to dark brown',
        'Marruecos': 'olive to dark brown',
        'Morocco': 'olive to dark brown',
        'Senegal': 'deep dark brown',
        'Egipto': 'olive to bronze',
        'Egypt': 'olive to bronze',
        'Nigeria': 'deep dark brown',
        'Japón': 'fair to light olive',
        'Japan': 'fair to light olive',
        'Corea del Sur': 'fair to light olive',
        'South Korea': 'fair to light olive',
        'Australia': 'fair, tans well',
        'Dinamarca': 'fair',
        'Denmark': 'fair',
        'Suiza': 'fair to olive',
        'Switzerland': 'fair to olive',
        'Serbia': 'fair to olive',
        'Polonia': 'fair',
        'Poland': 'fair',
        'Ucrania': 'fair to olive',
        'Ukraine': 'fair to olive',
        'Turquía': 'olive to light brown',
        'Turkey': 'olive to light brown',
        'México': 'olive to bronze',
        'Mexico': 'olive to bronze',
        'EE.UU.': 'varied, fair to dark',
        'USA': 'varied, fair to dark',
        'Canadá': 'varied, fair to dark',
        'Canada': 'varied, fair to dark',
        'Costa Rica': 'olive to bronze',
        'Chile': 'olive to bronze',
        'Perú': 'olive to bronze',
        'Peru': 'olive to bronze',
        'Ecuador': 'olive to bronze',
        'Paraguay': 'olive to bronze',
        'Venezuela': 'olive to bronze',
        'Argentina': 'olive with warm undertones',
    }
    
    pos_data = position_styles.get(position, position_styles['MID'])
    skin_tone = country_skin.get(country, 'olive')
    
    defaults = {
        'hair_color': pos_data['hair_color'],
        'hairstyle': pos_data['hairstyle'],
        'facial_hair': pos_data['facial_hair'],
        'face_structure': pos_data['face_structure'],
        'skin_tone': skin_tone,
        'eye_color': pos_data['eye_color'],
        'tattoos': [],
        'distinctive_features': pos_data['distinctive_features'],
        'build_type': pos_data['build_type'],
    }
    return defaults.get(field, '')


def build_enhanced_description(physical):
    """Build the enhanced 't' description from structured fields."""
    parts = []
    
    # Hair
    hair_color = physical.get('hair_color', 'dark brown')
    hairstyle = physical.get('hairstyle', 'short with fade')
    parts.append(f"{hairstyle} {hair_color} hair")
    
    # Facial hair
    facial_hair = physical.get('facial_hair', 'clean shaven')
    if facial_hair and facial_hair != 'clean shaven':
        parts.append(f"{facial_hair}")
    else:
        parts.append("clean shaven")
    
    # Face structure
    face_structure = physical.get('face_structure', '')
    if face_structure:
        parts.append(face_structure)
    
    # Skin tone
    skin_tone = physical.get('skin_tone', 'olive skin')
    parts.append(f"{skin_tone} tone")
    
    # Distinctive features (pick 1-2)
    distinctive = physical.get('distinctive_features', [])
    if distinctive:
        parts.append(distinctive[0])
    
    # Build type
    build_type = physical.get('build_type', 'athletic build')
    parts.append(build_type)
    
    # Tattoos note (if visible)
    tattoos = physical.get('tattoos', [])
    if tattoos:
        visible_tattoos = [t for t in tattoos if any(kw in t.lower() for kw in ['neck', 'hand', 'face', 'calf', 'forearm'])]
        if visible_tattoos:
            parts.append(f"visible tattoos: {', '.join(visible_tattoos[:2])}")
    
    return ", ".join(parts) + "."


if __name__ == "__main__":
    # Test with a few players
    test_ids = [1, 2, 12, 23, 34, 45, 47]
    for pid in test_ids:
        enhanced = ENHANCED_PHYSICAL_DATA.get(pid, {})
        print(f"Player {pid}: {enhanced.get('hairstyle', 'N/A')} | {enhanced.get('tattoos', [])}")
        desc = build_enhanced_description(enhanced)
        print(f"  Enhanced description: {desc}")
        print()