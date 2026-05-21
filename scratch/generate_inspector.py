import os

def generate_inspector_html():
    base_path = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    INPUT_FOLDER = os.path.join(base_path, "assets/img/raw_grok_generations")
    HTML_OUT = os.path.join(base_path, "scratch/inspect_players.html")

    valid_extensions = ('.png', '.jpg', '.jpeg', '.webp')
    files = sorted([f for f in os.listdir(INPUT_FOLDER) if f.lower().endswith(valid_extensions)])

    if not files:
        print("⚠️ No hay imágenes en la carpeta para inspeccionar.")
        return

    html_content = """<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>GoalChain Visual Player Inspector</title>
    <style>
        body {
            background-color: #0b0b0f;
            color: #ffffff;
            font-family: 'Helvetica Neue', Arial, sans-serif;
            margin: 0;
            padding: 40px;
        }
        h1 {
            text-align: center;
            color: #14f195;
            font-size: 2.2rem;
            margin-bottom: 30px;
            text-shadow: 0 0 20px rgba(20, 241, 149, 0.3);
        }
        .grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 25px;
            max-width: 1400px;
            margin: 0 auto;
        }
        .card {
            background: #13131a;
            border: 2px solid #20202b;
            border-radius: 12px;
            padding: 15px;
            text-align: center;
            box-shadow: 0 10px 20px rgba(0,0,0,0.5);
            transition: transform 0.2s;
        }
        .card:hover {
            transform: scale(1.03);
            border-color: #9945ff;
        }
        .card img {
            width: 100%;
            aspect-ratio: 2/3;
            object-fit: cover;
            border-radius: 8px;
            border: 1px solid #2d2d3d;
        }
        .card p {
            font-family: 'Courier New', Courier, monospace;
            font-size: 14px;
            color: #a0a0b0;
            margin: 12px 0 0 0;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <h1>GoalChain Visual Player Inspector</h1>
    <div class="grid">
"""

    for f in files:
        # Ruta relativa desde scratch/ hasta assets/img/raw_grok_generations/
        img_src = f"../assets/img/raw_grok_generations/{f}"
        html_content += f"""
        <div class="card">
            <img src="{img_src}" alt="{f}">
            <p>{f}</p>
        </div>"""

    html_content += """
    </div>
</body>
</html>
"""

    with open(HTML_OUT, 'w', encoding='utf-8') as f:
        f.write(html_content)

    print(f"✅ ¡Página de inspección visual creada con éxito en: {HTML_OUT}")

if __name__ == "__main__":
    generate_inspector_html()
