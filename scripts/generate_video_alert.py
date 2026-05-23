#!/usr/bin/env python3
import os
import sys
import argparse
import subprocess
import json

def main():
    parser = argparse.ArgumentParser(description="GoalChain Video Alert Generator (Hyperframes)")
    parser.add_argument("--teamA", default="Argentina", help="Name of Team A")
    parser.add_argument("--teamB", default="Francia", help="Name of Team B")
    parser.add_argument("--scoreA", default="2", help="Score of Team A")
    parser.add_argument("--scoreB", default="1", help="Score of Team B")
    parser.add_argument("--eventText", default="Messi anotó (82')", help="Oracle event description text")
    parser.add_argument("--yieldChange", default="+15.4%", help="Yield boost change percentage")
    parser.add_argument("-o", "--output", default="output.mp4", help="Output MP4 file path (relative to current directory or absolute)")

    args = parser.parse_args()

    # Determine script and project paths
    script_dir = os.path.dirname(os.path.abspath(__file__))
    comp_dir = os.path.join(script_dir, "marketing", "video-automation")
    
    # Make sure output path is absolute
    output_abs_path = os.path.abspath(args.output)
    
    # Ensure directory of output path exists
    output_dir = os.path.dirname(output_abs_path)
    if not os.path.exists(output_dir):
        os.makedirs(output_dir, exist_ok=True)

    print("--- GoalChain Programmatic Video Generator ---")
    print(f"Team A: {args.teamA} ({args.scoreA})")
    print(f"Team B: {args.teamB} ({args.scoreB})")
    print(f"Event:  {args.eventText}")
    print(f"Yield:  {args.yieldChange}")
    print(f"Output: {output_abs_path}")
    print("---------------------------------------------")

    # Build the variables dictionary
    variables = {
        "teamA": args.teamA,
        "teamB": args.teamB,
        "scoreA": args.scoreA,
        "scoreB": args.scoreB,
        "eventText": args.eventText,
        "yieldChange": args.yieldChange
    }
    
    variables_json = json.dumps(variables)
    
    # Compile the command to execute
    # Run npx hyperframes render in the composition directory
    cmd = [
        "npx", "--yes", "hyperframes@0.6.36", "render",
        "--variables", variables_json,
        "-o", output_abs_path
    ]
    
    print(f"Running command in {comp_dir}:")
    print(f"  {' '.join(cmd)}")
    print("\nStarting Hyperframes rendering (this may take 10-30 seconds depending on system and cache)...")
    
    try:
        # Run the command
        result = subprocess.run(
            cmd,
            cwd=comp_dir,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        print("✅ Rendering completed successfully!")
        print(result.stdout)
        if result.stderr:
            print("Stderr output:")
            print(result.stderr)
        
        # Verify output file exists
        if os.path.exists(output_abs_path):
            size_mb = os.path.getsize(output_abs_path) / (1024 * 1024)
            print(f"🎉 Generated Video: {output_abs_path} ({size_mb:.2f} MB)")
        else:
            print("❌ Error: Render command reported success, but output file was not found!")
            sys.exit(1)
            
    except subprocess.CalledProcessError as e:
        print("❌ Hyperframes rendering failed!")
        print(f"Exit code: {e.returncode}")
        print("Stdout:")
        print(e.stdout)
        print("Stderr:")
        print(e.stderr)
        sys.exit(e.returncode)

if __name__ == "__main__":
    main()
