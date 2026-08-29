CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MovieStatus" AS ENUM ('ACTIVE', 'DISCONTINUED');
CREATE TYPE "OrderStatus" AS ENUM ('PAID', 'CANCELLED');

CREATE TABLE "User" (
    "userId" UUID NOT NULL,
    "cognitoSub" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("userId")
);

CREATE TABLE "Movie" (
    "movieId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "genre" TEXT NOT NULL,
    "director" TEXT NOT NULL,
    "releaseDate" DATE NOT NULL,
    "classification" TEXT NOT NULL,
    "runtimeMinutes" INTEGER NOT NULL CHECK ("runtimeMinutes" > 0),
    "priceCents" INTEGER NOT NULL CHECK ("priceCents" >= 0),
    "stock" INTEGER NOT NULL CHECK ("stock" >= 0),
    "posterKey" TEXT,
    "status" "MovieStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "Movie_pkey" PRIMARY KEY ("movieId")
);

CREATE TABLE "Order" (
    "orderId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "totalCents" INTEGER NOT NULL CHECK ("totalCents" >= 0),
    "status" "OrderStatus" NOT NULL DEFAULT 'PAID',
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("orderId")
);

CREATE TABLE "OrderDetail" (
    "id" UUID NOT NULL,
    "orderId" UUID NOT NULL,
    "movieId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL CHECK ("quantity" > 0),
    "unitPriceCents" INTEGER NOT NULL CHECK ("unitPriceCents" >= 0),
    CONSTRAINT "OrderDetail_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_cognitoSub_key" ON "User"("cognitoSub");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "Movie_genre_idx" ON "Movie"("genre");
CREATE INDEX "Movie_title_idx" ON "Movie"("title");
CREATE INDEX "Movie_status_idx" ON "Movie"("status");
CREATE INDEX "Order_userId_idx" ON "Order"("userId");
CREATE INDEX "OrderDetail_orderId_idx" ON "OrderDetail"("orderId");

ALTER TABLE "Order"
ADD CONSTRAINT "Order_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("userId")
ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "OrderDetail"
ADD CONSTRAINT "OrderDetail_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("orderId")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "OrderDetail"
ADD CONSTRAINT "OrderDetail_movieId_fkey"
FOREIGN KEY ("movieId") REFERENCES "Movie"("movieId")
ON DELETE RESTRICT ON UPDATE CASCADE;
