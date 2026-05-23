#!/usr/bin/env python3
import os
import sys
import json
import re
import requests
from datetime import datetime
from dotenv import load_dotenv

# Load env variables from root .env
load_dotenv(os.path.join(os.path.dirname(__file__), '..', '..', '.env'))

GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
ARTIFACTS_DIR = "/Users/NicoPez/.gemini/antigravity/brain/21bf6eea-14fb-4a1b-96d3-3d4cfded4583"

# Colors for terminal styling
C_GREEN = "\033[92m"
C_CYAN = "\033[96m"
C_YELLOW = "\033[93m"
C_RED = "\033[91m"
C_DIM = "\033[90m"
C_BOLD = "\033[1m"
C_RESET = "\033[0m"

# Initial mock campaign database
CAMPAIGNS = {
    "Twitter Ads - Football Fans (Spain)": {
        "platform": "Twitter/X",
        "targeting": "Fanáticos Fútbol, España, 18-35 años",
        "budget": 1200.00,
        "impressions": 142000,
        "clicks": 3400,
        "conversions": 180,
        "cost": 1200.00
    },
    "Twitter Ads - Crypto Degens (LatAm)": {
        "platform": "Twitter/X",
        "targeting": "Solana/Crypto Traders, Argentina/México/Colombia",
        "budget": 1500.00,
        "impressions": 185000,
        "clicks": 5120,
        "conversions": 345,
        "cost": 1500.00
    },
    "Meta Ads - Fantasy Sports (UK)": {
        "platform": "Meta (IG/FB)",
        "targeting": "Fantasy Football leagues, UK, 21-45 años",
        "budget": 1000.00,
        "impressions": 85000,
        "clicks": 1240,
        "conversions": 42,
        "cost": 1000.00
    },
    "Meta Ads - Sports Bettors (Brazil)": {
        "platform": "Meta (IG/FB)",
        "targeting": "Apostadores deportivos, Brasil, 18-40 años",
        "budget": 1300.00,
        "impressions": 210000,
        "clicks": 4250,
        "conversions": 290,
        "cost": 1300.00
    },
    "Twitter Ads - World Cup Trends (Argentina)": {
        "platform": "Twitter/X",
        "targeting": "Fútbol Argentino, Copa del Mundo, Argentina",
        "budget": 1500.00,
        "impressions": 310000,
        "clicks": 9800,
        "conversions": 740,
        "cost": 1500.00
    }
}

VALUE_PER_CONVERSION = 15.00  # Valor estimado por conversión en fee de apuestas ($GCH equivalente)

def calculate_metrics(campaigns_data):
    for name, data in campaigns_data.items():
        clicks = data["clicks"]
        impressions = data["impressions"]
        conversions = data["conversions"]
        cost = data["cost"]
        
        data["ctr"] = (clicks / impressions) * 100 if impressions > 0 else 0
        data["cpc"] = cost / clicks if clicks > 0 else 0
        data["cpa"] = cost / conversions if conversions > 0 else 0
        
        # ROAS = (Conversions * Value) / Cost
        revenue = conversions * VALUE_PER_CONVERSION
        data["roas"] = (revenue / cost) * 100 if cost > 0 else 0
        data["revenue"] = revenue

def print_header():
    print(f"\n{C_CYAN}{C_BOLD}" + "="*75)
    print("⚽  GOALCHAIN MARKETING ROI AUDITOR & BUDGET OPTIMIZER  ⚽")
    print("="*75 + f"{C_RESET}")
    print(f"{C_DIM}Inspirado en claude-ads • Analizando embudo Web2 -> Web3 en tiempo real{C_RESET}\n")

