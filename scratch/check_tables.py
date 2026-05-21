import os
import csv

BASE_DIR = "/Users/NicoPez/GoalChain"
TABLE1_PATH = os.path.join(BASE_DIR, "ai_context/table1.csv")
TABLE2_PATH = os.path.join(BASE_DIR, "ai_context/table2.csv")

def read_csv(path):
    rows = []
    if not os.path.exists(path):
        return rows
    with open(path, "r", encoding="utf-8") as f:
        reader = csv.reader(f)
        header = next(reader)
        for r in reader:
            if r:
                rows.append(r)
    return header, rows

def check():
    h1, r1 = read_csv(TABLE1_PATH)
    h2, r2 = read_csv(TABLE2_PATH)

    print("📊 TABLE 1 (Identity Test/Manual):")
    for r in r1:
        print(r)

    print("\n📊 TABLE 2 (Grok Match):")
    for r in r2:
        # Just print first 20 rows of Table 2 to inspect
        print(r)

if __name__ == "__main__":
    check()
