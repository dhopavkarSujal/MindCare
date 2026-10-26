-- Add user-owned profile preferences.
ALTER TABLE "User"
ADD COLUMN "preferences" JSONB;

-- Store optional consent toggles per user. All permissions default to disabled.
CREATE TABLE "ConsentPreference" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "permission" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ConsentPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ConsentPreference_userId_permission_key"
ON "ConsentPreference"("userId", "permission");

CREATE INDEX "ConsentPreference_userId_idx"
ON "ConsentPreference"("userId");

ALTER TABLE "ConsentPreference"
ADD CONSTRAINT "ConsentPreference_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE CASCADE ON UPDATE CASCADE;
