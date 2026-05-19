import requests

BEARER_TOKEN = "AAAAAAAAAAAAAAAAAAAAAF1o9gEAAAAAwCqZKPp7E9vKg6rRs1bgUuHC8Gc%3DsQvb0q8ku3L1MQoV5nkZtzxPLzcAj7SvDkqokV4721c1lH86De"
headers = {"Authorization": f"Bearer {BEARER_TOKEN}"}

def get_tweet_details(tweet_ids):
    print(f"🔍 Fetching details for tweets: {tweet_ids}...")
    ids_str = ",".join(tweet_ids)
    url = f"https://api.twitter.com/2/tweets?ids={ids_str}&tweet.fields=created_at,author_id,text,entities"
    
    req = requests.get(url, headers=headers)
    if req.status_code == 200:
        data = req.json()
        for tweet in data.get("data", []):
            print(f"\nTweet ID: {tweet['id']}")
            print(f"Author ID: {tweet.get('author_id')}")
            print(f"Text: {tweet['text']}")
            if 'entities' in tweet and 'urls' in tweet['entities']:
                print("URLs:")
                for url_info in tweet['entities']['urls']:
                    print(f"  - Short: {url_info.get('url')}")
                    print(f"  - Expanded: {url_info.get('expanded_url')}")
                    print(f"  - Display: {url_info.get('display_url')}")
    else:
        print(f"❌ Error: {req.status_code} - {req.text}")

if __name__ == "__main__":
    get_tweet_details(["2052046609022869652"])
