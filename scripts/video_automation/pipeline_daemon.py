import os
import sys
import json
import time
import subprocess
import threading
from pathlib import Path
from datetime import datetime, timezone, timedelta

# Setup paths relative to the project base
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.append(str(BASE_DIR / "scripts" / "video_automation"))

PIPELINE_DIR = BASE_DIR / "data" / "marketing_pipeline"
TRIGGER_FILE = PIPELINE_DIR / "trigger.json"
RUNS_FILE = PIPELINE_DIR / "runs.json"
LOGS_DIR = PIPELINE_DIR / "logs"
STATUS_FILE = PIPELINE_DIR / "daemon_status.json"
LAST_AUTO_QUEUE_FILE = PIPELINE_DIR / "last_auto_queue_date.txt"

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

def update_schedule_preview():
    """Run schedule_optimizer to update schedule_preview.json"""
    preview_file = PIPELINE_DIR / "schedule_preview.json"
    print(f"[{datetime.now()}] Updating schedule preview file: {preview_file}")
    try:
        from schedule_optimizer import get_schedule_preview
        all_ids = [
            "6a283a868f1d11f9b26b0226",
            "6a283a4d8f1d11f9b26b0068",
            "6a283a328f1d11f9b26aff82",
        ]
        preview_data = get_schedule_preview(all_ids)
        with open(preview_file, "w", encoding="utf-8") as f:
            json.dump(preview_data, f, indent=2)
        print(f"[{datetime.now()}] Schedule preview file updated successfully.")
    except Exception as e:
        print(f"Error updating schedule preview file: {e}", file=sys.stderr)

def heartbeat_thread(stop_event, status_str, current_run=None, interval=10):
    """Background thread that keeps daemon_status.json fresh every `interval` seconds"""
    while not stop_event.is_set():
        update_status(status_str, current_run)
        stop_event.wait(interval)

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

    current_run_info = {"account": account, "run_id": run_id, "started_at": datetime.utcnow().isoformat() + "Z"}
    update_status("running", current_run=current_run_info)

    # Start heartbeat thread so daemon_status.json stays fresh during long video generation
    stop_hb = threading.Event()
    hb = threading.Thread(target=heartbeat_thread, args=(stop_hb, "running", current_run_info), daemon=True)
    hb.start()

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
        stop_hb.set()
        hb.join(timeout=2)

def run_match_highlights_subprocess(account, match=None, run_id=None, skip_youtube=False, skip_buffer=False):
    """Execute the match highlights generator v2 as a subprocess and stream logs"""
    if not run_id:
        run_id = f"run_{int(time.time())}_match_{account.lower()}"

    log_file_path = LOGS_DIR / f"{run_id}.log"
    print(f"[{datetime.now()}] Starting match highlights v2 for {account}. Log: {log_file_path}")

    init_run_entry(run_id, account, f"Highlights: {match}" if match else "Auto-detecting trending match...")

    cmd = [
        sys.executable,
        str(BASE_DIR / "scripts" / "video_automation" / "match_highlights_generator.py"),
        "--account", account,
        "--run-id", run_id
    ]
    if match:
        cmd.extend(["--match", match])
    if skip_youtube:
        cmd.append("--skip-youtube")
    if skip_buffer:
        cmd.append("--skip-buffer")
        
    current_run_info = {"account": account, "run_id": run_id, "started_at": datetime.utcnow().isoformat() + "Z"}
    update_status("running_match", current_run=current_run_info)
    
    stop_hb = threading.Event()
    hb = threading.Thread(target=heartbeat_thread, args=(stop_hb, "running_match", current_run_info), daemon=True)
    hb.start()
    
    try:
        with open(log_file_path, "w", encoding="utf-8", buffering=1) as log_file:
            log_file.write(f"=== HERMES MATCH HIGHLIGHTS START: {datetime.now()} ===\n")
            log_file.write(f"Account: {account}\n")
            log_file.write(f"Command: {' '.join(cmd)}\n")
            log_file.write(f"============================================\n\n")
            log_file.flush()
            
            res = subprocess.run(
                cmd,
                stdout=log_file,
                stderr=subprocess.STDOUT,
                cwd=str(BASE_DIR),
                encoding="utf-8"
            )
            
            log_file.write(f"\n============================================\n")
            log_file.write(f"=== HERMES MATCH HIGHLIGHTS END: {datetime.now()} (Exit Code: {res.returncode}) ===\n")
            
            if res.returncode == 0:
                print(f"[{datetime.now()}] Match highlights finished successfully for {account}")
            else:
                print(f"[{datetime.now()}] Match highlights failed for {account} with code {res.returncode}")
                mark_run_failed(run_id, f"Process exited with non-zero code {res.returncode}")
    except Exception as e:
        error_msg = f"Exception executing match highlights subprocess: {str(e)}"
        print(f"[{datetime.now()}] Error: {error_msg}")
        mark_run_failed(run_id, error_msg)
        with open(log_file_path, "a", encoding="utf-8") as log_file:
            log_file.write(f"\nCRITICAL DAEMON ERROR: {error_msg}\n")
    finally:
        stop_hb.set()
        hb.join(timeout=2)

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


