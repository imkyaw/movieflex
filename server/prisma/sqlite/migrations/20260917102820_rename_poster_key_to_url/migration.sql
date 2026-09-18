/*
  Warnings:

  - You are about to drop the column `posterKey` on the `Movie` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Movie" (
    "movieId" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "releaseDate" DATETIME NOT NULL,
    "classification" TEXT NOT NULL,
    "runtimeMinutes" INTEGER NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL,
    "posterUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Movie" ("classification", "createdAt", "description", "director", "genre", "movieId", "priceCents", "releaseDate", "runtimeMinutes", "status", "stock", "title", "updatedAt") SELECT "classification", "createdAt", "description", "director", "genre", "movieId", "priceCents", "releaseDate", "runtimeMinutes", "status", "stock", "title", "updatedAt" FROM "Movie";
DROP TABLE "Movie";
ALTER TABLE "new_Movie" RENAME TO "Movie";
CREATE INDEX "Movie_genre_idx" ON "Movie"("genre");
CREATE INDEX "Movie_title_idx" ON "Movie"("title");
CREATE INDEX "Movie_status_idx" ON "Movie"("status");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
