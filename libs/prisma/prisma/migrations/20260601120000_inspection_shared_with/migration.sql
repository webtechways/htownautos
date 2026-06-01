-- Implicit many-to-many join table for VehicleInspection <-> User
-- ("sharedWith" — clients granted read access to an inspection).
-- Prisma convention: _<RelationName> with columns A (alphabetically first
-- model: User) and B (VehicleInspection).
CREATE TABLE "_InspectionSharedWith" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_InspectionSharedWith_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE INDEX "_InspectionSharedWith_B_index" ON "_InspectionSharedWith"("B");

-- AddForeignKey
ALTER TABLE "_InspectionSharedWith" ADD CONSTRAINT "_InspectionSharedWith_A_fkey" FOREIGN KEY ("A") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_InspectionSharedWith" ADD CONSTRAINT "_InspectionSharedWith_B_fkey" FOREIGN KEY ("B") REFERENCES "vehicle_inspections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
