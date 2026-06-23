import os
import sys
import json
import time
import subprocess
from pathlib import Path
from datetime import datetime

# Setup paths relative to the project base
BASE_DIR = Path(__file__).resolve().parent.parent.parent
PIPELINE_DIR = BASE_DIR / "data" / "marketing_pipeline"
TRIGGER_FILE = PIPELINE_DIR / "trigger.json"
RUNS_FILE = PIPELINE_DIR / "runs.json"
LOGS_DIR = PIPELINE_DIR / "logs"
STATUS_FILE = PIPELINE_DIR / "daemon_status.json"

# Create directories
PIPELINE_DIR.mkdir(parents=True, exist_ok=True)
LOGS_DIR.mkdir(parents=True, exist_ok=True)

def update_status(status_str, current_run=None):
    """Write current daemon status so Express API can read it"""
    status_data = {
        "status": status_str,
        "pid": os.getpid(),
        "last_check": datetime.utcnow().isoformat() + "Z",
        "current_run": current_run
    }
    try:
        with open(STATUS_FILE, "w", encoding="utf-8") as f:
            json.dump(status_data, f, indent=2)
    except Exception as e:
        print(f"Error writing status file: {e}", file=sys.stderr)

def run_pipeline_subprocess(account, topic=None, run_id=None):
    """Execute the pipeline script as a subprocess and stream logs to a file"""
    if not run_id:
        run_id = f"run_{int(time.time())}_{account.lower()}"
    
    log_file_path = LOGS_DIR / f"{run_id}.log"
    print(f"[{datetime.now()}] Starting pipeline for {account}. Log: {log_file_path}")
    
    # Initialize the run entry in runs.json as "generating"
    init_run_entry(run_id, account, topic)
    
    # Construct subprocess command
    cmd = [
        sys.executable,
        str(BASE_DIR / "scripts" / "video_automation" / "grok_super_pipeline.py"),
        "--account", account
    ]
    if topic:
        cmd.extend(["--topic", topic])
    else:
        cmd.append("--auto-topic")
        
    cmd.extend(["--run-id", run_id])

    update_status("running", current_run={"account": account, "run_id": run_id, "started_at": datetime.utcnow().isoformat() + "Z"})

    # Run and write logs
    try:
        with open(log_file_path, "w", encoding="utf-8", buffering=1) as log_file:
            log_file.write(f"=== HERMES PIPELINE START: {datetime.now()} ===\n")
            log_file.write(f"Account: {account}\n")
            log_file.write(f"Command: {' '.join(cmd)}\n")
            log_file.write(f"============================================\n\n")
            log_file.flush()
            
            # Execute subprocess, merging stderr into stdout
            res = subprocess.run(
                cmd,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd=str(BASE_DIR),
                encoding="utf-8"
            )
            
            log_file.write(f"\n============================================\n")
            log_file.write(f"=== HERMES PIPELINE END: {datetime.now()} (Exit Code: {res.returncode}) ===\n")
            
            if res.returncode == 0:
                print(f"[{datetime.now()}] Pipeline finished successfully for {account}")
            else:
                print(f"[{datetime.now()}] Pipeline failed for {account} with code {res.returncode}")
                mark_run_failed(run_id, f"Process exited with non-zero code {res.returncode}")
                
    except Exception as e:
        error_msg = f"Exception executing pipeline subprocess: {str(e)}"
        print(f"[{datetime.now()}] Error: {error_msg}")
        mark_run_failed(run_id, error_msg)
        with open(log_file_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"\nCRITICAL DAEMON ERROR: {error_msg}\n")

def init_run_entry(run_id, account, topic):
    """Insert a placeholder run entry into runs.json"""
    try:
        runs = []
        if RUNS_FILE.exists():
            with open(RUNS_FILE, "r", encoding="utf-8") as f:
                runs = json.load(f)
        
        # Avoid duplicate runs
        if any(r.get("id") == run_id for r in runs):
            return

        new_run = {
            "id": run_id,
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "account_name": account,
            "topic": topic or "Generando tema...",
            "status": "generating",
            "image_url": "",
            "video_url": "",
            "post_text": "",
            "comments": []
        }
        
        runs.insert(0, new_run) # Newest first
        
        with open(RUNS_FILE, "w", encoding="utf-8") as f:
            json.dump(runs, f, indent=2)
    except Exception as e:
        print(f"Error initializing run entry: {e}", file=sys.stderr)

