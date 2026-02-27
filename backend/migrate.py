import sqlite3

conn = sqlite3.connect('resume2portfolio.db')
cursor = conn.cursor()

cursor.execute('PRAGMA table_info(portfolios)')
cols = [row[1] for row in cursor.fetchall()]
print('Existing columns:', cols)

if 'view_count' not in cols:
    cursor.execute('ALTER TABLE portfolios ADD COLUMN view_count INTEGER DEFAULT 0')
    print('Added: view_count')
else:
    print('Already exists: view_count')

if 'hidden_sections' not in cols:
    cursor.execute('ALTER TABLE portfolios ADD COLUMN hidden_sections TEXT DEFAULT ""')
    print('Added: hidden_sections')
else:
    print('Already exists: hidden_sections')

cursor.execute('PRAGMA table_info(users)')
user_cols = [row[1] for row in cursor.fetchall()]

if 'auth_provider' not in user_cols:
    cursor.execute('ALTER TABLE users ADD COLUMN auth_provider TEXT DEFAULT "email"')
    print('Added: auth_provider to users')
else:
    print('Already exists: auth_provider in users')

conn.commit()
conn.close()
print('Migration complete!')
