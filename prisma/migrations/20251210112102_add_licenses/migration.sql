-- CreateTable
CREATE TABLE "License" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "defaultPrice" REAL NOT NULL,
    "features" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "BeatLicense" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "beatId" TEXT NOT NULL,
    "licenseId" TEXT NOT NULL,
    "price" REAL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    CONSTRAINT "BeatLicense_beatId_fkey" FOREIGN KEY ("beatId") REFERENCES "Beat" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "BeatLicense_licenseId_fkey" FOREIGN KEY ("licenseId") REFERENCES "License" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Soundkit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cover" TEXT NOT NULL,
    "audioPreview" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "genre" TEXT NOT NULL DEFAULT 'Multi-Genre',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_Soundkit" ("audioPreview", "cover", "createdAt", "description", "file", "id", "price", "title") SELECT "audioPreview", "cover", "createdAt", "description", "file", "id", "price", "title" FROM "Soundkit";
DROP TABLE "Soundkit";
ALTER TABLE "new_Soundkit" RENAME TO "Soundkit";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "BeatLicense_beatId_licenseId_key" ON "BeatLicense"("beatId", "licenseId");
