-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('STUDENT', 'COUNSELLOR', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SenderType" AS ENUM ('STUDENT', 'AI');

-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH');

-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('ARTICLE', 'GUIDE', 'EXERCISE', 'VIDEO', 'LINK');

-- CreateTable
CREATE TABLE "User" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'STUDENT',
    "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Counsellor" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "bio" TEXT,
    "specialization" TEXT,
    "qualification" TEXT,
    "experienceYears" INTEGER,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Counsellor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AvailabilitySlot" (
    "id" UUID NOT NULL,
    "counsellorId" UUID NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AvailabilitySlot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appointment" (
    "id" UUID NOT NULL,
    "studentId" UUID NOT NULL,
    "slotId" UUID NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'PENDING',
    "meetingLink" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appointment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conversation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Message" (
    "id" UUID NOT NULL,
    "conversationId" UUID NOT NULL,
    "sender" "SenderType" NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RiskAssessment" (
    "id" UUID NOT NULL,
    "messageId" UUID NOT NULL,
    "riskLevel" "RiskLevel" NOT NULL,
    "riskCode" TEXT,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RiskAssessment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MoodEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "moodScore" INTEGER NOT NULL,
    "stressScore" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoodEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JournalEntry" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "title" TEXT,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ResourceCategory" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ResourceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resource" (
    "id" UUID NOT NULL,
    "categoryId" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT,
    "type" "ResourceType" NOT NULL DEFAULT 'ARTICLE',
    "url" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeDocument" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sourceUrl" TEXT,
    "category" TEXT,
    "language" TEXT DEFAULT 'en',
    "content" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KnowledgeDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KnowledgeChunk" (
    "id" UUID NOT NULL,
    "documentId" UUID NOT NULL,
    "chunkText" TEXT NOT NULL,
    "chunkIndex" INTEGER NOT NULL,
    "vectorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KnowledgeChunk_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Counsellor_userId_key" ON "Counsellor"("userId");

-- CreateIndex
CREATE INDEX "AvailabilitySlot_counsellorId_startAt_idx" ON "AvailabilitySlot"("counsellorId", "startAt");

-- CreateIndex
CREATE UNIQUE INDEX "Appointment_slotId_key" ON "Appointment"("slotId");

-- CreateIndex
CREATE INDEX "Appointment_studentId_status_idx" ON "Appointment"("studentId", "status");

-- CreateIndex
CREATE INDEX "Conversation_userId_createdAt_idx" ON "Conversation"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "RiskAssessment_messageId_key" ON "RiskAssessment"("messageId");

-- CreateIndex
CREATE INDEX "MoodEntry_userId_createdAt_idx" ON "MoodEntry"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "JournalEntry_userId_createdAt_idx" ON "JournalEntry"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "ResourceCategory_name_key" ON "ResourceCategory"("name");

-- CreateIndex
CREATE INDEX "Resource_categoryId_idx" ON "Resource"("categoryId");

-- CreateIndex
CREATE INDEX "KnowledgeChunk_documentId_idx" ON "KnowledgeChunk"("documentId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Counsellor" ADD CONSTRAINT "Counsellor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AvailabilitySlot" ADD CONSTRAINT "AvailabilitySlot_counsellorId_fkey" FOREIGN KEY ("counsellorId") REFERENCES "Counsellor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "AvailabilitySlot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RiskAssessment" ADD CONSTRAINT "RiskAssessment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoodEntry" ADD CONSTRAINT "MoodEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ResourceCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KnowledgeChunk" ADD CONSTRAINT "KnowledgeChunk_documentId_fkey" FOREIGN KEY ("documentId") REFERENCES "KnowledgeDocument"("id") ON DELETE CASCADE ON UPDATE CASCADE;
