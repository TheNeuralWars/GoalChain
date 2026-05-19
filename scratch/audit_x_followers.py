import requests
import re
from requests_oauthlib import OAuth1

CONSUMER_KEY = "YLTNgANFNTzMkj4AqIUaH8IDI"
CONSUMER_SECRET = "HYDJ1Q4iU1HVgkerKVcjGxoGsZksrUMXg3iHOfmyJMGzHHfoML"
ACCESS_TOKEN = "2054634242458386432-QMqQ9pL54o0tZRbjeYnHXHLroOsSd5"
ACCESS_TOKEN_SECRET = "mW1euCPmhwDAH0DLOG4aGYLikTTp7F91cqOPtXE5Vkz3X"
auth = OAuth1(CONSUMER_KEY, CONSUMER_SECRET, ACCESS_TOKEN, ACCESS_TOKEN_SECRET)

def check_consonant_keymash(handle):
    # If the handle has 5+ consonants in a row, it's highly likely a keymash
    consonants = "bcdfghjklmnpqrstvwxyz"
    max_consecutive = 0
    current = 0
    for char in handle.lower():
        if char in consonants:
            current += 1
            max_consecutive = max(max_consecutive, current)
        else:
            current = 0
    return max_consecutive >= 5

def audit_followers():
    print("🚀 Starting X Followers Security Audit for @GoalChainDotFun...")
    
    # 1. Fetch current user detail
    me_url = "https://api.twitter.com/2/users/me"
    me_req = requests.get(me_url, auth=auth)
    if me_req.status_code != 200:
        print(f"❌ Error fetching self details: {me_req.text}")
        return
        
    my_id = me_req.json().get("data")['id']
    
    # 2. Fetch all followers (up to 100)
    followers_url = f"https://api.twitter.com/2/users/{my_id}/followers"
    params = {
        "max_results": 100,
        "user.fields": "created_at,description,public_metrics,profile_image_url"
    }
    
    followers_req = requests.get(followers_url, auth=auth, params=params)
    if followers_req.status_code != 200:
        print(f"❌ Error fetching followers list: {followers_req.status_code} - {followers_req.text}")
        return
        
    followers = followers_req.json().get("data", [])
    print(f"📊 Fetched {len(followers)} followers for audit.\n")
    
    bots = []
    suspicious = []
    legitimate = []
    
    # Standard bot detection heuristics
    for f in followers:
        handle = f['username']
        name = f['name']
        desc = f.get('description', '')
        metrics = f.get('public_metrics', {})
        created_at = f.get('created_at', '')
        
        followers_count = metrics.get('followers_count', 0)
        following_count = metrics.get('following_count', 0)
        tweet_count = metrics.get('tweet_count', 0)
        
        # Scoring variables
        bot_score = 0
        reasons = []
        
        # Heuristic 1: Keymash handle (e.g. mhhnnuu)
        if check_consonant_keymash(handle):
            bot_score += 4
            reasons.append("Keymash handle (high consonant density)")
            
        # Heuristic 2: Name + long digit string (e.g. AlabiTaiwo5777, norh15331)
        if re.search(r"[a-zA-Z]{3,}[0-9]{4,}$", handle):
            bot_score += 3
            reasons.append("Standard bot template (Name + 4+ digits)")
            
        # Heuristic 3: High Following to Followers Ratio (Spammer)
        if following_count > 100 and followers_count < 10:
            bot_score += 4
            ratio = following_count / max(1, followers_count)
            reasons.append(f"Spammer ratio (Following: {following_count}, Followers: {followers_count}, Ratio: {ratio:.1f}x)")
            
        # Heuristic 4: Inactive / Empty Profile
        if tweet_count == 0:
            bot_score += 2
            reasons.append("No posts / Completely inactive")
            
        if not desc or desc.strip() == "":
            bot_score += 1
            reasons.append("Empty profile description")
            
        # Heuristic 5: Brand new account
        if created_at and ("2025" in created_at or "2026" in created_at) and following_count > 200 and followers_count < 5:
            bot_score += 3
            reasons.append("Recently created heavy-following account")
            
        # Classify
        f_details = {
            "handle": handle,
            "name": name,
            "followers": followers_count,
            "following": following_count,
            "posts": tweet_count,
            "desc": desc,
            "reasons": reasons,
            "score": bot_score
        }
        
        if bot_score >= 5:
            bots.append(f_details)
        elif bot_score >= 3:
            suspicious.append(f_details)
        else:
            legitimate.append(f_details)
            
    # Sort by bot score descending
    bots.sort(key=lambda x: x['score'], reverse=True)
    suspicious.sort(key=lambda x: x['score'], reverse=True)
    
    # Write beautiful report file
    report_path = "/Users/NicoPez/GoalChain/scratch/x_followers_audit_report.md"
    with open(report_path, "w", encoding="utf-8") as rep:
        rep.write("# 🛡️ Audit Report: X Followers Bot Analysis\n\n")
        rep.write(f"This security report analyzes the current **{len(followers)} followers** of `@GoalChainDotFun` to identify bots and spam accounts.\n\n")
        
        rep.write("## 📊 Summary of Findings\n")
        rep.write(f"- 🔴 **Highly Suspicious (Bots):** {len(bots)} accounts (Should be blocked/removed)\n")
        rep.write(f"- 🟡 **Suspicious (Low Quality):** {len(suspicious)} accounts (Monitor closely)\n")
        rep.write(f"- 🟢 **Legitimate Users:** {len(legitimate)} accounts (Real Web3 audience/supporters)\n\n")
        
        rep.write("## 🔴 Highly Suspicious (Bots) - Recommended to Block\n")
        if not bots:
            rep.write("*No highly suspicious bot accounts found.*\n")
        else:
            rep.write("| Account | Details | Public Stats | Primary Triggers |\n")
            rep.write("| :--- | :--- | :--- | :--- |\n")
            for b in bots:
                stats = f"👥 {b['followers']} / 🎯 {b['following']} / 📝 {b['posts']}"
                rep.write(f"| **@{b['handle']}**<br>_{b['name']}_ | {b['desc'][:50]}... | {stats} | {', '.join(b['reasons'])} |\n")
                
        rep.write("\n## 🟡 Suspicious (Low Quality) - Keep Under Review\n")
        if not suspicious:
            rep.write("*No moderately suspicious accounts found.*\n")
        else:
            rep.write("| Account | Details | Public Stats | Primary Triggers |\n")
            rep.write("| :--- | :--- | :--- | :--- |\n")
            for s in suspicious:
                stats = f"👥 {s['followers']} / 🎯 {s['following']} / 📝 {s['posts']}"
                rep.write(f"| **@{s['handle']}**<br>_{s['name']}_ | {s['desc'][:50]}... | {stats} | {', '.join(s['reasons'])} |\n")
                
        rep.write("\n## 🟢 Legitimate & Active Accounts\n")
        rep.write("These accounts show natural, organic behavior, active tweets, real bios, or proportional follower ratios:\n\n")
        for idx, l in enumerate(legitimate[:30]):
            rep.write(f"{idx+1}. **@{l['handle']}** ({l['name']}) - 👥 {l['followers']} followers / 📝 {l['posts']} posts - _{l['desc'][:80]}_\n")
            
        if len(legitimate) > 30:
            rep.write(f"\n_... and {len(legitimate) - 30} more legitimate accounts._\n")
            
    print(f"✅ Audit complete! Report written to: {report_path}")
    print(f"🔴 Found {len(bots)} highly likely bots.")
    print(f"🟡 Found {len(suspicious)} suspicious profiles.")
    print(f"🟢 Found {len(legitimate)} legitimate profiles.")

if __name__ == "__main__":
    audit_followers()
