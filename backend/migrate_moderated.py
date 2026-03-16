import sqlite3
import os

db_path = "resume2portfolio.db"

def migrate():
    if not os.path.exists(db_path):
        print(f"Database {db_path} not found.")
        return

    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()

    # Add moderation fields to portfolios
    fields = [
        ("moderation_status", "TEXT DEFAULT 'pending'"),
        ("moderation_score", "INTEGER DEFAULT 0"),
        ("moderation_reason", "TEXT"),
    ]

    for field_name, field_type in fields:
        try:
            cursor.execute(f"ALTER TABLE portfolios ADD COLUMN {field_name} {field_type}")
            print(f"Added {field_name} to portfolios table.")
        except sqlite3.OperationalError as e:
            if "duplicate column name" in str(e).lower():
                print(f"Column {field_name} already exists in portfolios.")
            else:
                print(f"Error adding {field_name}: {e}")

    # Add refresh_token to users
    try:
        cursor.execute("ALTER TABLE users ADD COLUMN refresh_token TEXT")
        print("Added refresh_token to users table.")
    except sqlite3.OperationalError as e:
        if "duplicate column name" in str(e).lower():
            print("Column refresh_token already exists in users.")
        else:
            print(f"Error adding refresh_token: {e}")

    conn.commit()
    conn.close()
    print("Migration complete.")

if __name__ == "__main__":
    migrate()
