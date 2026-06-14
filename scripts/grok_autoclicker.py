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
        while True:
            try:
                # Check if chat is active and input area is ready
                # Selector for input area: textarea with placeholder or similar
                textarea = grok_page.locator("textarea").first
                
                # Check if send button is visible and active (not loading)
                # Usually, when generating, the send button turns into a stop icon or disappears
                # Let's check if we can locate the submit button
                submit_button = grok_page.locator("button[type='submit'], button:has(svg)").last
                
                if textarea.is_visible() and textarea.is_enabled():
                    # Check if the text box placeholder contains "Pregunta" or similar and is empty
                    placeholder = textarea.get_attribute("placeholder") or ""
                    value = textarea.input_value()
                    
                    # We only want to type if the input is empty and active
                    if value == "":
                        # Check last message contents if possible to verify we are ready
                        # Or just send "continue" if the input is enabled and we've been waiting
                        print("[INFO] Chat input is ready. Sending 'continue'...")
                        
                        # Click input, type "continue" and click submit
                        textarea.click()
                        textarea.fill("continue")
                        
                        # Press Enter or click send
                        textarea.press("Enter")
                        
                        # Wait a bit for the input to process and send
                        time.sleep(10)
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
