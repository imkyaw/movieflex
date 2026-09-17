CREATE TABLE "Review" (
    "reviewId" UUID NOT NULL,
    "movieId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT NOT NULL,
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ NOT NULL,
    CONSTRAINT "Review_pkey" PRIMARY KEY ("reviewId")
);

CREATE INDEX "Review_movieId_idx" ON "Review"("movieId");
CREATE UNIQUE INDEX "Review_movieId_userId_key" ON "Review"("movieId", "userId");

ALTER TABLE "Review"
ADD CONSTRAINT "Review_movieId_fkey"
FOREIGN KEY ("movieId") REFERENCES "Movie"("movieId")
ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Review"
ADD CONSTRAINT "Review_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("userId")
ON DELETE CASCADE ON UPDATE CASCADE;
