-- CreateTable
CREATE TABLE "Soundkit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "cover" TEXT NOT NULL,
    "audioPreview" TEXT NOT NULL,
    "file" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
