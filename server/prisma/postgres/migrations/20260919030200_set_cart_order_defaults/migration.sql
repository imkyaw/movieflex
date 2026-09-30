ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'CART';

CREATE INDEX "Order_userId_status_idx" ON "Order"("userId", "status");

CREATE UNIQUE INDEX "OrderDetail_orderId_movieId_key" ON "OrderDetail"("orderId", "movieId");
