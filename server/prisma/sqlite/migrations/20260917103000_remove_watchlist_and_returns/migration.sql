-- DropIndex
DROP INDEX "WatchlistItem_userId_movieId_key";

-- DropIndex
DROP INDEX "WatchlistItem_userId_idx";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "WatchlistItem";
PRAGMA foreign_keys=on;

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_OrderDetail" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "movieId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceCents" INTEGER NOT NULL,
    CONSTRAINT "OrderDetail_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order" ("orderId") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "OrderDetail_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie" ("movieId") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_OrderDetail" ("id", "movieId", "orderId", "quantity", "title", "unitPriceCents") SELECT "id", "movieId", "orderId", "quantity", "title", "unitPriceCents" FROM "OrderDetail";
DROP TABLE "OrderDetail";
ALTER TABLE "new_OrderDetail" RENAME TO "OrderDetail";
CREATE INDEX "OrderDetail_orderId_idx" ON "OrderDetail"("orderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