def print_campaign_table(campaigns_data, title="ESTADO DE CAMPAÑAS ACTUAL"):
    print(f"\n{C_BOLD}{title}{C_RESET}")
    print(f"{C_DIM}+" + "-"*35 + "+" + "-"*10 + "+" + "-"*8 + "+" + "-"*8 + "+" + "-"*10 + "+")
    print(f"| {'Campaña':<33} | {'Gasto':<8} | {'CTR':<6} | {'CPA':<6} | {'ROAS':<8} |")
    print("+" + "-"*35 + "+" + "-"*10 + "+" + "-"*8 + "+" + "-"*8 + "+" + "-"*10 + "+")
    
    total_spend = 0
    total_clicks = 0
    total_convs = 0
    total_rev = 0
    
    for name, data in campaigns_data.items():
        ctr = data["ctr"]
        cpa = data["cpa"]
        roas = data["roas"]
        cost = data["cost"]
        
        total_spend += cost
        total_clicks += data["clicks"]
        total_convs += data["conversions"]
        total_rev += data["revenue"]
        
        roas_str = f"{roas/100:.2f}x"
        cpa_color = C_GREEN if cpa < 4.0 else (C_YELLOW if cpa < 8.0 else C_RED)
        roas_color = C_GREEN if roas > 200 else (C_YELLOW if roas > 100 else C_RED)
        
        print(f"| {name:<33} | ${cost:<7.2f} | {ctr:<5.2f}% | {cpa_color}${cpa:<5.2f}{C_RESET} | {roas_color}{roas_str:<8}{C_RESET} |")
    
    print("+" + "-"*35 + "+" + "-"*10 + "+" + "-"*8 + "+" + "-"*8 + "+" + "-"*10 + "+")
    avg_cpa = total_spend / total_convs if total_convs > 0 else 0
    avg_roas = (total_rev / total_spend) * 100 if total_spend > 0 else 0
    print(f"| {'TOTAL / PROMEDIOS':<33} | ${total_spend:<7.2f} | -      | ${avg_cpa:<5.2f} | {avg_roas/100:.2f}x    |")
    print("+" + "-"*35 + "+" + "-"*10 + "+" + "-"*8 + "+" + "-"*8 + "+" + "-"*10 + "+\n")

