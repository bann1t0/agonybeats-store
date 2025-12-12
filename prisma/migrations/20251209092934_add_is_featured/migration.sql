-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Beat" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "bpm" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cover" TEXT NOT NULL,
    "audio" TEXT NOT NULL,
    "genre" TEXT NOT NULL DEFAULT 'Trap',
    "artist" TEXT NOT NULL DEFAULT 'AgonyBeats',
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Beat" ("artist", "audio", "bpm", "cover", "createdAt", "genre", "id", "key", "price", "title") SELECT "artist", "audio", "bpm", "cover", "createdAt", "genre", "id", "key", "price", "title" FROM "Beat";
DROP TABLE "Beat";
ALTER TABLE "new_Beat" RENAME TO "Beat";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
