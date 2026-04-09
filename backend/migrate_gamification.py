import sqlite3
import os

def migrate():
    db_path = os.path.join(os.path.dirname(__file__), 'spark.db')
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # 1. Add login_count to users if it doesn't exist
    cursor.execute("PRAGMA table_info(users)")
    columns = [c[1] for c in cursor.fetchall()]
    if "login_count" not in columns:
        print("Adding login_count to users table...")
        cursor.execute("ALTER TABLE users ADD COLUMN login_count INTEGER DEFAULT 0")
    
    # 2. Create user_achievements table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS user_achievements (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL REFERENCES users(id),
        achievement_id TEXT NOT NULL,
        achieved_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        notified BOOLEAN DEFAULT 0,
        UNIQUE(user_id, achievement_id)
    )
    """)
    print("Created user_achievements table (if not exists).")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
