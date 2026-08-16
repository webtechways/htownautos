import { InspectionErrorLevel } from '@prisma/client';
export declare class CreateInspectionErrorCodeDto {
    code: string;
    description?: string;
    level?: InspectionErrorLevel;
    note?: string;
    voiceNoteTranscription?: string;
    sortOrder?: number;
}
