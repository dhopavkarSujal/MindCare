-- Link each counsellor profile to one authenticated COUNSELOR user.
ALTER TABLE "Counsellor"
ADD COLUMN "userId" UUID;

CREATE UNIQUE INDEX "Counsellor_userId_key"
ON "Counsellor"("userId");

ALTER TABLE "Counsellor"
ADD CONSTRAINT "Counsellor_userId_fkey"
FOREIGN KEY ("userId") REFERENCES "User"("id")
ON DELETE SET NULL ON UPDATE CASCADE;

-- Give rejected requests and completed sessions explicit lifecycle states.
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'REJECTED';
ALTER TYPE "AppointmentStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