def _prune_stuck_generating(max_age_hours: float = 6.0):
    """Reclassify any run stuck in 'generating' longer than max_age_hours as 'failed'.
    Safe to call repeatedly. Returns count of reclassified runs.
    """
    if not RUNS_FILE.exists():
        return 0
    try:
        with open(RUNS_FILE, "r", encoding="utf-8") as f:
            runs = json.load(f)
    except Exception as e:
        print(f"[prune] could not read runs.json: {e}", file=sys.stderr)
        return 0
    cutoff = datetime.now(timezone.utc).timestamp() - (max_age_hours * 3600)
    fixed = 0
    for r in runs:
        if r.get("status") == "generating":
            ts = r.get("timestamp", "")
            try:
                ts_dt = datetime.fromisoformat(ts.replace("Z", "+00:00"))
                if ts_dt.timestamp() < cutoff:
                    r["status"] = "failed"
                    r["error_message"] = r.get("error_message") or f"Aborted by daemon: stuck in generating > {max_age_hours}h"
                    fixed += 1
            except Exception:
                r["status"] = "failed"
                fixed += 1
    if fixed:
        try:
            with open(RUNS_FILE, "w", encoding="utf-8") as f:
                json.dump(runs, f, indent=2, ensure_ascii=False)
            print(f"[prune] {fixed} runs reclassified from generating -> failed")
        except Exception as e:
            print(f"[prune] could not write runs.json: {e}", file=sys.stderr)
    return fixed

def run_research_subprocess():
    """Execute the trend researcher script as a subprocess"""
    log_file_path = LOGS_DIR / "research.log"
    print(f"[{datetime.now()}] Starting trend research. Log: {log_file_path}")
    
    cmd = [
        sys.executable,
        str(BASE_DIR / "scripts" / "video_automation" / "trend_researcher.py")
    ]
    
    update_status("researching")
    stop_hb = threading.Event()
    hb = threading.Thread(target=heartbeat_thread, args=(stop_hb, "researching"), daemon=True)
    hb.start()
    
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
    finally:
        stop_hb.set()
        hb.join(timeout=2)

