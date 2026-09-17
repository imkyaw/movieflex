ALTER TABLE "WatchlistItem" DROP CONSTRAINT "WatchlistItem_userId_fkey";
ALTER TABLE "WatchlistItem" DROP CONSTRAINT "WatchlistItem_movieId_fkey";

DROP TABLE "WatchlistItem";

ALTER TABLE "OrderDetail" DROP COLUMN "returnedAt";
