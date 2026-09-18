CREATE TABLE "WatchlistItem" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "movieId" UUID NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WatchlistItem_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "WatchlistItem_userId_idx" ON "WatchlistItem"("userId");
CREATE UNIQUE INDEX "WatchlistItem_userId_movieId_key" ON "WatchlistItem"("userId", "movieId");

ALTER TABLE "WatchlistItem"
ADD CONSTRAINT "WatchlistItem_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("userId")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "WatchlistItem"
ADD CONSTRAINT "WatchlistItem_movieId_fkey"
FOREIGN KEY ("movieId") REFERENCES "Movie"("movieId")
ON DELETE CASCADE ON UPDATE CASCADE;
