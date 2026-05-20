from duckduckgo_search import DDGS
import json

def test_search():
    query = "Jude Bellingham face portrait close up headshot"
    print(f"Searching for: '{query}'")
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=5))
            
        print("Results:")
        print(json.dumps(results, indent=2))
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_search()
