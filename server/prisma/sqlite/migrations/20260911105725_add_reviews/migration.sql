-- CreateTable
CREATE TABLE "Review" (
    "reviewId" TEXT NOT NULL PRIMARY KEY,
    "movieId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Review_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("movieId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Review_movieId_idx" ON "Review"("movieId");

-- CreateIndex
CREATE UNIQUE INDEX "Review_movieId_userId_key" ON "Review"("movieId", "userId");