def mark_run_failed(run_id, error_msg):
    """Mark a run as failed in runs.json if subprocess failed before pipeline could update it"""
    try:
        if not RUNS_FILE.exists():
            return
            
        with open(RUNS_FILE, "r", encoding="utf-8") as f:
            runs = json.load(f)
            
        updated = False
        for r in runs:
            if r.get("id") == run_id:
                if r.get("status") == "generating":
                    r["status"] = "failed"
                    r["error_message"] = error_msg
                    updated = True
                break
                
        if updated:
            with open(RUNS_FILE, "w", encoding="utf-8") as f:
                json.dump(runs, f, indent=2)
    except Exception as e:
        print(f"Error marking run failed: {e}", file=sys.stderr)

def get_account_for_run(run_id):
    """Lookup the account name for a specific run in runs.json"""
    try:
        if RUNS_FILE.exists():
            with open(RUNS_FILE, "r", encoding="utf-8") as f:
                runs = json.load(f)
            for r in runs:
                if r.get("id") == run_id:
                    return r.get("account_name")
    except Exception as e:
        print(f"Error looking up account for run: {e}", file=sys.stderr)
    return None

def run_research_subprocess():
    """Execute the trend researcher script as a subprocess"""
    log_file_path = LOGS_DIR / "research.log"
    print(f"[{datetime.now()}] Starting trend research. Log: {log_file_path}")
    
    cmd = [
        sys.executable,
        str(BASE_DIR / "scripts" / "video_automation" / "trend_researcher.py")
    ]
    
    update_status("researching")
    
    try:
        with open(log_file_path, "w", encoding="utf-8", buffering=1) as log_file:
            log_file.write(f"=== HERMES TREND RESEARCH START: {datetime.now()} ===\n")
            log_file.flush()
            
            res = subprocess.run(
                cmd,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd=str(BASE_DIR),
                encoding="utf-8"
            )
            
            log_file.write(f"\n=== HERMES TREND RESEARCH END: {datetime.now()} (Exit Code: {res.returncode}) ===\n")
            if res.returncode == 0:
                print(f"[{datetime.now()}] Trend research finished successfully")
            else:
                print(f"[{datetime.now()}] Trend research failed with code {res.returncode}")
    except Exception as e:
        print(f"[{datetime.now()}] Error running research: {e}")

def main():
    print(f"Hermes Video Automation Daemon started (PID: {os.getpid()})")
    print(f"Watching trigger file: {TRIGGER_FILE}")
    
    update_status("idle")
    
    while True:
        try:
            update_status("idle")
            
            if TRIGGER_FILE.exists():
                print(f"[{datetime.now()}] Trigger detected!")
                trigger_data = {}
                try:
                    with open(TRIGGER_FILE, "r", encoding="utf-8") as f:
                        trigger_data = json.load(f)
                except Exception as e:
                    print(f"Error reading trigger JSON: {e}. Running default pipeline.")
                
                # Delete the trigger file immediately to prevent duplicate runs
                try:
                    TRIGGER_FILE.unlink()
                except Exception as e:
                    print(f"Error deleting trigger file: {e}")
                
                action = trigger_data.get("action", "generate")
                
                if action == "research":
                    run_research_subprocess()
                elif action == "generate_planned":
                    run_id = trigger_data.get("run_id")
                    if run_id:
                        account = get_account_for_run(run_id)
                        if account:
                            run_pipeline_subprocess(account, topic=None, run_id=run_id)
                        else:
                            print(f"[{datetime.now()}] Error: Could not find account for planned run {run_id}")
                    else:
                        print(f"[{datetime.now()}] Error: generate_planned triggered without run_id")
                else: # Default generate action
                    account = trigger_data.get("account_name", "both")
                    topic = trigger_data.get("topic")
                    
                    if account == "both":
                        # Execute for both accounts sequentially (avoiding concurrent Grok runs)
                        run_id1 = f"run_{int(time.time())}_nicopezdorado"
                        run_pipeline_subprocess("NicoPezDorado", topic, run_id=run_id1)
                        
                        # Sleep briefly between runs to allow timestamp differentiation
                        time.sleep(2)
                        
                        run_id2 = f"run_{int(time.time())}_goalchainsol"
                        run_pipeline_subprocess("GoalChainSol", topic, run_id=run_id2)
                    else:
                        run_pipeline_subprocess(account, topic)
                    
            time.sleep(2)
        except KeyboardInterrupt:
            print("Daemon stopping...")
            break
        except Exception as e:
            print(f"Daemon loop error: {e}", file=sys.stderr)
            time.sleep(5)

if __name__ == "__main__":
    main()