def check_and_refill_queue():
    """Daily check: if Buffer queue has < 5 pending posts, run research + generation to refill it"""
    try:
        from schedule_optimizer import get_pending_scheduled_times, CHANNEL_SERVICES
        from grok_super_pipeline import CHANNEL_IDS
    except ImportError as ie:
        print(f"[{datetime.now()}] Warning: Auto-refill import failed: {ie}", file=sys.stderr)
        return

    print(f"[{datetime.now()}] Running daily auto-queue refill check...")
    
    # Check each channel's Buffer queue count
    channels_to_refill = {}
    for account, cids in CHANNEL_IDS.items():
        for cid in cids:
            service = CHANNEL_SERVICES.get(cid, "instagram")
            try:
                pending = get_pending_scheduled_times(cid)
                pending_count = len(pending)
                print(f"  Channel {cid} ({service} for {account}) has {pending_count} pending posts.")
                if pending_count < 5:
                    needed = 5 - pending_count
                    channels_to_refill[account] = max(channels_to_refill.get(account, 0), needed)
            except Exception as e:
                print(f"Error checking pending posts for {cid}: {e}", file=sys.stderr)
                
    if not channels_to_refill:
        print("All channels have >= 5 pending posts. No refill needed.")
        return
        
    print(f"Refill needed for accounts: {channels_to_refill}")
    
    # 1. Run trend researcher to generate new plans
    print("Running trend researcher to gather new topics...")
    run_research_subprocess()
    
    # 2. Trigger generation of the planned runs for the accounts that need it
    try:
        if RUNS_FILE.exists():
            with open(RUNS_FILE, "r", encoding="utf-8") as f:
                runs = json.load(f)
        else:
            runs = []
            
        for account, needed in channels_to_refill.items():
            # Find planned runs for this account
            account_plans = [r for r in runs if r.get("account_name") == account and r.get("status") == "planned"]
            # Take the first `needed` plans
            plans_to_generate = account_plans[:needed]
            print(f"Account {account} needs {needed} posts. Found {len(account_plans)} plans, generating {len(plans_to_generate)}")
            
            for plan in plans_to_generate:
                run_id = plan["id"]
                print(f"Auto-refill: generating post for {account} (Run ID: {run_id})")
                run_pipeline_subprocess(account, topic=None, run_id=run_id)
                # Sleep briefly between pipeline executions
                time.sleep(5)
    except Exception as e:
        print(f"Error in auto-queue refill generation: {e}", file=sys.stderr)

def main():
    print(f"Hermes Video Automation Daemon started (PID: {os.getpid()})")
    print(f"Watching trigger file: {TRIGGER_FILE}")
    
    # Self-heal on startup: prune runs stuck in 'generating' and rebuild
    # missing video file records from filesystem via reconstruct_runs.py.
    try:
        from reconstruct_runs import main as reconstruct_main
        print(f"[{datetime.now()}] Startup self-heal: reconstruct_runs.run()")
        reconstruct_main()
    except Exception as e:
        print(f"[{datetime.now()}] Aviso: reconstruct_runs falló al arrancar: {e}")
    
    try:
        _prune_stuck_generating()
    except Exception as e:
        print(f"[{datetime.now()}] Aviso: prune_stuck_generating falló al arrancar: {e}")
    
    update_status("idle")
    last_preview_update = 0.0
    
    while True:
        try:
            update_status("idle")
            
            # Update schedule preview file periodically (every 2 hours)
            now_time = time.time()
            if now_time - last_preview_update > 7200:
                update_schedule_preview()
                last_preview_update = now_time
            
            # Daily check: after 6am UTC, run refill if not already run today
            now_utc = datetime.now(timezone.utc)
            if now_utc.hour >= 6:
                today_str = now_utc.date().isoformat()
                last_run_date = ""
                if LAST_AUTO_QUEUE_FILE.exists():
                    try:
                        last_run_date = LAST_AUTO_QUEUE_FILE.read_text().strip()
                    except Exception:
                        pass
                
                if last_run_date != today_str:
                    check_and_refill_queue()
                    try:
                        LAST_AUTO_QUEUE_FILE.write_text(today_str)
                    except Exception as e:
                        print(f"Error saving last auto-queue date: {e}", file=sys.stderr)
            
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
                elif action == "generate_match":
                    account = trigger_data.get("account_name", "GoalChainSol")
                    match = trigger_data.get("match")
                    run_id = trigger_data.get("run_id")
                    skip_youtube = trigger_data.get("skip_youtube", False)
                    skip_buffer = trigger_data.get("skip_buffer", False)
                    run_match_highlights_subprocess(account, match, run_id,
                                                   skip_youtube=skip_youtube,
                                                   skip_buffer=skip_buffer)
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
                
                # Update schedule preview immediately after processing a trigger
                update_schedule_preview()
                last_preview_update = time.time()
                    
            time.sleep(2)
        except KeyboardInterrupt:
            print("Daemon stopping...")
            break
        except Exception as e:
            print(f"Daemon loop error: {e}", file=sys.stderr)
            time.sleep(5)

if __name__ == "__main__":
    main()

