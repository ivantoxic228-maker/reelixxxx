ALTER TABLE "User" ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER';
ALTER TABLE "Post" ADD COLUMN "views" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Post" ADD COLUMN "isFeatured" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN "isHidden" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Post" ADD COLUMN "soundId" TEXT;
CREATE TABLE "Sound" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "artist" TEXT NOT NULL,
  "audioUrl" TEXT NOT NULL,
  "coverUrl" TEXT,
  "duration" DOUBLE PRECISION,
  "source" TEXT NOT NULL DEFAULT 'creator',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Sound_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "PostView" (
  "id" TEXT NOT NULL,
  "postId" TEXT NOT NULL,
  "userId" TEXT,
  "watchMs" INTEGER NOT NULL DEFAULT 0,
  "completed" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PostView_pkey" PRIMARY KEY ("id")
);
CREATE INDEX "Post_isFeatured_isHidden_createdAt_idx" ON "Post"("isFeatured","isHidden","createdAt");
CREATE INDEX "Sound_isActive_createdAt_idx" ON "Sound"("isActive","createdAt");
CREATE INDEX "PostView_postId_createdAt_idx" ON "PostView"("postId","createdAt");
CREATE INDEX "PostView_userId_createdAt_idx" ON "PostView"("userId","createdAt");
ALTER TABLE "Post" ADD CONSTRAINT "Post_soundId_fkey" FOREIGN KEY ("soundId") REFERENCES "Sound"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "PostView" ADD CONSTRAINT "PostView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
