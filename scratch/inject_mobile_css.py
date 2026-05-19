import re

file_path = "docs/app.html"

with open(file_path, "r", encoding="utf-8") as f:
    content = f.read()

# Add responsive CSS to the style block
responsive_css = """
        /* Advanced Mobile Responsiveness */
        @media (max-width: 768px) {
            /* Force grids to stack on mobile */
            div[style*="grid-template-columns: 1fr 1fr"],
            div[style*="grid-template-columns: 2fr 1fr"],
            div[style*="grid-template-columns: 1.2fr 1fr"],
            div[style*="grid-template-columns: 1fr 1.2fr"],
            div[style*="grid-template-columns: 1fr 1.5fr"],
            div[style*="grid-template-columns: 1fr 1fr 1fr"] {
                grid-template-columns: 1fr !important;
            }
            
            /* Typography scaling */
            h2 { font-size: 1.5rem !important; }
            h3 { font-size: 1.2rem !important; }
            
            /* Card spacing */
            .app-card { padding: 20px !important; margin-bottom: 20px; }
            
            /* Specific fix for the simulator layout */
            #simulatorLayout {
                grid-template-columns: 1fr !important;
            }
            
            /* 3D Card fixes */
            .nft-card-3d { margin: 0 auto !important; max-width: 250px; }
            
            /* Adjust padding on main */
            .main-content { padding: 15px !important; }
        }
"""

if "/* Advanced Mobile Responsiveness */" not in content:
    content = content.replace("</style>", responsive_css + "</style>")

with open(file_path, "w", encoding="utf-8") as f:
    f.write(content)

print("Injected mobile responsive CSS")
