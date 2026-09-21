import type { SQLiteDatabase } from 'expo-sqlite';
import { CREATE_TABLES_SQL, DB_VERSION } from './schema';

export async function migrateDatabase(db: SQLiteDatabase): Promise<void> {
  // Get current version
  const result = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  const currentVersion = result?.user_version ?? 0;

  if (currentVersion >= DB_VERSION) return;

  // Run all table creation (idempotent with IF NOT EXISTS)
  await db.execAsync(CREATE_TABLES_SQL);

  // Version-specific migrations
  if (currentVersion < 1) {
    // v1: initial schema — already handled above
  }

  if (currentVersion < 2) {
    // v2: add sort_order to allocation_slices if upgrading from v1
    try {
      await db.execAsync(`
        ALTER TABLE allocation_slices ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
      `);
    } catch {
      // Column may already exist
    }
  }

  if (currentVersion < 3) {
    // v3: add image_url to wishlist if upgrading
    try {
      await db.execAsync(`
        ALTER TABLE wishlist ADD COLUMN image_url TEXT;
      `);
    } catch {
      // Column may already exist
    }
  }

  // Update version
  await db.execAsync(`PRAGMA user_version = ${DB_VERSION}`);
}
