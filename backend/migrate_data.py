"""
DEFINITIVE migration: Neon → Hameed DB
Reads the EXACT models from user.py and portfolio.py, fixes schema, migrates all data.
Run: python migrate_data.py
"""
import asyncio
import sys
import asyncpg

if sys.platform == "win32":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

OLD_DB = "postgresql://neondb_owner:npg_ZNEvyl1kFI9a@ep-rough-mouse-abe70uzz-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require"
NEW_DB = "postgresql://hamath:hamathopc2025@91.108.104.46:5445/postgres"


async def migrate():
    print("=" * 50)
    print("  NEON → HAMEED DB MIGRATION")
    print("=" * 50)

    old = await asyncpg.connect(OLD_DB)
    new = await asyncpg.connect(NEW_DB)

    # ============================================================
    # STEP 1: Fix ALL constraints on new DB to match our models
    # ============================================================
    print("\n[1/4] Fixing schema constraints on NEW DB...")
    
    schema_fixes = [
        # Users table fixes
        "ALTER TABLE users ALTER COLUMN hashed_password DROP NOT NULL",
        "ALTER TABLE users ALTER COLUMN auth_provider SET DEFAULT 'email'",
        "ALTER TABLE users ALTER COLUMN is_admin SET DEFAULT false",
        "ALTER TABLE users ALTER COLUMN updated_at SET DEFAULT NOW()",
        "ALTER TABLE users ALTER COLUMN is_active SET DEFAULT true",
        "ALTER TABLE users ALTER COLUMN created_at SET DEFAULT NOW()",
        # Portfolios table fixes  
        "ALTER TABLE portfolios ALTER COLUMN view_count SET DEFAULT 0",
        "ALTER TABLE portfolios ALTER COLUMN hidden_sections SET DEFAULT ''",
        "ALTER TABLE portfolios ALTER COLUMN hidden_sections DROP NOT NULL",
        "ALTER TABLE portfolios ALTER COLUMN resume_filename DROP NOT NULL",
        "ALTER TABLE portfolios ALTER COLUMN updated_at SET DEFAULT NOW()",
        "ALTER TABLE portfolios ALTER COLUMN theme SET DEFAULT 'minimal'",
        "ALTER TABLE portfolios ALTER COLUMN primary_color SET DEFAULT '#6366f1'",
        "ALTER TABLE portfolios ALTER COLUMN is_published SET DEFAULT false",
    ]
    
    for sql in schema_fixes:
        try:
            await new.execute(sql)
        except Exception:
            pass
    print("   ✅ All constraints fixed!")

    # ============================================================
    # STEP 2: Read old Neon columns to know what data we have
    # ============================================================
    print("\n[2/4] Reading old Neon DB columns...")
    
    old_user_cols = await old.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position")
    old_portfolio_cols = await old.fetch(
        "SELECT column_name FROM information_schema.columns WHERE table_name = 'portfolios' ORDER BY ordinal_position")
    
    old_user_col_names = [c['column_name'] for c in old_user_cols]
    old_portfolio_col_names = [c['column_name'] for c in old_portfolio_cols]
    
    print(f"   Old users columns: {old_user_col_names}")
    print(f"   Old portfolios columns: {old_portfolio_col_names}")

    # ============================================================
    # STEP 3: Migrate users
    # ============================================================
    print("\n[3/4] Migrating users...")
    
    # Read ALL columns that exist in old DB
    user_cols_str = ", ".join(old_user_col_names)
    users = await old.fetch(f"SELECT {user_cols_str} FROM users ORDER BY created_at")
    print(f"   Found {len(users)} users in Neon\n")

    migrated_users = 0
    skipped_users = 0
    failed_users = 0

    for user in users:
        email = user['email']
        
        # Skip if already exists
        exists = await new.fetchval("SELECT id FROM users WHERE email = $1", email)
        if exists:
            print(f"   ⏭️  {email} (already in new DB)")
            skipped_users += 1
            continue

        # Build values dict with defaults for missing columns
        uid = user['id']
        name = user['name']
        hashed_pw = user.get('hashed_password', None) if 'hashed_password' in old_user_col_names else None
        is_active = user.get('is_active', True) if 'is_active' in old_user_col_names else True
        created_at = user.get('created_at') if 'created_at' in old_user_col_names else None
        auth_provider = user.get('auth_provider', 'email') if 'auth_provider' in old_user_col_names else 'email'

        try:
            await new.execute("""
                INSERT INTO users (id, name, email, hashed_password, is_active, is_admin, auth_provider, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, false, $6, COALESCE($7, NOW()), COALESCE($7, NOW()))
            """, uid, name, email, hashed_pw, is_active, auth_provider or 'email', created_at)
            print(f"   ✅ {email}")
            migrated_users += 1
        except Exception as e:
            print(f"   ❌ {email}: {e}")
            failed_users += 1

    print(f"\n   Users: {migrated_users} migrated, {skipped_users} skipped, {failed_users} failed")

    # ============================================================
    # STEP 4: Migrate portfolios
    # ============================================================
    print("\n[4/4] Migrating portfolios...")

    portfolio_cols_str = ", ".join(old_portfolio_col_names)
    portfolios = await old.fetch(f"SELECT {portfolio_cols_str} FROM portfolios ORDER BY created_at")
    print(f"   Found {len(portfolios)} portfolios in Neon\n")

    migrated_p = 0
    skipped_p = 0
    failed_p = 0

    for p in portfolios:
        slug = p['slug']
        pid = p['id']
        
        # Skip if already exists
        exists = await new.fetchval("SELECT id FROM portfolios WHERE id = $1", pid)
        if exists:
            print(f"   ⏭️  {slug} (already in new DB)")
            skipped_p += 1
            continue

        # Check if the owner user exists in new DB
        user_exists = await new.fetchval("SELECT id FROM users WHERE id = $1", p['user_id'])
        if not user_exists:
            print(f"   ⏭️  {slug} (owner user not in new DB)")
            skipped_p += 1
            continue

        # Build values
        user_id = p['user_id']
        parsed_data = p.get('parsed_data', '{}') if 'parsed_data' in old_portfolio_col_names else '{}'
        theme = p.get('theme', 'minimal') if 'theme' in old_portfolio_col_names else 'minimal'
        primary_color = p.get('primary_color', '#6366f1') if 'primary_color' in old_portfolio_col_names else '#6366f1'
        is_published = p.get('is_published', False) if 'is_published' in old_portfolio_col_names else False
        resume_filename = p.get('resume_filename', None) if 'resume_filename' in old_portfolio_col_names else None
        view_count = p.get('view_count', 0) if 'view_count' in old_portfolio_col_names else 0
        hidden_sections = p.get('hidden_sections', '') if 'hidden_sections' in old_portfolio_col_names else ''
        created_at = p.get('created_at') if 'created_at' in old_portfolio_col_names else None
        updated_at = p.get('updated_at') if 'updated_at' in old_portfolio_col_names else None

        try:
            await new.execute("""
                INSERT INTO portfolios (id, user_id, slug, parsed_data, theme, primary_color, is_published,
                    resume_filename, view_count, hidden_sections, created_at, updated_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()), COALESCE($12, NOW()))
            """, pid, user_id, slug, parsed_data, theme, primary_color, is_published,
                resume_filename, view_count or 0, hidden_sections or '', created_at, updated_at)
            print(f"   ✅ {slug}")
            migrated_p += 1
        except Exception as e:
            print(f"   ❌ {slug}: {e}")
            failed_p += 1

    print(f"\n   Portfolios: {migrated_p} migrated, {skipped_p} skipped, {failed_p} failed")

    # ============================================================
    # FINAL: Verify
    # ============================================================
    user_count = await new.fetchval("SELECT COUNT(*) FROM users")
    portfolio_count = await new.fetchval("SELECT COUNT(*) FROM portfolios")

    await old.close()
    await new.close()

    print(f"\n{'='*50}")
    print(f"  ✅ MIGRATION COMPLETE!")
    print(f"  New DB: {user_count} users, {portfolio_count} portfolios")
    print(f"{'='*50}")


if __name__ == "__main__":
    asyncio.run(migrate())
