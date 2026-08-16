import sqlite3

db_path = "/home/ubuntu/.hermes/profiles/hermes-ceo/state.db"
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get tables
cursor.execute("SELECT name FROM sqlite_master WHERE type='table';")
tables = [row[0] for row in cursor.fetchall()]
print("Tables:", tables)

# Search for the string in all columns of all tables
search_str = "%Tengo acceso%"
for table in tables:
    try:
        cursor.execute(f"PRAGMA table_info({table});")
        columns = [row[1] for row in cursor.fetchall()]
        
        # Build query
        where_clauses = []
        for col in columns:
            where_clauses.append(f"CAST({col} AS TEXT) LIKE ?")
        
        query = f"SELECT * FROM {table} WHERE " + " OR ".join(where_clauses)
        cursor.execute(query, [search_str] * len(columns))
        rows = cursor.fetchall()
        if rows:
            print(f"\nFound in table '{table}' ({len(rows)} rows):")
            for row in rows[:5]:
                print(str(row)[:300])
    except Exception as e:
        print(f"Error reading table {table}: {e}")

conn.close()
