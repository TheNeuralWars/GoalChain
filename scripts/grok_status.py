import json
import subprocess
import os
import sys

def run_cmd(cmd):
    try:
        res = subprocess.run(cmd, shell=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=10)
        return res.stdout.strip(), res.returncode
    except Exception as e:
        return str(e), -1

def get_system_metrics():
    load, _ = run_cmd("cat /proc/loadavg")
    load_parts = load.split()[:3] if load else ["N/A", "N/A", "N/A"]
    
    mem_out, _ = run_cmd("free -m | grep 'Mem:'")
    mem_parts = mem_out.split()
    mem_total = mem_parts[1] + "MB" if len(mem_parts) > 1 else "N/A"
    mem_used = mem_parts[2] + "MB" if len(mem_parts) > 2 else "N/A"
    mem_available = mem_parts[6] + "MB" if len(mem_parts) > 6 else "N/A"
    
    df_out, _ = run_cmd("df -h / | tail -n 1")
    df_parts = df_out.split()
    disk_used = df_parts[2] if len(df_parts) > 2 else "N/A"
    disk_total = df_parts[1] if len(df_parts) > 1 else "N/A"
    disk_percent = df_parts[4] if len(df_parts) > 4 else "N/A"
    
    return {
        "load_average": load_parts,
        "memory": {"total": mem_total, "used": mem_used, "available": mem_available},
        "disk": {"total": disk_total, "used": disk_used, "percent": disk_percent}
    }

def get_systemd_gateways():
    cmd = "systemctl --user list-units --type=service --no-legend 2>/dev/null | grep -E 'hermes-gateway|oa-'"
    out, code = run_cmd(cmd)
    gateways = {}
    if out:
        for line in out.splitlines():
            parts = line.split()
            if len(parts) >= 4:
                unit = parts[0]
                state = parts[3]
                gateways[unit] = state
    return gateways

def get_pm2_services():
    out, code = run_cmd("pm2 jlist 2>/dev/null")
    pm2_list = []
    if code == 0 and out:
        try:
            data = json.loads(out)
            for item in data:
                pm2_list.append({
                    "name": item.get("name"),
                    "status": item.get("pm2_env", {}).get("status"),
                    "restarts": item.get("pm2_env", {}).get("restart_time", 0),
                    "memory_mb": round(item.get("monit", {}).get("memory", 0) / (1024*1024), 1),
                    "cpu_percent": item.get("monit", {}).get("cpu", 0)
                })
        except Exception:
            pass
    return pm2_list

def get_docker_containers():
    out, code = run_cmd("docker ps -a --format '{{.Names}}:::{{.Status}}'")
    containers = {}
    if code == 0 and out:
        for line in out.splitlines():
            if ":::" in line:
                parts = line.split(":::")
                name = parts[0].strip()
                status = parts[1].strip()
                healthy = "healthy" in status.lower() or ("up" in status.lower() and "unhealthy" not in status.lower())
                containers[name] = {"status": status, "healthy": healthy}
    return containers

def get_broken_alerts():
    broken = []
    containers = get_docker_containers()
    critical_containers = ["omniroute", "postiz", "twenty-app", "mattermost-app", "temporal"]
    for c in critical_containers:
        if c not in containers:
            broken.append(f"Docker container '{c}' no esta en ejecucion")
        elif not containers[c]["healthy"]:
            broken.append(f"Docker container '{c}' estado: {containers[c]['status']}")
            
    gateways = get_systemd_gateways()
    for g, state in gateways.items():
        if state != "running":
            broken.append(f"Systemd servicio '{g}' no esta running (estado: {state})")
            
    pm2s = get_pm2_services()
    for p in pm2s:
        if p["status"] != "online":
            broken.append(f"PM2 daemon '{p['name']}' estado: {p['status']}")
            
    return broken

def main():
    as_json = "--json" in sys.argv
    sys_metrics = get_system_metrics()
    gateways = get_systemd_gateways()
    pm2s = get_pm2_services()
    containers = get_docker_containers()
    broken = get_broken_alerts()
    
    result = {
        "status": "HEALTHY" if len(broken) == 0 else "ATTENTION_REQUIRED",
        "system": sys_metrics,
        "broken_alerts": broken,
        "systemd_gateways": gateways,
        "pm2_daemons": {p["name"]: p["status"] for p in pm2s},
        "docker_containers": {k: v["status"] for k, v in containers.items()}
    }
    
    if as_json:
        print(json.dumps(result, indent=2))
        return

    print("=== ESTADO GENERAL GOALWORLD / HERMES ===")
    print(f"Estado: {result['status']}")
    print(f"Carga CPU: {', '.join(sys_metrics['load_average'])} | RAM: {sys_metrics['memory']['used']}/{sys_metrics['memory']['total']} | Disco: {sys_metrics['disk']['percent']}")
    print("\n--- Gateways & Daemons ---")
    for g, state in gateways.items():
        print(f"  [Systemd] {g:<32}: {state}")
    for p in pm2s:
        print(f"  [PM2]     {p['name']:<32}: {p['status']} ({p['memory_mb']}MB, reinicios: {p['restarts']})")
    
    print("\n--- Contenedores Docker Principales ---")
    key_docker = ["omniroute", "postiz", "twenty-app", "mattermost-app", "temporal", "goalworld-api", "lukoofit-api-1"]
    for kd in key_docker:
        st = containers.get(kd, {}).get("status", "NO CORRIENDO")
        print(f"  [Docker]  {kd:<32}: {st}")
        
    print("\n--- Alertas / Que esta roto ---")
    if broken:
        for b in broken:
            print(f"  [!] {b}")
    else:
        print("  Ninguna falla detectada. Todos los servicios monitoreados estan OK.")

if __name__ == "__main__":
    main()
