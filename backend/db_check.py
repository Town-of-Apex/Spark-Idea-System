import sqlite3

def check_db():
    conn = sqlite3.connect('spark.db')
    cursor = conn.cursor()
    
    # Check Ideas
    cursor.execute("PRAGMA table_info(ideas)")
    columns = [c[1] for c in cursor.fetchall()]
    print(f"Ideas columns: {columns}")
    
    # Check Votes
    cursor.execute("PRAGMA table_info(votes)")
    columns = [c[1] for c in cursor.fetchall()]
    print(f"Votes columns: {columns}")

    # Check Users table exists
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
    users_exists = cursor.fetchone()
    print(f"Users table exists: {bool(users_exists)}")

    conn.close()

if __name__ == "__main__":
    check_db()
