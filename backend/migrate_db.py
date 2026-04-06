import sqlite3

def migrate():
    conn = sqlite3.connect('spark.db')
    cursor = conn.cursor()
    
    # 1. Add user_id to ideas if it doesn't exist
    cursor.execute("PRAGMA table_info(ideas)")
    columns = [c[1] for c in cursor.fetchall()]
    if "user_id" not in columns:
        print("Adding user_id to ideas table...")
        cursor.execute("ALTER TABLE ideas ADD COLUMN user_id INTEGER REFERENCES users(id)")
    
    # 2. Add user_id to votes if it doesn't exist
    cursor.execute("PRAGMA table_info(votes)")
    columns = [c[1] for c in cursor.fetchall()]
    if "user_id" not in columns:
        print("Adding user_id to votes table...")
        cursor.execute("ALTER TABLE votes ADD COLUMN user_id INTEGER REFERENCES users(id)")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