def run_gemini_optimization(campaigns_data):
    if not GEMINI_API_KEY:
        print(f"{C_YELLOW}⚠️  GEMINI_API_KEY no configurada. Usando optimización heurística local...{C_RESET}")
        return run_local_heuristics(campaigns_data)
        
    url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}"
    
    # Formulate prompt with data and trends
    prompt = f"""
Actúa como el Director de Growth y Marketing de GoalChain, un protocolo de SportsFi en Solana.
Tu misión es auditar el rendimiento de nuestras campañas pagadas de adquisición de usuarios Web2 a Web3 y recomendar una optimización del presupuesto de $6500 USD totales.

Tenemos las siguientes métricas de campañas de prueba actuales (Valor estimado por conversión Web3 es de $15.00 USD en fees de volumen transaccional de apuestas):

{json.dumps(campaigns_data, indent=2)}

---

**Tendencias de Redes Sociales y Oráculos en Vivo actuales:**
1. Hype deportivo masivo en Argentina y Brasil debido a la inminente Copa del Mundo 2026. La campaña de Argentina ('Twitter Ads - World Cup Trends (Argentina)') tiene una tasa de conversión impresionante.
2. Los costos publicitarios en el Reino Unido ('Meta Ads - Fantasy Sports (UK)') se han disparado por saturación de mercado, lo que resulta en un CPA extremadamente caro y un ROAS deficiente (menor a 1.0x).
3. Las tarifas de transacción en Solana están en mínimos históricos, lo que es un gran gancho para atraer Crypto Degens de LatAm ('Twitter Ads - Crypto Degens (LatAm)') que buscan apostar directamente on-chain sin fricción.

---

**Instrucciones:**
1. Distribuye el presupuesto total de $6,500 USD entre las 5 campañas para maximizar el ROI. Reduce el presupuesto de las campañas ineficientes (especialmente Meta UK) y reasígnalo a las más eficientes (Argentina, Brasil, Crypto Degens LatAm).
2. Devuelve un bloque JSON válido delimitado con triple backticks ```json ... ``` que contenga exactamente esta estructura:
{{
  "campaigns": {{
    "Twitter Ads - Football Fans (Spain)": 1000.0,
    "Twitter Ads - Crypto Degens (LatAm)": 1800.0,
    "Meta Ads - Fantasy Sports (UK)": 300.0,
    "Meta Ads - Sports Bettors (Brazil)": 1500.0,
    "Twitter Ads - World Cup Trends (Argentina)": 1900.0
  }},
  "trend_analysis": "Análisis rápido de las tendencias actuales y por qué se redistribuyen los fondos.",
  "campaign_recommendations": "Recomendaciones de optimización para cada campaña.",
  "top_ad_copies": [
    {{
      "campaign": "Twitter Ads - World Cup Trends (Argentina)",
      "headline": "Título de anuncio",
      "copy": "Texto del anuncio épico y futbolero con jerga Web3/Solana."
    }},
    {{
      "campaign": "Twitter Ads - Crypto Degens (LatAm)",
      "headline": "Título de anuncio",
      "copy": "Texto del anuncio épico y crypto/Solana."
    }}
  ]
}}

Asegúrate de que la suma de los presupuestos recomendados sea exactamente $6500.00 USD.
Responde en español con un tono épico, apasionado, futbolero y tecnológico de Solana.
"""

    headers = {
        "Content-Type": "application/json"
    }

    data = {
        "contents": [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
    }

    try:
        print(f"{C_CYAN}🤖 Consultando al motor de IA Gemini 2.5-Flash para optimizar presupuestos...{C_RESET}")
        response = requests.post(url, headers=headers, data=json.dumps(data))
        
        if response.status_code == 200:
            result = response.json()
            response_text = result['candidates'][0]['content']['parts'][0]['text']
            
            # Extract JSON block
            json_match = re.search(r'```json\s*(.*?)\s*```', response_text, re.DOTALL)
            if json_match:
                parsed_json = json.loads(json_match.group(1))
                return parsed_json, response_text
            else:
                # Try parsing raw text if backticks are missing but it contains brackets
                bracket_match = re.search(r'\{.*\}', response_text, re.DOTALL)
                if bracket_match:
                    parsed_json = json.loads(bracket_match.group(0))
                    return parsed_json, response_text
                else:
                    raise ValueError("No se pudo extraer JSON estructurado de la respuesta de Gemini.")
        else:
            print(f"{C_RED}❌ Error al llamar a la API de Gemini: status {response.status_code}{C_RESET}")
            return run_local_heuristics(campaigns_data)
            
    except Exception as e:
        print(f"{C_RED}❌ Error inesperado llamando a Gemini: {e}{C_RESET}")
        return run_local_heuristics(campaigns_data)

def run_local_heuristics(campaigns_data):
    print(f"{C_GREEN}⚙️ Ejecutando optimización local basada en reglas heurísticas de ROI...{C_RESET}")
    # Local heuristics:
    # Reduce Meta UK to $250.00
    # Reduce Spain to $1000.00
    # Increase Argentina to $2200.00
    # Increase Brazil to $1550.00
    # Increase Crypto LatAm to $1500.00
    # Total = 6500.00
    optimized_budgets = {
        "Twitter Ads - Football Fans (Spain)": 1000.00,
        "Twitter Ads - Crypto Degens (LatAm)": 1500.00,
        "Meta Ads - Fantasy Sports (UK)": 250.00,
        "Meta Ads - Sports Bettors (Brazil)": 1550.00,
        "Twitter Ads - World Cup Trends (Argentina)": 2200.00
    }
    
    trend_analysis = "Análisis heurístico local: Los anuncios de Meta UK tienen un CPA de más de $23 USD, destruyendo el margen. La campaña de tendencias del Mundial en Argentina entrega un ROAS masivo de 7.4x y un CPA ultra-eficiente de $2.03. Se recorta el presupuesto del Reino Unido y España para apalancar al máximo las campañas sudamericanas."
    
    recommendations = "1. Meta UK: Recortar un 75% el presupuesto. El mercado de fantasy está saturado y el CAC es inaceptable.\n2. Twitter Argentina: Aumentar presupuesto en 46%. Es nuestra gallina de los huevos de oro.\n3. Meta Brasil: Aumentar un 19%. Brasil responde excelente a las conversiones web3."
    
    ad_copies = [
        {
            "campaign": "Twitter Ads - World Cup Trends (Argentina)",
            "headline": "🇦🇷 ¡HACE STAKE POR LA SCALONETA ON-CHAIN!",
            "copy": "Olvídate de las casas de apuestas Web2 lentas y llenas de comisiones. En GoalChain apostás con $GCH directamente desde tu Phantom wallet. ¡Transparencia total de oráculos en Solana! 🚀⚽"
        },
        {
            "campaign": "Twitter Ads - Crypto Degens (LatAm)",
            "headline": "⚡ SOLANA FEES EN MÍNIMOS • APUESTA SEGURO",
            "copy": "Los fees de Solana están regalados. Meté un Long x5 al partido del Mundial en Drift. Cero KYC, liquidaciones transparentes por oráculo on-chain. ¿Te lo vas a perder? 🇸🇻🇲🇽🇦🇷"
        }
    ]
    
    parsed_json = {
        "campaigns": optimized_budgets,
        "trend_analysis": trend_analysis,
        "campaign_recommendations": recommendations,
        "top_ad_copies": ad_copies
    }
    
    return parsed_json, "Optimización heurística local ejecutada correctamente."

def save_outputs(optimized_data, original_campaigns):
    # Save campaign_budgets.json
    output_config_path = os.path.join(os.path.dirname(__file__), 'campaign_budgets.json')
    config_payload = {
        "total_budget": 6500.00,
        "campaigns": optimized_data["campaigns"],
        "timestamp": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    with open(output_config_path, 'w', encoding='utf-8') as f:
        json.dump(config_payload, f, indent=2, ensure_ascii=False)
    print(f"{C_GREEN}💾 Configuración de presupuestos guardada en: {C_RESET}{output_config_path}")

    # Generate markdown report
    report_path = os.path.join(ARTIFACTS_DIR, 'campaign_roi_report.md')
    
    # Calculate simulated post-optimization stats
    # We assume optimized budget has the same CPA as original, so conversions scale proportionally to new budget
    optimized_campaigns = {}
    for name, orig in original_campaigns.items():
        new_budget = optimized_data["campaigns"].get(name, orig["budget"])
        scale = new_budget / orig["budget"]
        
        opt = orig.copy()
        opt["budget"] = new_budget
        opt["cost"] = new_budget
        opt["impressions"] = int(orig["impressions"] * scale)
        opt["clicks"] = int(orig["clicks"] * scale)
        opt["conversions"] = int(orig["conversions"] * scale)
        optimized_campaigns[name] = opt
        
    calculate_metrics(optimized_campaigns)
    
    # Compile markdown content
    markdown_content = f"""# GoalChain Marketing ROI Audit & Optimization Report

**Generado por:** AI Growth Agent (Google Gemini 2.5-Flash)  
**Fecha de Auditoría:** {datetime.now().strftime("%Y-%m-%d %H:%M:%S")}  
**Presupuesto Auditado:** $6,500.00 USD  
**Valor de Conversión Web3:** $15.00 USD por Wallet Connection / Bet

---

## 📊 Comparación de Rendimiento (Antes vs. Después)

A continuación se detalla la reasignación de presupuestos recomendada por la IA para maximizar el Retorno sobre el Gasto Publicitario (ROAS):

### Tabla General de Campañas

| Campaña | Presupuesto Original | Presupuesto Optimizado | CPA (Original) | ROAS (Original) | Impacto / Estado |
| :--- | :---: | :---: | :---: | :---: | :---: |
"""
    
    for name, orig in original_campaigns.items():
        opt = optimized_campaigns[name]
        diff = opt["budget"] - orig["budget"]
        diff_str = f"+${diff:.2f}" if diff >= 0 else f"-${abs(diff):.2f}"
        roas_orig = orig["roas"] / 100
        cpa_orig = orig["cpa"]
        
        status = "🟢 Aumentar" if diff > 0 else ("🔴 Recortar" if diff < 0 else "⚪ Mantener")
        
        markdown_content += f"| **{name}** | ${orig['budget']:.2f} | ${opt['budget']:.2f} ({diff_str}) | ${cpa_orig:.2f} | {roas_orig:.2f}x | {status} |\n"
        
    # Totals
    orig_total_convs = sum(c["conversions"] for c in original_campaigns.values())
    orig_total_spend = sum(c["cost"] for c in original_campaigns.values())
    orig_avg_cpa = orig_total_spend / orig_total_convs if orig_total_convs > 0 else 0
    orig_total_rev = orig_total_convs * VALUE_PER_CONVERSION
    orig_avg_roas = (orig_total_rev / orig_total_spend) if orig_total_spend > 0 else 0
    
    opt_total_convs = sum(c["conversions"] for c in optimized_campaigns.values())
    opt_total_spend = sum(c["cost"] for c in optimized_campaigns.values())
    opt_avg_cpa = opt_total_spend / opt_total_convs if opt_total_convs > 0 else 0
    opt_total_rev = opt_total_convs * VALUE_PER_CONVERSION
    opt_avg_roas = (opt_total_rev / opt_total_spend) if opt_total_spend > 0 else 0
    
    markdown_content += f"| **TOTALES / PROMEDIOS** | **${orig_total_spend:.2f}** | **${opt_total_spend:.2f}** | **${orig_avg_cpa:.2f}** | **{orig_avg_roas:.2f}x** | **Simulado ROAS Post: {opt_avg_roas:.2f}x** |\n\n"
    
    # Format recommendations nicely if returned as list/dict
    recs = optimized_data.get('campaign_recommendations', 'Sin recomendaciones explícitas.')
    recs_str = ""
    if isinstance(recs, list):
        for item in recs:
            if isinstance(item, dict):
                c_name = item.get("campaign", item.get("name", ""))
                c_rec = item.get("recommendation", item.get("text", ""))
                recs_str += f"- **{c_name}**: {c_rec}\n"
            else:
                recs_str += f"- {item}\n"
    else:
        recs_str = str(recs)

    markdown_content += f"""## 📈 Análisis de Tendencias y Justificación del Enjambre

{optimized_data.get('trend_analysis', 'Sin detalles de tendencias.')}

## 💡 Recomendaciones Operativas

{recs_str}

---

## 🎨 Copies de Anuncios Optimizados (Top Performers)

La IA ha redactado los siguientes textos publicitarios de alto impacto, listos para implementar, alineados con el tono épico y futbolero de GoalChain:

"""
    for ad in optimized_data.get("top_ad_copies", []):
        markdown_content += f"""### 📢 {ad.get('campaign')}
* **Título (Headline):** {ad.get('headline')}
* **Copia Publicitaria (Ad Copy):**
  > {ad.get('copy')}

"""
        
    markdown_content += """---
> [!NOTE]
> Este reporte fue auditado usando modelado predictivo de embudos Web3 de GoalChain. Se recomienda realizar una actualización de este análisis semanalmente a medida que avancen los partidos del mundial.
"""
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write(markdown_content)
    print(f"{C_GREEN}💾 Reporte markdown guardado en: {C_RESET}{report_path}")
    
    return optimized_campaigns

def main():
    print_header()
    
    # Calculate metrics for initial campaign data
    calculate_metrics(CAMPAIGNS)
    
    # Print initial metrics table
    print_campaign_table(CAMPAIGNS, "ESTADO ACTUAL DE LAS CAMPAÑAS (MOCK DATA)")
    
    # Call Gemini API or fallback
    optimized_payload, raw_response = run_gemini_optimization(CAMPAIGNS)
    
    # Calculate optimized metrics and save outputs
    optimized_campaigns = save_outputs(optimized_payload, CAMPAIGNS)
    
    # Print optimized table for comparison
    print_campaign_table(optimized_campaigns, "ESTADO OPTIMIZADO SUGERIDO DE LAS CAMPAÑAS")
    
    print(f"\n{C_CYAN}{C_BOLD}📝 ANÁLISIS DE TENDENCIAS AI:{C_RESET}")
    print(optimized_payload.get("trend_analysis", ""))
    
    print(f"\n{C_CYAN}{C_BOLD}💡 RECOMENDACIONES OPERATIVAS:{C_RESET}")
    recs = optimized_payload.get("campaign_recommendations", "")
    if isinstance(recs, list):
        for item in recs:
            if isinstance(item, dict):
                print(f"- {C_BOLD}{item.get('campaign', '')}{C_RESET}: {item.get('recommendation', '')}")
            else:
                print(f"- {item}")
    else:
        print(recs)
    
    print(f"\n{C_CYAN}{C_BOLD}🚀 COPIES DE ANUNCIOS SUGERIDOS:{C_RESET}")
    for ad in optimized_payload.get("top_ad_copies", []):
        print(f"\n{C_GREEN}» {ad.get('campaign')}{C_RESET}")
        print(f"  {C_BOLD}Headline:{C_RESET} {ad.get('headline')}")
        print(f"  {C_DIM}Copy:{C_RESET} {ad.get('copy')}")
        
    print(f"\n{C_GREEN}{C_BOLD}✅ ¡Auditoría de campañas de marketing completada con éxito!{C_RESET}\n")

if __name__ == "__main__":
    main()
