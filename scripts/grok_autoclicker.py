#!/usr/bin/env python3
"""
GoalChain Grok Autoclicker
Automates sending the "continue" command to Grok projects.
Requires Chrome running with remote debugging enabled:
/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
"""
import time
import sys
import subprocess

def install_dependencies():
    try:
        import playwright
    except ImportError:
        print("[INFO] Playwright is not installed. Installing...")
        subprocess.run([sys.executable, "-m", "pip", "install", "playwright"], check=True)
        subprocess.run([sys.executable, "-m", "playwright", "install", "chromium"], check=True)

install_dependencies()

from playwright.sync_api import sync_playwright

def run_autoclicker():
    print("=== GoalChain Grok Autoclicker ===")
    print("Connecting to local Chrome at http://localhost:9222...")
    
    with sync_playwright() as p:
        try:
            # Connect to already running Chrome
            browser = p.chromium.connect_over_cdp("http://localhost:9222")
        except Exception as e:
            print(f"[ERROR] Could not connect to Chrome. Make sure Chrome is open with remote debugging:")
            print('/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222')
            sys.exit(1)
            
        print("[SUCCESS] Connected to Chrome.")
        
        # Find the Grok tab
        grok_page = None
        for context in browser.contexts:
            for page in context.pages:
                if "grok.com" in page.url:
                    grok_page = page
                    break
            if grok_page:
                break
                
        if not grok_page:
            print("[ERROR] Grok tab not found in Chrome. Please open grok.com/project/... in your Chrome window.")
            sys.exit(1)
            
        print(f"[SUCCESS] Attached to Grok tab: {grok_page.url}")
        
        # Loop monitoring
        print("Monitoring chat state... Press Ctrl+C to stop.")
        
        # Count initial occurrences of the ready text to establish a baseline
        def get_ready_count():
            try:
                # Search for elements containing the key phrases
                loc1 = grok_page.locator("text='Ready for the next batch'").count()
                loc2 = grok_page.locator("text='Type continue to proceed'").count()
                return max(loc1, loc2)
            except Exception:
                return 0

        last_ready_count = get_ready_count()
        print(f"[INFO] Initial ready message count: {last_ready_count}")
        
        while True:
            try:
                # Check if chat is active and input area is ready
                textarea = grok_page.locator("textarea").first
                
                if textarea.is_visible() and textarea.is_enabled():
                    value = textarea.input_value()
                    
                    # We only want to type if the input is empty and active
                    if value == "":
                        current_ready_count = get_ready_count()
                        
                        # Trigger if we see a new ready message, or if we have at least one and haven't triggered yet
                        if current_ready_count > last_ready_count or (current_ready_count > 0 and last_ready_count == 0):
                            print(f"[INFO] New ready message detected (count: {current_ready_count}). Sending 'continue'...")
                            
                            # Click input, type command and click submit
                            textarea.click()
                            detailed_prompt = (
                                "continue generating the next batch. Remember: English ONLY, "
                                "NO simulation (actually call get_next_visual_batch), "
                                "use exact prompts verbatim, optimize with the skill, "
                                "convert to base64, and register via upload_generated_asset."
                            )
                            textarea.fill(detailed_prompt)
                            
                            # Press Enter
                            textarea.press("Enter")
                            
                            # Update our baseline to the new count
                            last_ready_count = current_ready_count
                            
                            # Wait for Grok to start processing (so count doesn't immediately match)
                            time.sleep(15)
                            print("[INFO] Prompt sent. Waiting for next generation cycle...")
                        
                time.sleep(5)
            except KeyboardInterrupt:
                print("\n[INFO] Autoclicker stopped by user.")
                break
            except Exception as ex:
                print(f"[WARN] Error during monitoring tick: {ex}")
                time.sleep(5)

if __name__ == "__main__":
    run_autoclicker()
