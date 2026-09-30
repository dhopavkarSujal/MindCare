-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "isPinned" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Conversation_userId_isPinned_updatedAt_idx" ON "Conversation"("userId", "isPinned", "updatedAt");
